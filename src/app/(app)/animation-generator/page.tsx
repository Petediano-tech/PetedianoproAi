
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Film, Sparkles, Loader2, BookOpen, Download, Music, Archive } from "lucide-react";
import Image from "next/image";
import { generateAnimationConcept, type GenerateAnimationConceptInput, type GenerateAnimationConceptOutput } from '@/ai/flows/generate-animation-concept';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { canUseFeature, recordFeatureUsage, FEATURE_NAMES } from '@/lib/usage-limiter';
import Link from 'next/link';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { playNotificationSound } from '@/utils/audioPlayer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import JSZip from 'jszip';

const animeStyles = ['Vibrant Shonen', 'Elegant Shojo', 'Chibi/Kawaii', 'Classic 90s', 'Dark Fantasy', 'Cyberpunk', 'Studio Ghibli-esque'];
const availableVoices = {
  // Male Voices
  'achernar': 'Achernar', 'algenib': 'Algenib', 'gacrux': 'Gacrux', 'rasalgethi': 'Rasalgethi', 'schedar': 'Schedar', 'sulafat': 'Sulafat', 'zubenelgenubi': 'Zubenelgenubi', 'charon': 'Charon', 'puck': 'Puck',
  // Female Voices
  'aoede': 'Aoede', 'leda': 'Leda', 'callirrhoe': 'Callirrhoe', 'autonoe': 'Autonoe', 'erinome': 'Erinome', 'kore': 'Kore'
} as const;
const maleVoiceKeys = ['achernar', 'algenib', 'gacrux', 'rasalgethi', 'schedar', 'sulafat', 'zubenelgenubi', 'charon', 'puck'];
const femaleVoiceKeys = ['aoede', 'leda', 'callirrhoe', 'autonoe', 'erinome', 'kore'];
type VoiceKey = keyof typeof availableVoices;

