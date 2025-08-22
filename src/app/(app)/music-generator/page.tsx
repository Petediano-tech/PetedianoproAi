
"use client";
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Music, Sparkles, Loader2, Download, Copy, Play, Pause } from "lucide-react";
import { generateMusic } from '@/ai/flows/generate-music';
import type { GenerateMusicInput, GenerateMusicOutput } from '@/ai/flows/music.types';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { canUseFeature, recordFeatureUsage, FEATURE_NAMES } from '@/lib/usage-limiter';
import Link from 'next/link';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { playNotificationSound } from '@/utils/audioPlayer';

export default function MusicGeneratorPage() {
  const [prompt, setPrompt] = useState<string>("");
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const { soundSettings } = useSoundSettings();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const showUpgradeToast = () => {
    toast({
      title: "Daily Limit Reached",
      description: "You've used all your free music generations for today.",
      variant: "destructive",
      action: ( <Link href="/vip"> <Button variant="secondary" size="sm">Upgrade to VIP</Button> </Link> ),
    });
  };

  const handleGenerateMusic = async () => {
    if (!prompt) {
      toast({ title: "Missing Prompt", description: "Please enter a description for the music.", variant: "destructive" });
      return;
    }
    if (!await canUseFeature(FEATURE_NAMES.MUSIC_GENERATOR)) {
      showUpgradeToast();
      return;
    }

    setIsLoading(true);
    setProgressValue(10);
    setGeneratedAudio(null);
    
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    const progressInterval = setInterval(() => {
        setProgressValue(prev => Math.min(prev + 5, 90));
    }, 1200);

    try {
      const input: GenerateMusicInput = { prompt };
      const result: GenerateMusicOutput = await generateMusic(input);
      setGeneratedAudio(result.audioDataUri);
      await recordFeatureUsage(FEATURE_NAMES.MUSIC_GENERATOR);
      toast({ title: "Success", description: "Audio generated successfully!" });
      playNotificationSound(soundSettings);
      
      if (audioRef.current) {
        audioRef.current.onended = () => setIsPlaying(false);
      }

    } catch (error) {
      console.error("Error generating music:", error);
      toast({ title: "Error", description: "Failed to generate audio. " + (error as Error).message, variant: "destructive" });
    } finally {
      clearInterval(progressInterval);
      setProgressValue(100);
      setIsLoading(false);
      setTimeout(() => setProgressValue(0), 1500);
    }
  };

  const togglePlayback = () => {
    if (!generatedAudio || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };


  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Music className="mr-3 h-8 w-8" /> AI Music & Sound Generator
          </CardTitle>
          <CardDescription>Describe the music or sound effect you want, and let AI create it for you.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Audio Prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prompt">Description</Label>
              <Textarea
                id="prompt"
                placeholder="e.g., A cinematic, epic trailer score with powerful drums and orchestra."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
              />
            </div>
            <Button onClick={handleGenerateMusic} disabled={isLoading} className="w-full">
              <Sparkles className="mr-2 h-5 w-5" /> {isLoading ? "Generating Audio..." : "Generate Audio"}
            </Button>
            {isLoading && <Progress value={progressValue} className="w-full mt-2" />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Generated Audio</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[250px] flex items-center justify-center">
            {isLoading && !generatedAudio && (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg">AI is composing your sound...</p>
              </div>
            )}
            {!isLoading && !generatedAudio && (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <Music className="h-16 w-16 mb-4" />
                <p>Your generated audio will appear here.</p>
              </div>
            )}
            {generatedAudio && (
              <div className="w-full flex flex-col items-center gap-6">
                <audio ref={audioRef} src={generatedAudio} className="w-full" controls onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
                <div className="flex gap-4">
                     <Button variant="outline" asChild>
                        <a href={generatedAudio} download="petediano_pro_audio.wav">
                            <Download className="mr-2 h-4 w-4" /> Download WAV
                        </a>
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
