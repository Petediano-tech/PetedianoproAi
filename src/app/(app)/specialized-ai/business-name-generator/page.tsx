
"use client";
import * as React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Briefcase, Sparkles, Loader2, Download, Copy } from "lucide-react";
import { generateBusinessName, type GenerateBusinessNameInput, type GenerateBusinessNameOutput } from '@/ai/flows/generate-business-name';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { playNotificationSound } from '@/utils/audioPlayer';

const styles = ['Modern', 'Classic', 'Playful', 'Elegant', 'Minimalist'];

export default function BusinessNameGeneratorPage() {
  const [industry, setIndustry] = useState<string>("");
  const [keywords, setKeywords] = useState<string>("");
  const [style, setStyle] = useState<string>(styles[0]);
  
  const [generatedOutput, setGeneratedOutput] = useState<GenerateBusinessNameOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const { soundSettings } = useSoundSettings();

  const handleGenerateNames = async () => {
    if (!industry) {
      toast({ title: "Missing Field", description: "Please enter an industry.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setProgressValue(10);
    setGeneratedOutput(null);
    
    const progressInterval = setInterval(() => {
        setProgressValue(prev => Math.min(prev + 5, 90));
    }, 500);

    try {
      const input: GenerateBusinessNameInput = { industry, keywords, style: style as GenerateBusinessNameInput['style'] };
      const result = await generateBusinessName(input);
      setGeneratedOutput(result);
      toast({ title: "Success", description: "Business names generated!" });
      playNotificationSound(soundSettings);
    } catch (error) {
      console.error("Error generating names:", error);
      toast({ title: "Error", description: "Failed to generate names. " + (error as Error).message, variant: "destructive" });
    } finally {
      clearInterval(progressInterval);
      setProgressValue(100);
      setIsLoading(false);
      setTimeout(() => setProgressValue(0), 1500);
    }
  };

  const formatOutputToText = (output: GenerateBusinessNameOutput | null): string => {
    if (!output) return "";
    return output.suggestions.map(s => `Name: ${s.name}\nTagline: ${s.tagline}`).join('\n\n');
  };

  const handleCopyOutput = () => {
    const outputText = formatOutputToText(generatedOutput);
    if (!outputText) return;
    navigator.clipboard.writeText(outputText)
      .then(() => toast({ title: "Copied!", description: "All suggestions copied." }))
      .catch(() => toast({ title: "Error", description: "Failed to copy.", variant: "destructive" }));
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Briefcase className="mr-3 h-8 w-8" /> AI Business Name Generator
          </CardTitle>
          <CardDescription>Get creative names and taglines for your business, brand, or project.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="font-headline text-xl">Business Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label htmlFor="industry">Industry / Type</Label><Input id="industry" placeholder="e.g., Coffee Shop, YouTube Channel" value={industry} onChange={(e) => setIndustry(e.target.value)} /></div>
            <div><Label htmlFor="keywords">Keywords (Optional)</Label><Input id="keywords" placeholder="e.g., modern, organic, fast" value={keywords} onChange={(e) => setKeywords(e.target.value)} /></div>
            <div>
              <Label htmlFor="style">Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger id="style"><SelectValue /></SelectTrigger>
                <SelectContent>{styles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateNames} disabled={isLoading} className="w-full">
              <Sparkles className="mr-2 h-5 w-5" /> {isLoading ? "Generating..." : "Generate Names"}
            </Button>
            {isLoading && <Progress value={progressValue} className="w-full mt-2" />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="font-headline text-xl">Generated Names</CardTitle></CardHeader>
          <CardContent className="min-h-[500px]">
            {isLoading && !generatedOutput && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /><p className="text-lg">AI is brainstorming...</p>
              </div>
            )}
            {!isLoading && !generatedOutput && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Briefcase className="h-16 w-16 mb-4" /><p>Your business name ideas will appear here.</p>
              </div>
            )}
            {generatedOutput && (
              <ScrollArea className="h-[calc(100vh-22rem)] p-1">
                <div className="space-y-4">
                  {generatedOutput.suggestions.map((suggestion, index) => (
                    <Card key={index} className="bg-card border shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold">{suggestion.name}</CardTitle>
                        <CardDescription className="italic">"{suggestion.tagline}"</CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Button variant="ghost" size="sm" onClick={() => {
                          const text = `Name: ${suggestion.name}\nTagline: ${suggestion.tagline}`;
                          navigator.clipboard.writeText(text).then(() => toast({title: "Copied!", description: `Copied "${suggestion.name}" to clipboard.`}));
                        }}><Copy className="mr-2 h-4 w-4" />Copy</Button>
                      </CardFooter>
                    </Card>
                  ))}
                  {generatedOutput.suggestions.length > 0 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" onClick={handleCopyOutput}><Copy className="mr-2 h-4 w-4"/> Copy All</Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
