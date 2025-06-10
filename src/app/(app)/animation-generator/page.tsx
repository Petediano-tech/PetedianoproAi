
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Film, Sparkles, Loader2, Palette, Drama, Mic, Eye, Move } from "lucide-react";
import Image from "next/image";
import { generateAnimationConcept, type GenerateAnimationConceptInput, type GenerateAnimationConceptOutput } from '@/ai/flows/generate-animation-concept';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { canUseFeature, recordFeatureUsage, FEATURE_NAMES } from '@/lib/usage-limiter';
import Link from 'next/link';

export default function AnimationGeneratorPage() {
  const [prompt, setPrompt] = useState<string>("");
  const [characterDescription, setCharacterDescription] = useState<string>("");
  const [generatedConcept, setGeneratedConcept] = useState<GenerateAnimationConceptOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);

  const showUpgradeToast = () => {
    toast({
      title: "Daily Limit Reached",
      description: "You've used all your free animation concept generations for today.",
      variant: "destructive",
      action: (
        <Link href="/vip">
          <Button variant="secondary" size="sm">Upgrade to VIP</Button>
        </Link>
      ),
    });
  };

  const handleGenerateConcept = async () => {
    if (!prompt) {
      toast({ title: "Error", description: "Please enter an animation prompt.", variant: "destructive" });
      return;
    }

    if (!canUseFeature(FEATURE_NAMES.ANIMATION_GENERATOR)) {
      showUpgradeToast();
      return;
    }

    setIsLoading(true);
    setProgressValue(10);
    setGeneratedConcept(null);
    
    const progressInterval = setInterval(() => {
        setProgressValue(prev => Math.min(prev + 5, 90));
    }, 700);

    try {
      const input: GenerateAnimationConceptInput = { prompt, characterDescription };
      const result = await generateAnimationConcept(input);
      setGeneratedConcept(result);
      recordFeatureUsage(FEATURE_NAMES.ANIMATION_GENERATOR);
      toast({ title: "Success", description: "Animation concept generated successfully!" });
    } catch (error) {
      console.error("Error generating animation concept:", error);
      toast({ title: "Error", description: "Failed to generate concept. " + (error as Error).message, variant: "destructive" });
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
            <Film className="mr-3 h-8 w-8" /> AI Animation Concept Generator
          </CardTitle>
          <CardDescription>Describe your animation idea, and AI will generate a character visual and a storyboard concept including mouth, head, eye, and gesture descriptions.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Animation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="prompt" className="block mb-2 font-medium">Animation Prompt</Label>
              <Textarea 
                id="prompt" 
                placeholder="e.g., A cat chef excitedly explaining a new recipe." 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="characterDescription" className="block mb-2 font-medium">Character Description (Optional)</Label>
              <Textarea 
                id="characterDescription" 
                placeholder="e.g., A fluffy orange cat wearing a tiny chef hat and apron." 
                value={characterDescription}
                onChange={(e) => setCharacterDescription(e.target.value)}
                rows={3}
              />
            </div>
            <Button onClick={handleGenerateConcept} disabled={isLoading || !prompt} className="w-full">
              <Sparkles className="mr-2 h-5 w-5" /> {isLoading ? "Generating Concept..." : "Generate Concept"}
            </Button>
            {isLoading && <Progress value={progressValue} className="w-full mt-2" />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Generated Animation Concept</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[500px]">
            {isLoading && !generatedConcept && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg">AI is bringing your animation idea to life...</p>
                <p className="text-sm">This might take a few moments.</p>
              </div>
            )}
            {!isLoading && !generatedConcept && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Film className="h-16 w-16 mb-4" />
                <p>Your animation concept will appear here.</p>
              </div>
            )}
            {generatedConcept && (
              <ScrollArea className="h-[calc(100vh-20rem)]">
              <div className="space-y-6 p-1">
                <h2 className="font-headline text-3xl text-center text-accent">{generatedConcept.animationTitle}</h2>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center"><Palette className="mr-2 h-5 w-5 text-primary"/>Character Visual</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        {generatedConcept.characterImageUrl && (
                            <Image src={generatedConcept.characterImageUrl} alt="Generated Character" width={300} height={300} className="mx-auto rounded-lg border shadow-md object-contain max-h-[300px]" data-ai-hint="animated character concept" />
                        )}
                        <p className="text-sm text-muted-foreground mt-2">{generatedConcept.characterDesignNotes}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">Animation Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-foreground/80">{generatedConcept.animationSummary}</p>
                    </CardContent>
                </Card>
                
                <div>
                  <h3 className="font-headline text-xl mb-3 text-primary">Storyboard / Keyframes</h3>
                  <div className="space-y-4">
                    {generatedConcept.storyboard.map((frame, index) => (
                      <Card key={index} className="bg-secondary/20">
                        <CardHeader>
                          <CardTitle className="text-base font-semibold">Keyframe {index + 1} (Time: {frame.timecode})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <p><Drama className="inline h-4 w-4 mr-1 text-accent"/> <strong>Action:</strong> {frame.actionDescription}</p>
                          {frame.dialogue && <p><Mic className="inline h-4 w-4 mr-1 text-accent"/> <strong>Dialogue:</strong> "{frame.dialogue}"</p>}
                          {frame.mouthMovement && <p><strong>Mouth:</strong> {frame.mouthMovement}</p>}
                          {frame.headMovement && <p><strong>Head:</strong> {frame.headMovement}</p>}
                          {frame.eyeState && <p><Eye className="inline h-4 w-4 mr-1 text-accent"/> <strong>Eyes:</strong> {frame.eyeState}</p>}
                          {frame.gesture && <p><Move className="inline h-4 w-4 mr-1 text-accent"/> <strong>Gesture:</strong> {frame.gesture}</p>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                <CardFooter className="justify-center pt-6 border-t">
                    <Button variant="outline">Download Concept (Soon)</Button>
                </CardFooter>
              </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
