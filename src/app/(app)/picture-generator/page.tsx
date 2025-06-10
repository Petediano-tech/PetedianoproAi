"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageIcon, Sparkles, Download, Heart, ThumbsDown, MessageCircle, Share2, Loader2 } from "lucide-react";
import Image from "next/image";
import { generateOriginalPictures, type GenerateOriginalPicturesInput, type GenerateOriginalPicturesOutput } from '@/ai/flows/generate-original-pictures';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

const imageTypes = ["picture", "wallpaper", "logo", "flyer", "collage", "social media post"];
const aspectRatios = ["16:9", "1:1", "4:5", "9:16", "4:3", "3:4"];
const fonts = ["Arial", "Verdana", "Times New Roman", "Courier New", "Belleza", "Alegreya"];


export default function PictureGeneratorPage() {
  const [prompt, setPrompt] = useState<string>("");
  const [imageType, setImageType] = useState<string>(imageTypes[0]);
  const [text, setText] = useState<string>("");
  const [font, setFont] = useState<string>(fonts[0]);
  const [aspectRatio, setAspectRatio] = useState<string>(aspectRatios[0]);
  
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGeneratePicture = async () => {
    if (!prompt) {
      toast({ title: "Error", description: "Please enter a prompt for the image.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setProgress(20);
    setGeneratedImageUrl(null);
    try {
      const input: GenerateOriginalPicturesInput = {
        type: imageType as any, // Assuming enum matches string array
        prompt,
        text: text || undefined,
        font: text ? font : undefined,
        aspectRatio: aspectRatio || undefined,
      };
      setTimeout(() => setProgress(50), 500);
      const result: GenerateOriginalPicturesOutput = await generateOriginalPictures(input);
      setTimeout(() => setProgress(100), 1000);
      setGeneratedImageUrl(result.imageUrl);
      toast({ title: "Success", description: "Picture generated successfully!" });
    } catch (error) {
      console.error("Error generating picture:", error);
      toast({ title: "Error", description: "Failed to generate picture. " + (error as Error).message, variant: "destructive" });
      setProgress(0);
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 1500);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">AI Picture Generator</CardTitle>
          <CardDescription>Create original pictures, wallpapers, logos, and more from your descriptions. Add custom text and choose aspect ratios.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Generation Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prompt">Image Prompt</Label>
              <Textarea id="prompt" placeholder="e.g., A futuristic city skyline at sunset" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} />
            </div>
            <div>
              <Label htmlFor="imageType">Image Type</Label>
              <Select value={imageType} onValueChange={setImageType}>
                <SelectTrigger id="imageType"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{imageTypes.map(type => <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
             <div>
              <Label htmlFor="aspectRatio">Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger id="aspectRatio"><SelectValue placeholder="Select aspect ratio" /></SelectTrigger>
                <SelectContent>{aspectRatios.map(ar => <SelectItem key={ar} value={ar}>{ar}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="border-t pt-4 space-y-4">
                <Label htmlFor="text">Custom Text (Optional)</Label>
                <Input id="text" placeholder="Text to add to image" value={text} onChange={(e) => setText(e.target.value)} />
                {text && (
                    <div>
                    <Label htmlFor="font">Font</Label>
                    <Select value={font} onValueChange={setFont} disabled={!text}>
                        <SelectTrigger id="font"><SelectValue placeholder="Select font" /></SelectTrigger>
                        <SelectContent>{fonts.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                    </Select>
                    </div>
                )}
            </div>
            <Button onClick={handleGeneratePicture} disabled={isLoading || !prompt} className="w-full">
              <Sparkles className="mr-2 h-5 w-5" /> {isLoading ? "Generating..." : "Generate Picture"}
            </Button>
            {isLoading && <Progress value={progress} className="w-full mt-2" />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Generated Picture</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[400px] flex flex-col items-center justify-center">
             {isLoading && !generatedImageUrl && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p>Conjuring your visual masterpiece...</p>
              </div>
            )}
            {!isLoading && !generatedImageUrl && (
              <div className="text-center text-muted-foreground">
                <ImageIcon className="mx-auto h-16 w-16 mb-4" />
                <p>Your generated picture will appear here.</p>
              </div>
            )}
            {generatedImageUrl && (
              <div className="w-full space-y-4">
                <div className="relative aspect-[16/9] w-full max-w-2xl mx-auto border rounded-lg overflow-hidden shadow-lg bg-muted">
                  <Image src={generatedImageUrl} alt="Generated picture" layout="fill" objectFit="contain" data-ai-hint="generated image art" />
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button variant="ghost" size="icon"><Heart className="h-5 w-5 text-red-500" /></Button>
                  <Button variant="ghost" size="icon"><ThumbsDown className="h-5 w-5" /></Button>
                  <Button variant="ghost" size="icon"><MessageCircle className="h-5 w-5" /></Button>
                  <Button variant="ghost" size="icon"><Share2 className="h-5 w-5" /></Button>
                  <Button asChild>
                    <a href={generatedImageUrl} download={`petediano_pro_art_${Date.now()}.png`}>
                      <Download className="mr-2 h-5 w-5" /> Download
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
