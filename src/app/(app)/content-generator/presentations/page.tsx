
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Presentation, Sparkles, Loader2, Download, Copy, ListChecks, Image as ImageIcon, Mic } from "lucide-react";
import { generatePresentationOutline, type GeneratePresentationOutlineInput, type GeneratePresentationOutlineOutput, type Slide } from '@/ai/flows/generate-presentation-outline';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { canUseFeature, recordFeatureUsage, FEATURE_NAMES } from '@/lib/usage-limiter';
import Link from 'next/link';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { playNotificationSound } from '@/utils/audioPlayer';

const desiredLengths = ['Short (3-5 slides)', 'Medium (6-10 slides)', 'Long (11-15 slides)'];
const presentationStyles = ['Informative', 'Persuasive', 'Educational', 'Workshop', 'Storytelling', 'Demonstration'];

export default function PresentationGeneratorPage() {
  const [topic, setTopic] = useState<string>("");
  const [targetAudience, setTargetAudience] = useState<string>("");
  const [desiredLength, setDesiredLength] = useState<string>(desiredLengths[1]);
  const [presentationStyle, setPresentationStyle] = useState<string>(presentationStyles[0]);
  const [keyPoints, setKeyPoints] = useState<string>("");
  const [customInstructions, setCustomInstructions] = useState<string>("");
  
  const [generatedOutline, setGeneratedOutline] = useState<GeneratePresentationOutlineOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const { soundSettings } = useSoundSettings();

  const showUpgradeToast = () => {
    toast({
      title: "Daily Limit Reached",
      description: "You've used all your free presentation outlines for today.",
      variant: "destructive",
      action: ( <Link href="/vip"> <Button variant="secondary" size="sm">Upgrade to VIP</Button> </Link> ),
    });
  };

  const handleGenerateOutline = async () => {
    if (!topic || !targetAudience) {
      toast({ title: "Missing Fields", description: "Please fill in Topic and Target Audience.", variant: "destructive" });
      return;
    }

    if (!canUseFeature(FEATURE_NAMES.PRESENTATION_GENERATOR)) {
      showUpgradeToast();
      return;
    }

    setIsLoading(true);
    setProgressValue(10);
    setGeneratedOutline(null);
    
    const progressInterval = setInterval(() => {
        setProgressValue(prev => Math.min(prev + 5, 90));
    }, 700);

    try {
      const input: GeneratePresentationOutlineInput = { 
        topic, 
        targetAudience, 
        desiredLength: desiredLength as GeneratePresentationOutlineInput['desiredLength'],
        presentationStyle: presentationStyle as GeneratePresentationOutlineInput['presentationStyle'],
        keyPoints,
        customInstructions
      };
      const result = await generatePresentationOutline(input);
      setGeneratedOutline(result);
      recordFeatureUsage(FEATURE_NAMES.PRESENTATION_GENERATOR);
      toast({ title: "Success", description: "Presentation outline generated successfully!" });
      playNotificationSound(soundSettings);
    } catch (error) {
      console.error("Error generating presentation outline:", error);
      toast({ title: "Error", description: "Failed to generate outline. " + (error as Error).message, variant: "destructive" });
    } finally {
      clearInterval(progressInterval);
      setProgressValue(100);
      setIsLoading(false);
      setTimeout(() => setProgressValue(0), 1500);
    }
  };

  const formatOutlineToText = (outline: GeneratePresentationOutlineOutput | null): string => {
    if (!outline) return "";
    let text = `Presentation Title: ${outline.presentationTitle}\n\n`;
    text += `Summary: ${outline.overallSummary}\n\n`;
    text += `Slides:\n`;
    outline.slides.forEach(slide => {
      text += `\n## Slide ${slide.slideNumber}: ${slide.slideTitle}\n`;
      text += `Main Points:\n`;
      slide.mainPoints.forEach(point => text += `- ${point}\n`);
      if (slide.speakerNotes) text += `Speaker Notes: ${slide.speakerNotes}\n`;
      if (slide.visualSuggestion) text += `Visual Suggestion: ${slide.visualSuggestion}\n`;
    });
    return text.trim();
  };

  const handleCopyOutline = () => {
    const outlineText = formatOutlineToText(generatedOutline);
    if (!outlineText) return;
    navigator.clipboard.writeText(outlineText)
      .then(() => toast({ title: "Copied!", description: "Outline copied to clipboard." }))
      .catch(() => toast({ title: "Error", description: "Failed to copy outline.", variant: "destructive" }));
  };

  const handleDownloadOutline = (format: 'txt' | 'json' | 'md') => {
    if (!generatedOutline) return;
    let data = "";
    let fileExtension = format;
    let mimeType = "text/plain";

    if (format === 'json') {
      data = JSON.stringify(generatedOutline, null, 2);
      mimeType = "application/json";
    } else if (format === 'md') {
      data = `# ${generatedOutline.presentationTitle}\n\n**Summary:** ${generatedOutline.overallSummary}\n\n`;
      generatedOutline.slides.forEach(slide => {
        data += `## Slide ${slide.slideNumber}: ${slide.slideTitle}\n\n`;
        data += `**Main Points:**\n`;
        slide.mainPoints.forEach(point => data += `* ${point}\n`);
        if (slide.speakerNotes) data += `\n**Speaker Notes:** ${slide.speakerNotes}\n`;
        if (slide.visualSuggestion) data += `\n**Visual Suggestion:** ${slide.visualSuggestion}\n`;
        data += `\n---\n\n`;
      });
       mimeType = "text/markdown";
    } else { // txt
      data = formatOutlineToText(generatedOutline);
    }
    
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = generatedOutline.presentationTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeTitle || 'presentation_outline'}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: `Outline ${format.toUpperCase()} downloaded.` });
  };


  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Presentation className="mr-3 h-8 w-8" /> AI Presentation Generator
          </CardTitle>
          <CardDescription>Generate slide-by-slide outlines with titles, key points, speaker notes, and visual ideas.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Presentation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><Label htmlFor="topic">Topic</Label><Input id="topic" placeholder="e.g., The Future of AI" value={topic} onChange={(e) => setTopic(e.target.value)} /></div>
            <div><Label htmlFor="targetAudience">Target Audience</Label><Input id="targetAudience" placeholder="e.g., Marketing Professionals" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} /></div>
            <div>
              <Label htmlFor="desiredLength">Desired Length (Content Slides)</Label>
              <Select value={desiredLength} onValueChange={setDesiredLength}>
                <SelectTrigger id="desiredLength"><SelectValue /></SelectTrigger>
                <SelectContent>{desiredLengths.map(len => <SelectItem key={len} value={len}>{len}</SelectItem>)}</SelectContent>
              </Select>
            </div>
             <div>
              <Label htmlFor="presentationStyle">Presentation Style (Optional)</Label>
              <Select value={presentationStyle} onValueChange={setPresentationStyle}>
                <SelectTrigger id="presentationStyle"><SelectValue /></SelectTrigger>
                <SelectContent>{presentationStyles.map(style => <SelectItem key={style} value={style}>{style}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="keyPoints">Key Points to Include (Optional, comma-separated)</Label><Textarea id="keyPoints" placeholder="e.g., AI in healthcare, AI ethics, AI job market" value={keyPoints} onChange={(e) => setKeyPoints(e.target.value)} rows={2}/></div>
            <div><Label htmlFor="customInstructions">Custom Instructions (Optional)</Label><Textarea id="customInstructions" placeholder="e.g., Start with a compelling statistic. Include a Q&A slide." value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} rows={2}/></div>
            <Button onClick={handleGenerateOutline} disabled={isLoading} className="w-full">
              <Sparkles className="mr-2 h-5 w-5" /> {isLoading ? "Generating Outline..." : "Generate Outline"}
            </Button>
            {isLoading && <Progress value={progressValue} className="w-full mt-2" />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Generated Presentation Outline</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[500px]">
            {isLoading && !generatedOutline && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg">AI is structuring your presentation...</p>
              </div>
            )}
            {!isLoading && !generatedOutline && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Presentation className="h-16 w-16 mb-4" />
                <p>Your generated presentation outline will appear here.</p>
              </div>
            )}
            {generatedOutline && (
              <ScrollArea className="h-[calc(100vh-22rem)] p-1">
                <div className="space-y-6">
                  <h2 className="font-headline text-3xl text-center text-accent !mb-2">{generatedOutline.presentationTitle}</h2>
                  <Card className="bg-secondary/20">
                    <CardHeader><CardTitle className="font-headline text-lg !mt-0 !mb-1">Overall Summary</CardTitle></CardHeader>
                    <CardContent><p className="text-sm !my-0">{generatedOutline.overallSummary}</p></CardContent>
                  </Card>
                  
                  <h3 className="font-headline text-xl text-primary pt-4 border-t">Slides:</h3>
                  <div className="space-y-4">
                    {generatedOutline.slides.map((slide: Slide) => (
                      <Card key={slide.slideNumber} className="bg-card border shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold">Slide {slide.slideNumber}: {slide.slideTitle}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div>
                            <strong className="flex items-center"><ListChecks className="inline h-4 w-4 mr-2 text-accent"/>Main Points:</strong>
                            <ul className="list-disc pl-5 mt-1 space-y-0.5">
                              {slide.mainPoints.map((point, i) => <li key={i}>{point}</li>)}
                            </ul>
                          </div>
                          {slide.speakerNotes && <p><strong className="flex items-center"><Mic className="inline h-4 w-4 mr-2 text-accent"/>Speaker Notes:</strong> {slide.speakerNotes}</p>}
                          {slide.visualSuggestion && <p><strong className="flex items-center"><ImageIcon className="inline h-4 w-4 mr-2 text-accent"/>Visual Suggestion:</strong> {slide.visualSuggestion}</p>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <CardFooter className="justify-center pt-6 border-t gap-2 !mt-8 !px-0">
                      <Button variant="outline" onClick={handleCopyOutline}><Copy className="mr-2 h-4 w-4" /> Copy Text</Button>
                      <Button variant="outline" onClick={() => handleDownloadOutline('txt')}><Download className="mr-2 h-4 w-4" /> TXT</Button>
                      <Button variant="outline" onClick={() => handleDownloadOutline('md')}><Download className="mr-2 h-4 w-4" /> MD</Button>
                      <Button variant="outline" onClick={() => handleDownloadOutline('json')}><Download className="mr-2 h-4 w-4" /> JSON</Button>
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

    