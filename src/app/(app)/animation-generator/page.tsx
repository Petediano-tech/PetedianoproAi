
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Film, Sparkles, Loader2, BookOpen } from "lucide-react";
import Image from "next/image";
import { generateAnimationConcept, type GenerateAnimationConceptInput, type GenerateAnimationConceptOutput } from '@/ai/flows/generate-animation-concept';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { canUseFeature, recordFeatureUsage, FEATURE_NAMES } from '@/lib/usage-limiter';
import Link from 'next/link';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { playNotificationSound } from '@/utils/audioPlayer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const animeStyles = ['Vibrant Shonen', 'Elegant Shojo', 'Chibi/Kawaii', 'Classic 90s', 'Dark Fantasy', 'Cyberpunk', 'Studio Ghibli-esque'];

export default function AnimeStoryGeneratorPage() {
  const [prompt, setPrompt] = useState<string>("");
  const [style, setStyle] = useState<string>(animeStyles[0]);
  const [generatedStory, setGeneratedStory] = useState<GenerateAnimationConceptOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const { soundSettings } = useSoundSettings();

  const showUpgradeToast = () => {
    toast({
      title: "Daily Limit Reached",
      description: "You've used all your free story generations for today.",
      variant: "destructive",
      action: (
        <Link href="/vip">
          <Button variant="secondary" size="sm">Upgrade to VIP</Button>
        </Link>
      ),
    });
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
    }, 1200);

    try {
      const input: GenerateAnimationConceptInput = { prompt, style };
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
          <CardDescription>Describe your story idea and choose an art style. AI will write the story and generate pictures for each scene.</CardDescription>
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
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="style" className="block mb-2 font-medium">Anime Art Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger id="style"><SelectValue placeholder="Select style" /></SelectTrigger>
                <SelectContent>{animeStyles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
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
                <p className="text-sm">This might take a few moments, image generation is intensive.</p>
              </div>
            )}
            {!isLoading && !generatedStory && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <BookOpen className="h-16 w-16 mb-4" />
                <p>Your anime story and pictures will appear here.</p>
              </div>
            )}
            {generatedStory && (
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="space-y-6 p-1">
                  <h2 className="font-headline text-3xl text-center text-accent">{generatedStory.title}</h2>
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
                        </CardContent>
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
