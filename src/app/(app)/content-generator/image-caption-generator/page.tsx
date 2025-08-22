
"use client";
import * as React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image as ImageIcon, Sparkles, Loader2, Copy, Upload, Trash2, Tag, Captions } from "lucide-react";
import { generateImageCaption, type GenerateImageCaptionInput, type GenerateImageCaptionOutput } from '@/ai/flows/generate-image-caption';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { canUseFeature, recordFeatureUsage, FEATURE_NAMES } from '@/lib/usage-limiter';
import Link from 'next/link';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { playNotificationSound } from '@/utils/audioPlayer';
import Image from "next/image";
import { Badge } from '@/components/ui/badge';

const tones = ['Witty', 'Inspirational', 'Descriptive', 'Casual', 'Mysterious', 'Humorous'];

export default function ImageCaptionGeneratorPage() {
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [tone, setTone] = useState<string>(tones[0]);
  
  const [generatedOutput, setGeneratedOutput] = useState<GenerateImageCaptionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const { soundSettings } = useSoundSettings();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUri(reader.result as string);
        setGeneratedOutput(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const showUpgradeToast = () => {
    toast({
      title: "Daily Limit Reached",
      description: "You've used all your free caption generations for today.",
      variant: "destructive",
      action: ( <Link href="/vip"> <Button variant="secondary" size="sm">Upgrade to VIP</Button> </Link> ),
    });
  };

  const handleGenerateCaptions = async () => {
    if (!photoDataUri) {
      toast({ title: "Missing Image", description: "Please upload an image first.", variant: "destructive" });
      return;
    }
    if (!await canUseFeature(FEATURE_NAMES.IMAGE_CAPTION_GENERATOR)) {
      showUpgradeToast();
      return;
    }

    setIsLoading(true);
    setProgressValue(10);
    setGeneratedOutput(null);
    
    const progressInterval = setInterval(() => {
        setProgressValue(prev => Math.min(prev + 5, 90));
    }, 500);

    try {
      const input: GenerateImageCaptionInput = { photoDataUri, tone: tone as GenerateImageCaptionInput['tone'] };
      const result = await generateImageCaption(input);
      setGeneratedOutput(result);
      await recordFeatureUsage(FEATURE_NAMES.IMAGE_CAPTION_GENERATOR);
      toast({ title: "Success", description: "Captions generated successfully!" });
      playNotificationSound(soundSettings);
    } catch (error) {
      console.error("Error generating captions:", error);
      toast({ title: "Error", description: "Failed to generate captions. " + (error as Error).message, variant: "destructive" });
    } finally {
      clearInterval(progressInterval);
      setProgressValue(100);
      setIsLoading(false);
      setTimeout(() => setProgressValue(0), 1500);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast({ title: "Copied!", description: "Content copied to clipboard." }))
      .catch(() => toast({ title: "Error", description: "Failed to copy.", variant: "destructive" }));
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Captions className="mr-3 h-8 w-8" /> AI Image Caption Generator
          </CardTitle>
          <CardDescription>Upload a photo and get creative caption ideas and relevant hashtags for social media.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="font-headline text-xl">Image & Options</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="image-upload">Upload Image</Label>
              <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} />
              {photoDataUri && (
                <div className="mt-4 border rounded-lg p-2 relative">
                  <Image src={photoDataUri} alt="Uploaded preview" width={300} height={300} className="object-contain max-h-[300px] w-auto mx-auto rounded" data-ai-hint="photo preview" />
                  <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => {setPhotoDataUri(null); setGeneratedOutput(null);}}>
                    <Trash2 className="h-4 w-4"/>
                  </Button>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone"><SelectValue /></SelectTrigger>
                <SelectContent>{tones.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateCaptions} disabled={isLoading || !photoDataUri} className="w-full">
              <Sparkles className="mr-2 h-5 w-5" /> {isLoading ? "Generating..." : "Generate Captions"}
            </Button>
            {isLoading && <Progress value={progressValue} className="w-full mt-2" />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="font-headline text-xl">Generated Content</CardTitle></CardHeader>
          <CardContent className="min-h-[500px]">
            {isLoading && !generatedOutput && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /><p className="text-lg">AI is analyzing your image...</p>
              </div>
            )}
            {!isLoading && !generatedOutput && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <ImageIcon className="h-16 w-16 mb-4" /><p>Your generated captions will appear here.</p>
              </div>
            )}
            {generatedOutput && (
              <ScrollArea className="h-[calc(100vh-22rem)] p-1">
                <div className="space-y-8">
                  <div>
                    <h3 className="font-headline text-lg flex items-center mb-2"><Captions className="mr-2 h-5 w-5 text-accent"/>Suggested Captions</h3>
                    <div className="space-y-3">
                      {generatedOutput.captions.map((caption, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-secondary/30 rounded-md">
                          <p className="flex-grow text-sm">{caption}</p>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyToClipboard(caption)}><Copy className="h-4 w-4"/></Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-headline text-lg flex items-center mb-2"><Tag className="mr-2 h-5 w-5 text-accent"/>Suggested Hashtags</h3>
                    <div className="flex flex-wrap gap-2">
                        {generatedOutput.hashtags.map(tag => <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleCopyToClipboard(`#${tag}`)}>#{tag}</Badge>)}
                    </div>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => handleCopyToClipboard(generatedOutput.hashtags.map(t => `#${t}`).join(' '))}>
                      <Copy className="mr-2 h-4 w-4"/> Copy All Hashtags
                    </Button>
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
