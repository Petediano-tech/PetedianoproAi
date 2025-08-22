
"use client";
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Sparkles, Loader2, BookOpen, ImageIcon } from "lucide-react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { 
  startInteractiveStory, type StartInteractiveStoryInput,
  makeStoryChoice, type MakeStoryChoiceInput,
  type StoryScene
} from '@/ai/flows/generate-interactive-story';
import { generateStoryImage, type GenerateStoryImageInput } from '@/ai/flows/generate-story-with-images';
import { toast } from '@/hooks/use-toast';
import { canUseFeature, recordFeatureUsage, FEATURE_NAMES } from '@/lib/usage-limiter';
import Link from 'next/link';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { playNotificationSound } from '@/utils/audioPlayer';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HistoryItem {
  text: string;
  choice: string | null; // null for the current scene before a choice is made
  imageUrl?: string;
}

export default function InteractiveStoryPage() {
  const [topic, setTopic] = useState<string>("");
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [currentScene, setCurrentScene] = useState<StoryScene | null>(null);
  const [storyHistory, setStoryHistory] = useState<HistoryItem[]>([]);
  
  const { soundSettings } = useSoundSettings();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [storyHistory, currentScene]);

  const showUpgradeToast = () => {
    toast({
      title: "Daily Limit Reached",
      description: "You've used all your free story generations for today.",
      variant: "destructive",
      action: ( <Link href="/vip"> <Button variant="secondary" size="sm">Upgrade to VIP</Button> </Link> ),
    });
  };

  const handleStartStory = async () => {
    if (!topic) {
      toast({ title: "Missing Topic", description: "Please enter a topic to start your story.", variant: "destructive" });
      return;
    }
    if (!await canUseFeature(FEATURE_NAMES.INTERACTIVE_STORY_GENERATOR)) {
      showUpgradeToast(); return;
    }

    setIsLoading(true);
    setCurrentScene(null);
    setStoryHistory([]);
    try {
      const input: StartInteractiveStoryInput = { topic };
      const result = await startInteractiveStory(input);
      setCurrentScene(result);
      setStoryHistory([{ text: result.text, choice: null, imageUrl: '' }]);
      await recordFeatureUsage(FEATURE_NAMES.INTERACTIVE_STORY_GENERATOR);
      playNotificationSound(soundSettings);
      generateImageForScene(0, result.imageDescription);
    } catch (error) {
      console.error("Error starting story:", error);
      toast({ title: "Error", description: "Failed to start the story. " + (error as Error).message, variant: "destructive" });
    } finally {
      setIsStarted(true);
      setIsLoading(false);
    }
  };

  const handleChoice = async (choice: string) => {
    if (!await canUseFeature(FEATURE_NAMES.INTERACTIVE_STORY_GENERATOR)) {
      showUpgradeToast(); return;
    }
    
    setIsLoading(true);
    
    // Finalize the current scene in history
    const previousHistory = storyHistory.slice(0, -1);
    const finalizedScene = { ...storyHistory[storyHistory.length - 1], choice: choice };
    
    try {
      const input: MakeStoryChoiceInput = {
        storyHistory: [...previousHistory, finalizedScene].map(h => ({ text: h.text, choice: h.choice || '' })),
        currentChoice: choice
      };
      const result = await makeStoryChoice(input);
      setCurrentScene(result);
      // Add the new scene to history
      setStoryHistory([...previousHistory, finalizedScene, { text: result.text, choice: null, imageUrl: '' }]);
      await recordFeatureUsage(FEATURE_NAMES.INTERACTIVE_STORY_GENERATOR);
      playNotificationSound(soundSettings);
      generateImageForScene(storyHistory.length, result.imageDescription);
    } catch (error) {
      console.error("Error making choice:", error);
      toast({ title: "Error", description: "The story could not continue. " + (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const generateImageForScene = async (index: number, imageDescription: string) => {
    setIsImageLoading(true);
    try {
        if (!await canUseFeature(FEATURE_NAMES.PICTURE_GENERATOR)) {
            showUpgradeToast(); return;
        }
        const input: GenerateStoryImageInput = { imageDescription };
        const result = await generateStoryImage(input);
        
        setStoryHistory(prev => {
            const newHistory = [...prev];
            if (newHistory[index]) {
                newHistory[index].imageUrl = result.imageUrl;
            }
            return newHistory;
        });
        await recordFeatureUsage(FEATURE_NAMES.PICTURE_GENERATOR);
    } catch (error) {
        console.error(`Error generating image for scene ${index + 1}:`, error);
        toast({ title: `Image Generation Failed`, description: `Could not create an image for the latest scene.`, variant: "destructive" });
    } finally {
        setIsImageLoading(false);
    }
  };
  
  const handleReset = () => {
    setIsStarted(false);
    setTopic("");
    setCurrentScene(null);
    setStoryHistory([]);
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <MessageCircle className="mr-3 h-8 w-8" /> AI Interactive Story Generator
          </CardTitle>
          <CardDescription>Create a story where your choices matter. Start with a topic and guide the narrative.</CardDescription>
        </CardHeader>
      </Card>

      {!isStarted ? (
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Start Your Adventure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="topic">What is your story about?</Label>
              <Input id="topic" placeholder="e.g., A detective in a steampunk city" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            <Button onClick={handleStartStory} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2 h-4 w-4"/> Begin Story</>}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <ScrollArea className="h-[calc(100vh-25rem)] p-4 border rounded-lg" ref={scrollAreaRef}>
              <div className="space-y-6">
                {storyHistory.map((item, index) => (
                  <div key={index}>
                    <div className="p-4 rounded-lg bg-secondary/30">
                       <div className="relative aspect-video w-full mb-4 rounded overflow-hidden bg-secondary/50 flex items-center justify-center">
                        {item.imageUrl ? (
                            <Image src={item.imageUrl} alt={`Illustration for scene ${index + 1}`} layout="fill" objectFit="cover" data-ai-hint="story illustration" />
                        ) : isImageLoading && index === storyHistory.length -1 ? (
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        ) : (
                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <p className="whitespace-pre-wrap">{item.text}</p>
                    </div>
                    {item.choice && (
                      <div className="mt-2 text-right">
                        <p className="text-sm italic text-muted-foreground p-2 bg-primary/10 rounded-md inline-block">
                           Your choice: &quot;{item.choice}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
              </div>
            </ScrollArea>
            
            {currentScene && !currentScene.isEnding && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentScene.choices.map((choice, index) => (
                  <Button key={index} onClick={() => handleChoice(choice)} disabled={isLoading} variant="outline" className="h-auto py-3 whitespace-normal">
                    {choice}
                  </Button>
                ))}
              </div>
            )}

            {currentScene && currentScene.isEnding && (
                <div className="mt-6 text-center">
                    <p className="font-bold text-lg text-accent">The End</p>
                    <Button onClick={handleReset} className="mt-4">
                        Start a New Story
                    </Button>
                </div>
            )}
            
            {!currentScene?.isEnding && (
                 <div className="mt-6 text-center">
                    <Button onClick={handleReset} variant="destructive" size="sm">
                        Reset Story
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
