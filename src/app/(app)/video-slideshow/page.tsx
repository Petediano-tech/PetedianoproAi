
"use client";
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Film, Sparkles, Loader2, Play, Pause, Fullscreen, Download, FileText, Image as ImageIcon } from "lucide-react";
import { generateVideoSlideshow } from '@/ai/flows/generate-video-slideshow';
import { type GenerateVideoSlideshowInput } from '@/ai/flows/video-slideshow.types';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { playNotificationSound } from '@/utils/audioPlayer';
import NextImage from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Slide {
  text: string;
  imageDescription: string;
}

interface GeneratedSlide {
  text: string;
  imageUrl: string;
  audioUrl: string;
}

export default function VideoSlideshowCreatorPage() {
  const [script, setScript] = useState<string>('');
  const [generatedSlides, setGeneratedSlides] = useState<GeneratedSlide[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [progressText, setProgressText] = useState('');
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const { soundSettings } = useSoundSettings();

  const parseScript = (): Slide[] => {
    return script
      .split('---')
      .map(part => {
        const lines = part.trim().split('\n');
        const textLine = lines.find(l => l.toLowerCase().startsWith('text:'));
        const imageLine = lines.find(l => l.toLowerCase().startsWith('image:'));
        
        if (textLine && imageLine) {
          return {
            text: textLine.substring(5).trim(),
            imageDescription: imageLine.substring(6).trim(),
          };
        }
        return null;
      })
      .filter((s): s is Slide => s !== null);
  };

  const handleGenerateVideo = async () => {
    const slides = parseScript();
    if (slides.length === 0) {
      toast({ title: "Invalid Script", description: "Please format your script correctly with '---' separators and 'Text:' and 'Image:' lines.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setGeneratedSlides(null);
    setCurrentSlide(0);
    setProgressValue(5);
    setProgressText('Preparing to generate...');
    
    try {
      const input: GenerateVideoSlideshowInput = { title: "AI Generated Slideshow", slides };
      const result = await generateVideoSlideshow(input);
      
      setProgressText('Slideshow components generated!');
      setProgressValue(100);

      setGeneratedSlides(result.slides);
      toast({ title: "Success", description: "Video components generated successfully!" });
      playNotificationSound(soundSettings);
    } catch (error) {
      console.error("Error generating video:", error);
      toast({ title: "Error", description: "Failed to generate video. " + (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgressValue(0), 1500);
    }
  };

  // Slideshow playback logic
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const playNextSlide = () => {
      setCurrentSlide(prev => (prev + 1) % (generatedSlides?.length || 1));
    };

    if (isPlaying && generatedSlides && audioElement) {
      audioElement.src = generatedSlides[currentSlide].audioUrl;
      audioElement.play().catch(e => console.error("Audio play failed:", e));
      audioElement.onended = playNextSlide;
    } else if (!isPlaying && audioElement) {
      audioElement.pause();
    }
    
    return () => {
      if (audioElement) {
        audioElement.onended = null;
      }
    };
  }, [isPlaying, currentSlide, generatedSlides]);

  const togglePlayback = () => {
    if (!generatedSlides) return;
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setCurrentSlide(0); // Restart from beginning
      setIsPlaying(true);
    }
  };

  const handleFullscreen = () => {
    videoContainerRef.current?.requestFullscreen();
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Film className="mr-3 h-8 w-8" /> AI Video Slideshow Creator
          </CardTitle>
          <CardDescription>Write a simple script, and let AI generate images and voiceover to create a video slideshow.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Video Script</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="script">Script Input</Label>
               <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>How to Format</AlertTitle>
                  <AlertDescription className="text-xs">
                    Separate each slide with `---`. Each slide needs one `Text:` line for voiceover and one `Image:` line for the visual description.
                  </AlertDescription>
                </Alert>
              <Textarea
                id="script"
                placeholder={`Text: Welcome to our presentation on ancient Rome.\nImage: A grand picture of the Roman Colosseum at sunset.\n---\nText: We will explore its history, culture, and architecture.\nImage: A bustling Roman street with citizens in togas.`}
                value={script}
                onChange={(e) => setScript(e.target.value)}
                rows={10}
                className="font-mono text-xs mt-2"
              />
            </div>
            <Button onClick={handleGenerateVideo} disabled={isLoading} className="w-full">
              <Sparkles className="mr-2 h-5 w-5" /> {isLoading ? "Generating..." : "Generate Video Components"}
            </Button>
            {isLoading && <Progress value={progressValue} className="w-full mt-2" />}
            {isLoading && <p className="text-sm text-center text-muted-foreground">{progressText}</p>}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Video Preview</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[400px] flex flex-col items-center justify-center">
            {isLoading && (
               <div className="flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg">AI is producing your video...</p>
              </div>
            )}
            {!isLoading && !generatedSlides && (
              <div className="text-center text-muted-foreground">
                <Film className="mx-auto h-16 w-16 mb-4" />
                <p>Your generated video will appear here.</p>
              </div>
            )}
            {generatedSlides && (
              <div className="w-full space-y-4">
                <div ref={videoContainerRef} className="relative aspect-video w-full max-w-2xl mx-auto border rounded-lg overflow-hidden shadow-lg bg-black flex items-center justify-center">
                  <NextImage src={generatedSlides[currentSlide].imageUrl} alt={`Slide ${currentSlide + 1}`} layout="fill" objectFit="cover" data-ai-hint="slideshow image" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 text-white text-center">
                    <p>{generatedSlides[currentSlide].text}</p>
                  </div>
                  <audio ref={audioRef} hidden />
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button variant="default" onClick={togglePlayback}>
                    {isPlaying ? <Pause className="mr-2 h-4 w-4"/> : <Play className="mr-2 h-4 w-4"/>}
                    {isPlaying ? "Pause" : "Play Slideshow"}
                  </Button>
                   <Button variant="outline" onClick={handleFullscreen}>
                    <Fullscreen className="mr-2 h-4 w-4" /> Fullscreen
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
