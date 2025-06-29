
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Film, Sparkles, Loader2, BookOpen, Download, Music, Image as ImageIcon, Video, BookText } from "lucide-react";
import Image from "next/image";
import { 
  generateAnimationConceptText, type GenerateAnimationConceptTextInput, type GenerateAnimationConceptTextOutput,
  generateImageForAnimationScene, type GenerateImageForSceneInput,
  generateAudioForAnimationScene, type GenerateAudioForSceneInput,
} from '@/ai/flows/generate-animation-concept';
import { toast } from '@/hooks/use-toast';
import { canUseFeature, recordFeatureUsage, FEATURE_NAMES } from '@/lib/usage-limiter';
import Link from 'next/link';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { playNotificationSound } from '@/utils/audioPlayer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const animeStyles = ['Vibrant Shonen', 'Elegant Shojo', 'Chibi/Kawaii', 'Classic 90s', 'Dark Fantasy', 'Cyberpunk', 'Studio Ghibli-esque'];
const availableVoices = {
  'achernar': 'Achernar', 'algenib': 'Algenib', 'gacrux': 'Gacrux', 'rasalgethi': 'Rasalgethi', 'schedar': 'Schedar', 'sulafat': 'Sulafat', 'zubenelgenubi': 'Zubenelgenubi', 'charon': 'Charon', 'puck': 'Puck',
  'aoede': 'Aoede', 'leda': 'Leda', 'callirrhoe': 'Callirrhoe', 'autonoe': 'Autonoe', 'erinome': 'Erinome', 'kore': 'Kore'
} as const;
const maleVoiceKeys = ['achernar', 'algenib', 'gacrux', 'rasalgethi', 'schedar', 'sulafat', 'zubenelgenubi', 'charon', 'puck'];
const femaleVoiceKeys = ['aoede', 'leda', 'callirrhoe', 'autonoe', 'erinome', 'kore'];
type VoiceKey = keyof typeof availableVoices;

interface PageState {
  text: string;
  sceneDescription: string;
  imageUrl?: string;
  audioUrl?: string;
  isImageLoading: boolean;
  isAudioLoading: boolean;
}

interface StoryState {
  title: string;
  pages: PageState[];
}

