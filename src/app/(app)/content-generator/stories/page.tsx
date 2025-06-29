
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Sparkles, BookOpen, Download, Loader2, Copy } from "lucide-react";
import Image from "next/image";
import { generateStoryWithImages, type GenerateStoryWithImagesInput, type GenerateStoryWithImagesOutput } from '@/ai/flows/generate-story-with-images';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { canUseFeature, recordFeatureUsage, FEATURE_NAMES } from '@/lib/usage-limiter';
import Link from 'next/link';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { playNotificationSound } from '@/utils/audioPlayer';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // For better text handling if needed, though we'll do it manually

export default function StoryGeneratorPage() {
  const [topic, setTopic] = useState<string>("");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [generatedStory, setGeneratedStory] = useState<GenerateStoryWithImagesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
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
    if (!topic) {
      toast({ title: "Error", description: "Please enter a topic for the story.", variant: "destructive" });
      return;
    }

    if (!canUseFeature(FEATURE_NAMES.STORIES)) {
      showUpgradeToast();
      return;
    }

    setIsLoading(true);
    setProgress(10); 
    setGeneratedStory(null);
    try {
      const input: GenerateStoryWithImagesInput = { topic, length };
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 500);

      const result = await generateStoryWithImages(input);
      
      clearInterval(progressInterval);
      setProgress(100);
      setGeneratedStory(result);
      recordFeatureUsage(FEATURE_NAMES.STORIES);
      toast({ title: "Success", description: "Story generated successfully!" });
      playNotificationSound(soundSettings);
    } catch (error) {
      console.error("Error generating story:", error);
      toast({ title: "Error", description: "Failed to generate story. " + (error as Error).message, variant: "destructive" });
      setProgress(0);
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 1500);
    }
  };

  const handleDownloadPdf = async () => {
    if (!generatedStory) return;
    setIsDownloading(true);
    toast({ title: "Preparing PDF...", description: "This may take a moment." });

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const maxLineWidth = pageWidth - margin * 2;
      let y = margin;

      // Add Title
      doc.setFontSize(22);
      doc.text(generatedStory.title, pageWidth / 2, y, { align: 'center' });
      y += 15;

      for (const [index, page] of generatedStory.pages.entries()) {
        if (index > 0) doc.addPage();
        y = margin;
        
        // Add Image
        if (page.imageUrl) {
          try {
            const img = new window.Image();
            img.src = page.imageUrl;
            await new Promise(resolve => img.onload = resolve);
            
            const imgProps = doc.getImageProperties(img);
            const imgHeight = (imgProps.height * maxLineWidth) / imgProps.width;
            doc.addImage(page.imageUrl, 'PNG', margin, y, maxLineWidth, imgHeight);
            y += imgHeight + 10;
          } catch (e) {
            console.error("Could not add image to PDF", e);
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text("[Image could not be loaded]", margin, y);
            y += 10;
            doc.setTextColor(0);
          }
        }
        
        // Add Text
        doc.setFontSize(12);
        const textLines = doc.splitTextToSize(page.text, maxLineWidth);
        doc.text(textLines, margin, y);
      }
      
      const safeTitle = generatedStory.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      doc.save(`${safeTitle || 'ai_story'}.pdf`);

    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast({ title: "PDF Error", description: "Could not generate the PDF. " + (error as Error).message, variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };
  
  const handleCopyStory = () => {
      if (!generatedStory) return;
      const fullText = generatedStory.title + "\n\n" + generatedStory.pages.map(p => p.text).join("\n\n");
      navigator.clipboard.writeText(fullText)
        .then(() => toast({title: "Copied!", description: "The full story text has been copied to your clipboard."}))
        .catch(() => toast({title: "Error", description: "Could not copy the story.", variant: "destructive"}));
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">AI Story Generator</CardTitle>
          <CardDescription>Create captivating long-form stories with accompanying AI-generated images for each scene.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Story Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="topic" className="block mb-2 font-medium">Story Topic</Label>
              <Input 
                id="topic" 
                placeholder="e.g., A space adventure, A magical forest" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="length" className="block mb-2 font-medium">Story Length</Label>
              <Select value={length} onValueChange={(value: "short" | "medium" | "long") => setLength(value)}>
                <SelectTrigger id="length">
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateStory} disabled={isLoading || !topic} className="w-full">
              <Sparkles className="mr-2 h-5 w-5" /> {isLoading ? "Generating Story..." : "Generate Story"}
            </Button>
            {isLoading && <Progress value={progress} className="w-full mt-2" />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Generated Story</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[500px]">
            {isLoading && !generatedStory && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg">Generating your epic tale...</p>
                <p className="text-sm">This might take a few moments, especially for longer stories.</p>
              </div>
            )}
            {!isLoading && !generatedStory && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <BookOpen className="h-16 w-16 mb-4" />
                <p>Your generated story and images will appear here.</p>
              </div>
            )}
            {generatedStory && (
              <div className="space-y-6">
                <h2 className="font-headline text-3xl text-center text-accent">{generatedStory.title}</h2>
                <ScrollArea className="h-[600px] w-full rounded-md border p-4 bg-background">
                  {generatedStory.pages.map((page, index) => (
                    <div key={index} className="mb-8 p-4 rounded-lg shadow-sm bg-card even:bg-card/80">
                      {page.imageUrl && (
                        <div className="relative aspect-video w-full mb-4 rounded overflow-hidden">
                          <Image src={page.imageUrl} alt={`Illustration for page ${index + 1}`} layout="fill" objectFit="cover" data-ai-hint="story illustration" />
                        </div>
                      )}
                      <p className="font-body text-lg leading-relaxed whitespace-pre-line">{page.text}</p>
                    </div>
                  ))}
                </ScrollArea>
                <div className="flex flex-wrap gap-2 justify-center pt-4 border-t">
                  <Button onClick={handleCopyStory} variant="outline" disabled={isDownloading}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Story Text
                  </Button>
                  <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    {isDownloading ? 'Generating PDF...' : 'Download as PDF'}
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
