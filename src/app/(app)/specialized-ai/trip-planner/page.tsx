
"use client";
import * as React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Map, Sparkles, Loader2, Download, Copy, Calendar, Plane } from "lucide-react";
import { generateTripPlan, type GenerateTripPlanInput, type GenerateTripPlanOutput } from '@/ai/flows/generate-trip-plan';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { canUseFeature, recordFeatureUsage, FEATURE_NAMES } from '@/lib/usage-limiter';
import Link from 'next/link';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { playNotificationSound } from '@/utils/audioPlayer';
import { Slider } from '@/components/ui/slider';

export default function TripPlannerPage() {
  const [destination, setDestination] = useState<string>("");
  const [lengthInDays, setLengthInDays] = useState<number[]>([3]);
  const [interests, setInterests] = useState<string>("");
  
  const [generatedPlan, setGeneratedPlan] = useState<GenerateTripPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const { soundSettings } = useSoundSettings();

  const showUpgradeToast = () => {
    toast({
      title: "Daily Limit Reached",
      description: "You've used all your free itinerary generations for today.",
      variant: "destructive",
      action: ( <Link href="/vip"> <Button variant="secondary" size="sm">Upgrade to VIP</Button> </Link> ),
    });
  };

  const handleGeneratePlan = async () => {
    if (!destination || !interests) {
      toast({ title: "Missing Fields", description: "Please enter a destination and some interests.", variant: "destructive" });
      return;
    }
    if (!canUseFeature(FEATURE_NAMES.TRIP_PLANNER)) {
      showUpgradeToast();
      return;
    }

    setIsLoading(true);
    setProgressValue(10);
    setGeneratedPlan(null);
    
    const progressInterval = setInterval(() => {
        setProgressValue(prev => Math.min(prev + 5, 90));
    }, 800);

    try {
      const input: GenerateTripPlanInput = { destination, lengthInDays: lengthInDays[0], interests };
      const result = await generateTripPlan(input);
      setGeneratedPlan(result);
      recordFeatureUsage(FEATURE_NAMES.TRIP_PLANNER);
      toast({ title: "Success", description: "Trip itinerary generated!" });
      playNotificationSound(soundSettings);
    } catch (error) {
      console.error("Error generating plan:", error);
      toast({ title: "Error", description: "Failed to generate plan. " + (error as Error).message, variant: "destructive" });
    } finally {
      clearInterval(progressInterval);
      setProgressValue(100);
      setIsLoading(false);
      setTimeout(() => setProgressValue(0), 1500);
    }
  };

  const formatPlanToText = (plan: GenerateTripPlanOutput | null): string => {
    if (!plan) return "";
    let text = `Trip Itinerary: ${plan.tripTitle}\n\nSummary: ${plan.summary}\n\n`;
    plan.plan.forEach(day => {
      text += `--- Day ${day.day}: ${day.title} ---\n`;
      day.activities.forEach(activity => text += `- ${activity}\n`);
      text += '\n';
    });
    return text.trim();
  };

  const handleCopyPlan = () => {
    const planText = formatPlanToText(generatedPlan);
    if (!planText) return;
    navigator.clipboard.writeText(planText)
      .then(() => toast({ title: "Copied!", description: "Itinerary copied." }))
      .catch(() => toast({ title: "Error", description: "Failed to copy.", variant: "destructive" }));
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Map className="mr-3 h-8 w-8" /> AI Trip Planner
          </CardTitle>
          <CardDescription>Get a personalized day-by-day travel itinerary based on your destination and interests.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="font-headline text-xl">Trip Details</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div><Label htmlFor="destination">Destination</Label><Input id="destination" placeholder="e.g., Paris, France" value={destination} onChange={(e) => setDestination(e.target.value)} /></div>
            <div>
              <Label htmlFor="lengthInDays">Length of Trip (Days): {lengthInDays[0]}</Label>
              <Slider id="lengthInDays" min={1} max={14} step={1} value={lengthInDays} onValueChange={setLengthInDays} />
            </div>
            <div><Label htmlFor="interests">Interests</Label><Input id="interests" placeholder="e.g., art, history, food, hiking" value={interests} onChange={(e) => setInterests(e.target.value)} /></div>
            <Button onClick={handleGeneratePlan} disabled={isLoading} className="w-full">
              <Sparkles className="mr-2 h-5 w-5" /> {isLoading ? "Planning..." : "Generate Itinerary"}
            </Button>
            {isLoading && <Progress value={progressValue} className="w-full mt-2" />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="font-headline text-xl">Generated Itinerary</CardTitle></CardHeader>
          <CardContent className="min-h-[500px]">
            {isLoading && !generatedPlan && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /><p className="text-lg">AI is packing your bags...</p>
              </div>
            )}
            {!isLoading && !generatedPlan && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Plane className="h-16 w-16 mb-4" /><p>Your travel itinerary will appear here.</p>
              </div>
            )}
            {generatedPlan && (
              <ScrollArea className="h-[calc(100vh-22rem)] p-1">
                <div className="space-y-6">
                  <h2 className="font-headline text-3xl text-center text-accent !mb-1">{generatedPlan.tripTitle}</h2>
                  <p className="text-center text-muted-foreground italic">{generatedPlan.summary}</p>

                  <div className="space-y-4">
                    {generatedPlan.plan.map((day) => (
                      <Card key={day.day} className="bg-card border shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold flex items-center">
                            <Calendar className="mr-2 h-5 w-5 text-primary" /> Day {day.day}: {day.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/80">
                            {day.activities.map((activity, i) => <li key={i}>{activity}</li>)}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <CardFooter className="justify-center pt-6 border-t gap-2 !mt-8 !px-0">
                      <Button variant="outline" onClick={handleCopyPlan}><Copy className="mr-2 h-4 w-4"/> Copy Itinerary</Button>
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