export default function AnimeStoryGeneratorPage() {
  const [prompt, setPrompt] = useState<string>("");
  const [style, setStyle] = useState<string>(animeStyles[0]);
  const [language, setLanguage] = useState<string>("English");
  const [voice, setVoice] = useState<VoiceKey>('achernar');
  const [generatedStory, setGeneratedStory] = useState<GenerateAnimationConceptOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const { soundSettings } = useSoundSettings();

  const showUpgradeToast = () => {
    toast({
      title: "Daily Limit Reached",
      description: "You've used all your free story generations for today.",
      variant: "destructive",
      action: ( <Link href="/vip"> <Button variant="secondary" size="sm">Upgrade to VIP</Button> </Link> ),
    });
  };
  
  const handleDownload = (dataUri: string, filename: string) => {
    if (!dataUri) return;
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleDownloadText = (text: string, filename: string) => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    handleDownload(url, filename);
    URL.revokeObjectURL(url);
  };
  
  const handleDownloadAll = async () => {
    if (!generatedStory) return;
    setIsDownloading(true);
    toast({ title: "Zipping files...", description: "Please wait while we prepare your download." });
    
    try {
        const zip = new JSZip();
        
        // Add story title and all text to a single file
        let fullStoryText = `Title: ${generatedStory.title}\n\n`;

        for (const [index, page] of generatedStory.pages.entries()) {
            const sceneFolder = zip.folder(`scene_${index + 1}`);
            if (!sceneFolder) continue;

            // Add text to scene folder and to full story text
            sceneFolder.file(`text.txt`, page.text);
            fullStoryText += `--- Scene ${index + 1} ---\n${page.text}\n\n`;

            // Add image
            if (page.imageUrl) {
                const response = await fetch(page.imageUrl);
                const blob = await response.blob();
                sceneFolder.file(`image.png`, blob);
            }
            // Add audio
            if (page.audioUrl) {
                const response = await fetch(page.audioUrl);
                const blob = await response.blob();
                sceneFolder.file(`audio.wav`, blob);
            }
        }
        
        zip.file('full_story.txt', fullStoryText.trim());

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const safeTitle = generatedStory.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        handleDownload(URL.createObjectURL(zipBlob), `${safeTitle || 'anime_story'}.zip`);
        toast({ title: "Success!", description: "Your story has been downloaded as a ZIP file." });

    } catch (error) {
        console.error("Error creating ZIP file:", error);
        toast({ title: "Error", description: "Could not create the ZIP file.", variant: "destructive" });
    } finally {
        setIsDownloading(false);
    }
  };

  const handleGenerateStory = async () => {
    if (!prompt) {
      toast({ title: "Error", description: "Please enter a story prompt.", variant: "destructive" });
      return;
    }

    if (!canUseFeature(FEATURE_NAMES.ANIME_STORY_GENERATOR)) {
      showUpgradeToast();
      return;
    }

    setIsLoading(true);
    setProgressValue(10);
    setGeneratedStory(null);
    
    const progressInterval = setInterval(() => {
        setProgressValue(prev => Math.min(prev + 5, 90));
    }, 2000);

    try {
      const input: GenerateAnimationConceptInput = { prompt, style, language, voice };
      const result = await generateAnimationConcept(input);
      setGeneratedStory(result);
      recordFeatureUsage(FEATURE_NAMES.ANIME_STORY_GENERATOR);
      toast({ title: "Success", description: "Anime story generated successfully!" });
      playNotificationSound(soundSettings);
    } catch (error) {
      console.error("Error generating anime story:", error);
      toast({ title: "Error", description: "Failed to generate story. " + (error as Error).message, variant: "destructive" });
    } finally {
      clearInterval(progressInterval);
      setProgressValue(100);
      setIsLoading(false);
      setTimeout(() => setProgressValue(0), 1500);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Film className="mr-3 h-8 w-8" /> AI Anime Story Generator
          </CardTitle>
          <CardDescription>Describe your idea. AI will write the story, generate pictures, and create audio narration for each scene.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Story Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="prompt" className="block mb-2 font-medium">Story Prompt</Label>
              <Textarea 
                id="prompt" 
                placeholder="e.g., A lost robot searching for its creator in a magical forest." 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
              />
            </div>
             <div>
              <Label htmlFor="language" className="block mb-2 font-medium">Language</Label>
               <Input id="language" placeholder="e.g., English, Chichewa" value={language} onChange={e => setLanguage(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="style" className="block mb-2 font-medium">Anime Art Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger id="style"><SelectValue placeholder="Select style" /></SelectTrigger>
                <SelectContent>{animeStyles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="voice" className="block mb-2 font-medium">Narration Voice</Label>
              <Select value={voice} onValueChange={v => setVoice(v as VoiceKey)}>
                <SelectTrigger id="voice"><SelectValue placeholder="Select voice" /></SelectTrigger>
                <SelectContent>
                    <Label className="px-2 text-xs text-muted-foreground">Male Voices</Label>
                    {maleVoiceKeys.map(key => <SelectItem key={key} value={key}>{availableVoices[key]}</SelectItem>)}
                    <Label className="px-2 text-xs text-muted-foreground">Female Voices</Label>
                    {femaleVoiceKeys.map(key => <SelectItem key={key} value={key}>{availableVoices[key]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateStory} disabled={isLoading || !prompt} className="w-full">
              <Sparkles className="mr-2 h-5 w-5" /> {isLoading ? "Generating Story..." : "Generate Story"}
            </Button>
            {isLoading && <Progress value={progressValue} className="w-full mt-2" />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Generated Anime Story</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[500px]">
            {isLoading && !generatedStory && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg">AI is crafting your anime story...</p>
                <p className="text-sm">This might take a while, generation is intensive.</p>
              </div>
            )}
            {!isLoading && !generatedStory && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <BookOpen className="h-16 w-16 mb-4" />
                <p>Your anime story, pictures, and audio will appear here.</p>
              </div>
            )}
            {generatedStory && (
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="space-y-6 p-1">
                  <h2 className="font-headline text-3xl text-center text-accent">{generatedStory.title}</h2>
                   <div className="text-center">
                    <Button onClick={handleDownloadAll} disabled={isDownloading}>
                      {isDownloading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Archive className="h-4 w-4 mr-2" />}
                      Download All as ZIP
                    </Button>
                  </div>
                  <div className="space-y-8">
                    {generatedStory.pages.map((page, index) => (
                      <Card key={index} className="bg-card border shadow-sm overflow-hidden">
                        <CardContent className="p-4 space-y-4">
                           {page.imageUrl && (
                            <div className="relative aspect-video w-full rounded-md overflow-hidden shadow-inner">
                              <Image src={page.imageUrl} alt={`Illustration for scene ${index + 1}`} layout="fill" objectFit="cover" data-ai-hint="anime story illustration" />
                            </div>
                          )}
                          <p className="font-body text-base leading-relaxed whitespace-pre-line">{page.text}</p>
                          {page.audioUrl && (
                             <audio controls src={page.audioUrl} className="w-full">
                                Your browser does not support the audio element.
                            </audio>
                          )}
                        </CardContent>
                        <CardFooter className="bg-secondary/30 p-2 flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleDownload(page.imageUrl, `scene_${index+1}_image.png`)}>Image</Button>
                            <Button variant="outline" size="sm" onClick={() => handleDownload(page.audioUrl, `scene_${index+1}_audio.wav`)}>Audio</Button>
                            <Button variant="outline" size="sm" onClick={() => handleDownloadText(page.text, `scene_${index+1}_text.txt`)}>Text</Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
