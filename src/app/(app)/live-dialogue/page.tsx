
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessagesSquare, Sparkles, Loader2, Download, Image as ImageIcon, Music, FileText as FileTextIcon } from "lucide-react";
import Image from "next/image";
import { generateLiveDialogue, type GenerateLiveDialogueInput, type GenerateLiveDialogueOutput } from '@/ai/flows/generate-live-dialogue';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { canUseFeature, recordFeatureUsage, FEATURE_NAMES } from '@/lib/usage-limiter';
import Link from 'next/link';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { playNotificationSound } from '@/utils/audioPlayer';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';


const genres = ['African Story', 'Funny/Hilarious', 'Financial', 'Real Life Hustle', 'Malawian Story', 'Sci-Fi', 'Fantasy', 'Mystery'];
const characterCounts = ['Normal (2-3 characters)', 'Large (4+ characters)'];

export default function LiveDialoguePage() {
  const [title, setTitle] = useState<string>("");
  const [genre, setGenre] = useState<string>(genres[0]);
  const [characterCount, setCharacterCount] = useState<string>(characterCounts[0]);
  const [withPictures, setWithPictures] = useState<boolean>(true);
  
  const [generatedDialogue, setGeneratedDialogue] = useState<GenerateLiveDialogueOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const { soundSettings } = useSoundSettings();

  const showUpgradeToast = () => {
    toast({
      title: "Daily Limit Reached",
      description: "You've used all your free dialogue generations for today.",
      variant: "destructive",
      action: (<Link href="/vip"><Button variant="secondary" size="sm">Upgrade to VIP</Button></Link>),
    });
  };

  const handleGenerateDialogue = async () => {
    if (!title) {
      toast({ title: "Missing Field", description: "Please enter a title or topic for your dialogue.", variant: "destructive" });
      return;
    }

    if (!canUseFeature(FEATURE_NAMES.LIVE_DIALOGUE_GENERATOR)) {
      showUpgradeToast();
      return;
    }

    setIsLoading(true);
    setProgressValue(10);
    setGeneratedDialogue(null);
    
    const progressInterval = setInterval(() => {
        setProgressValue(prev => Math.min(prev + 5, 90));
    }, 1500);

    try {
      const input: GenerateLiveDialogueInput = { 
        title, 
        genre: genre as GenerateLiveDialogueInput['genre'], 
        characterCount: characterCount as GenerateLiveDialogueInput['characterCount'], 
        withPictures 
      };
      const result = await generateLiveDialogue(input);
      setGeneratedDialogue(result);
      recordFeatureUsage(FEATURE_NAMES.LIVE_DIALOGUE_GENERATOR);
      toast({ title: "Success", description: "Your dialogue has been generated!" });
      playNotificationSound(soundSettings);
    } catch (error) {
      console.error("Error generating dialogue:", error);
      toast({ title: "Error", description: "Failed to generate dialogue. " + (error as Error).message, variant: "destructive" });
    } finally {
      clearInterval(progressInterval);
      setProgressValue(100);
      setIsLoading(false);
      setTimeout(() => setProgressValue(0), 1500);
    }
  };

  const getFullText = (dialogue: GenerateLiveDialogueOutput | null): string => {
    if (!dialogue) return "";
    let text = `Title: ${dialogue.title}\n\n`;
    dialogue.scenes.forEach(scene => {
      text += `--- SCENE ${scene.sceneNumber} ---\n`;
      text += `[Setting: ${scene.sceneDescription}]\n\n`;
      scene.dialogue.forEach(d => {
        text += `${d.speaker.toUpperCase()}:\n${d.line}\n\n`;
      });
    });
    return text.trim();
  };
  
  const handleDownloadText = () => {
    const text = getFullText(generatedDialogue);
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${generatedDialogue?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'dialogue'}.txt`);
    toast({ title: "Downloaded", description: "Script TXT file downloaded." });
  };
  
  const handleDownloadAudio = () => {
    if (!generatedDialogue?.fullAudioUrl) return;
    saveAs(generatedDialogue.fullAudioUrl, `${generatedDialogue.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'dialogue'}.wav`);
    toast({ title: "Downloaded", description: "Full audio WAV file downloaded." });
  };
  
  const handleDownloadImages = async () => {
    if (!generatedDialogue?.scenes) return;
    const images = generatedDialogue.scenes.map(s => s.imageUrl).filter((url): url is string => !!url);
    if (images.length === 0) {
      toast({ title: "No Images", description: "There are no images to download.", variant: "destructive"});
      return;
    }

    const zip = new JSZip();
    for (let i = 0; i < images.length; i++) {
        const url = images[i];
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            zip.file(`scene_${i + 1}.png`, blob);
        } catch (error) {
            console.error(`Failed to fetch and add image ${i+1} to zip.`, error);
            toast({ title: "Download Error", description: `Could not download image for scene ${i+1}.`, variant: "destructive"});
        }
    }

    try {
        const content = await zip.generateAsync({ type: 'blob' });
        const safeTitle = generatedDialogue.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        saveAs(content, `${safeTitle || 'dialogue'}_images.zip`);
        toast({ title: "Downloaded", description: "Images ZIP file downloaded." });
    } catch(error) {
         console.error(`Failed to generate zip file.`, error);
         toast({ title: "Download Error", description: `Could not generate ZIP file.`, variant: "destructive"});
    }
  };


  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <MessagesSquare className="mr-3 h-8 w-8" /> AI Live Dialogue Generator
          </CardTitle>
          <CardDescription>Create multi-speaker audio stories with character voices, soundscapes, and optional AI-generated images.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="font-headline text-xl">Dialogue Setup</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label htmlFor="title">Title / Topic</Label><Input id="title" placeholder="e.g., The Lost Medallion of Nabitenga" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><Label htmlFor="genre">Genre</Label><Select value={genre} onValueChange={setGenre}><SelectTrigger id="genre"><SelectValue/></SelectTrigger><SelectContent>{genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></div>
            <div><Label htmlFor="characterCount">Character Count</Label><Select value={characterCount} onValueChange={setCharacterCount}><SelectTrigger id="characterCount"><SelectValue/></SelectTrigger><SelectContent>{characterCounts.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div className="flex items-center space-x-2 pt-2"><Switch id="withPictures" checked={withPictures} onCheckedChange={setWithPictures}/><Label htmlFor="withPictures">Generate Pictures</Label></div>
            <Button onClick={handleGenerateDialogue} disabled={isLoading} className="w-full">
              <Sparkles className="mr-2 h-5 w-5" /> {isLoading ? "Generating Dialogue..." : "Generate Dialogue"}
            </Button>
            {isLoading && <Progress value={progressValue} className="w-full mt-2" />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="font-headline text-xl">Generated Dialogue</CardTitle></CardHeader>
          <CardContent className="min-h-[500px]">
            {isLoading && !generatedDialogue && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /><p className="text-lg">AI is casting characters and building your story...</p>
              </div>
            )}
            {!isLoading && !generatedDialogue && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessagesSquare className="h-16 w-16 mb-4" /><p>Your generated dialogue will appear here.</p>
              </div>
            )}
            {generatedDialogue && (
              <div className="space-y-6">
                <h2 className="font-headline text-3xl text-center text-accent">{generatedDialogue.title}</h2>
                {generatedDialogue.fullAudioUrl && (
                  <Card className="bg-secondary/20"><CardContent className="p-4"><audio controls src={generatedDialogue.fullAudioUrl} className="w-full">Your browser does not support the audio element.</audio></CardContent></Card>
                )}
                <ScrollArea className="h-[calc(100vh-32rem)] border rounded-md p-4 bg-background">
                  {generatedDialogue.scenes.map((scene, index) => (
                    <div key={index} className="mb-6 pb-6 border-b last:border-b-0">
                      <h3 className="font-headline text-lg text-primary italic mb-2">Scene {scene.sceneNumber}: {scene.sceneDescription}</h3>
                      {scene.imageUrl && (
                        <div className="relative aspect-video w-full my-4 rounded-md overflow-hidden shadow-md">
                          <Image src={scene.imageUrl} alt={`Illustration for scene ${index + 1}`} layout="fill" objectFit="cover" data-ai-hint="dialogue scene illustration" />
                        </div>
                      )}
                      <div className="space-y-3 text-sm">
                        {scene.dialogue.map((d, dIndex) => (
                           <p key={dIndex}>
                               <strong className="text-accent">{d.speaker}:</strong> <span className="text-foreground/80">{d.line}</span>
                           </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
                 <CardFooter className="justify-center pt-6 border-t gap-2 !mt-8 !px-0">
                    <Button variant="outline" onClick={handleDownloadText} disabled={!generatedDialogue}><FileTextIcon className="mr-2 h-4 w-4"/>Download Script</Button>
                    <Button variant="outline" onClick={handleDownloadAudio} disabled={!generatedDialogue?.fullAudioUrl}><Music className="mr-2 h-4 w-4"/>Download Audio</Button>
                    {withPictures && <Button variant="outline" onClick={handleDownloadImages} disabled={!generatedDialogue || !generatedDialogue.scenes.some(s=>s.imageUrl)}><ImageIcon className="mr-2 h-4 w-4"/>Download Images</Button>}
                </CardFooter>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