export default function AnimeStoryGeneratorPage() {
  const [prompt, setPrompt] = useState<string>("");
  const [style, setStyle] = useState<string>(animeStyles[0]);
  const [language, setLanguage] = useState<string>("English");
  const [voice, setVoice] = useState<VoiceKey>('achernar');
  const [story, setStory] = useState<StoryState | null>(null);

  const [isStoryLoading, setIsStoryLoading] = useState(false);
  const [isBatchImageLoading, setIsBatchImageLoading] = useState(false);
  
  const { soundSettings } = useSoundSettings();

  const showUpgradeToast = () => {
    toast({
      title: "Daily Limit Reached",
      description: "You've used all your free generations for today.",
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

  const handleGenerateStoryText = async () => {
    if (!prompt) {
      toast({ title: "Error", description: "Please enter a story prompt.", variant: "destructive" });
      return;
    }
    if (!canUseFeature(FEATURE_NAMES.ANIME_STORY_GENERATOR)) {
      showUpgradeToast(); return;
    }

    setIsStoryLoading(true);
    setStory(null);
    try {
      const input: GenerateAnimationConceptTextInput = { prompt, style, language };
      const result = await generateAnimationConceptText(input);
      if (result.pages.length === 0) {
        toast({ title: "Generation Failed", description: "The AI could not create a story from your prompt. Please try again with a different idea.", variant: "destructive"});
        return;
      }
      setStory({
        title: result.title,
        pages: result.pages.map(p => ({
          text: p.text,
          sceneDescription: p.sceneDescription,
          isImageLoading: false,
          isAudioLoading: false,
        }))
      });
      recordFeatureUsage(FEATURE_NAMES.ANIME_STORY_GENERATOR);
      toast({ title: "Success", description: "Story text generated!" });
      playNotificationSound(soundSettings);
    } catch (error) {
      console.error("Error generating story text:", error);
      toast({ title: "Error", description: "Failed to generate story text. " + (error as Error).message, variant: "destructive" });
    } finally {
      setIsStoryLoading(false);
    }
  };
  
  const handleGenerateAllImages = async () => {
    if (!story) return;

    setIsBatchImageLoading(true);
    // Set loading state for all pages
    setStory(s => s ? { ...s, pages: s.pages.map(p => ({ ...p, isImageLoading: true })) } : null);

    const updatedPages = [...story.pages];
    for (let i = 0; i < updatedPages.length; i++) {
        if (!canUseFeature(FEATURE_NAMES.ANIME_STORY_GENERATOR)) {
            showUpgradeToast(); break;
        }
        try {
            const input: GenerateImageForSceneInput = { sceneDescription: updatedPages[i].sceneDescription, style };
            const result = await generateImageForAnimationScene(input);
            updatedPages[i].imageUrl = result.imageUrl;
            recordFeatureUsage(FEATURE_NAMES.ANIME_STORY_GENERATOR);
        } catch (error) {
            console.error(`Error generating image for scene ${i + 1}:`, error);
            toast({ title: `Image ${i+1} Failed`, description: "Could not generate image for this scene.", variant: "destructive" });
        } finally {
            updatedPages[i].isImageLoading = false;
            // Update state after each image generation to show progress
            setStory(s => s ? { ...s, pages: [...updatedPages] } : null);
        }
    }
    toast({ title: "Image Generation Complete" });
    setIsBatchImageLoading(false);
  };

  const handleGenerateAudio = async (pageIndex: number) => {
    if (!story) return;
     if (!canUseFeature(FEATURE_NAMES.ANIME_STORY_GENERATOR)) {
        showUpgradeToast(); return;
    }

    setStory(s => {
      if (!s) return null;
      const newPages = [...s.pages];
      newPages[pageIndex].isAudioLoading = true;
      return { ...s, pages: newPages };
    });

    try {
      const page = story.pages[pageIndex];
      const input: GenerateAudioForSceneInput = { text: page.text, voice };
      const result = await generateAudioForAnimationScene(input);
      
      setStory(s => {
        if (!s) return null;
        const newPages = [...s.pages];
        newPages[pageIndex].audioUrl = result.audioUrl;
        return { ...s, pages: newPages };
      });
      recordFeatureUsage(FEATURE_NAMES.ANIME_STORY_GENERATOR);

    } catch (error) {
      console.error(`Error generating audio for scene ${pageIndex + 1}:`, error);
      toast({ title: `Audio ${pageIndex+1} Failed`, description: "Could not generate audio for this scene.", variant: "destructive" });
    } finally {
      setStory(s => {
        if (!s) return null;
        const newPages = [...s.pages];
        newPages[pageIndex].isAudioLoading = false;
        return { ...s, pages: newPages };
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Film className="mr-3 h-8 w-8" /> AI Anime Story Generator
          </CardTitle>
          <CardDescription>A new, more reliable workflow. First, generate the story. Then, generate images and audio on demand.</CardDescription>
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
              <Textarea id="prompt" placeholder="e.g., A lost robot searching for its creator." value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3}/>
            </div>
             <div>
              <Label htmlFor="language" className="block mb-2 font-medium">Language</Label>
               <Input id="language" placeholder="e.g., English, Chichewa" value={language} onChange={e => setLanguage(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="style" className="block mb-2 font-medium">Anime Art Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger id="style"><SelectValue /></SelectTrigger>
                <SelectContent>{animeStyles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="voice" className="block mb-2 font-medium">Narration Voice</Label>
              <Select value={voice} onValueChange={v => setVoice(v as VoiceKey)}>
                <SelectTrigger id="voice"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <Label className="px-2 text-xs text-muted-foreground">Male Voices</Label>
                    {maleVoiceKeys.map(key => <SelectItem key={key} value={key}>{availableVoices[key]}</SelectItem>)}
                    <Label className="px-2 text-xs text-muted-foreground">Female Voices</Label>
                    {femaleVoiceKeys.map(key => <SelectItem key={key} value={key}>{availableVoices[key]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateStoryText} disabled={isStoryLoading || !prompt} className="w-full">
              <BookText className="mr-2 h-5 w-5" /> {isStoryLoading ? "Writing Story..." : "1. Generate Story Text"}
            </Button>
            {isStoryLoading && <p className="text-sm text-center text-muted-foreground">AI is writing...</p>}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Generated Anime Story</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[500px]">
            {isStoryLoading && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg">AI is crafting your story text...</p>
              </div>
            )}
            {!isStoryLoading && !story && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <BookOpen className="h-16 w-16 mb-4" />
                <p>Your anime story will appear here after generation.</p>
              </div>
            )}
            {story && (
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="space-y-6 p-1">
                  <h2 className="font-headline text-3xl text-center text-accent">{story.title}</h2>
                   <div className="text-center">
                    <Button onClick={handleGenerateAllImages} disabled={isBatchImageLoading}>
                      <ImageIcon className="mr-2 h-5 w-5" />
                      {isBatchImageLoading ? "Generating Images..." : "2. Generate All Images"}
                    </Button>
                  </div>
                  <div className="space-y-8">
                    {story.pages.map((page, index) => (
                      <Card key={index} className="bg-card border shadow-sm overflow-hidden">
                        <CardHeader>
                          <CardTitle className="text-lg">Scene {index + 1}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                           <div className="relative aspect-video w-full rounded-md overflow-hidden shadow-inner bg-secondary/30 flex items-center justify-center">
                              {page.imageUrl ? (
                                <Image src={page.imageUrl} alt={`Illustration for scene ${index + 1}`} layout="fill" objectFit="cover" data-ai-hint="anime story illustration" />
                              ) : page.isImageLoading ? (
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              ) : (
                                <ImageIcon className="h-12 w-12 text-muted-foreground" />
                              )}
                            </div>
                          <p className="font-body text-base leading-relaxed whitespace-pre-line">{page.text}</p>
                          
                          {page.audioUrl ? (
                             <audio controls src={page.audioUrl} className="w-full">Your browser does not support the audio element.</audio>
                          ) : page.isAudioLoading ? (
                            <Button disabled className="w-full"><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Generating...</Button>
                          ) : (
                             <Button onClick={() => handleGenerateAudio(index)} variant="outline" className="w-full">
                                <Music className="mr-2 h-4 w-4" /> 3. Generate Audio
                             </Button>
                          )}
                        </CardContent>
                        <CardFooter className="bg-secondary/30 p-2 flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleDownload(page.imageUrl!, `scene_${index+1}_image.png`)} disabled={!page.imageUrl}>Image</Button>
                            <Button variant="outline" size="sm" onClick={() => handleDownload(page.audioUrl!, `scene_${index+1}_audio.wav`)} disabled={!page.audioUrl}>Audio</Button>
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
