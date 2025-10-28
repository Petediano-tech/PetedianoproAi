
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Wand2, Trash2, Download, Share2 } from "lucide-react";
import Image from "next/image";
import { aiPhotoEnhancer, type AiPhotoEnhancerInput, type AiPhotoEnhancerOutput } from '@/ai/flows/ai-photo-enhancer';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { playNotificationSound } from '@/utils/audioPlayer';

export default function PhotoEditorPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [enhancementDetails, setEnhancementDetails] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { soundSettings } = useSoundSettings();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setEnhancedImage(null); 
        setEnhancementDetails("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhanceImage = async () => {
    if (!uploadedImage) {
      toast({ title: "Error", description: "Please upload an image first.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setProgress(30);
    try {
      const input: AiPhotoEnhancerInput = { photoDataUri: uploadedImage };
      setTimeout(() => setProgress(60), 500);
      const result: AiPhotoEnhancerOutput = await aiPhotoEnhancer(input);
      setTimeout(() => setProgress(100), 1000);
      setEnhancedImage(result.enhancedPhotoDataUri);
      setEnhancementDetails(result.enhancementDetails);
      toast({ title: "Success", description: "Image enhanced successfully!" });
      playNotificationSound(soundSettings);
    } catch (error) {
      console.error("Error enhancing image:", error);
      toast({ title: "Error", description: "Failed to enhance image. " + (error as Error).message, variant: "destructive" });
      setProgress(0);
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 1500); 
    }
  };
  
  const handleShare = async () => {
    if (!enhancedImage) {
        toast({ title: "Nothing to share", description: "Please enhance an image first.", variant: "destructive" });
        return;
    }
    if (navigator.share) {
        try {
            const blob = await (await fetch(enhancedImage)).blob();
            const file = new File([blob], `petediano_enhanced_${Date.now()}.png`, { type: blob.type });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'Image Enhanced with Petediano Pro',
                    text: 'Check out this image I enhanced using Petediano Pro!',
                    files: [file],
                });
                toast({ title: "Shared successfully!"});
            } else {
                 await navigator.share({
                    title: 'Image Enhanced with Petediano Pro',
                    text: 'Check out this image I enhanced using Petediano Pro!',
                    url: enhancedImage,
                });
            }
        } catch (error) {
            if ((error as DOMException).name !== 'AbortError') {
              toast({ title: "Sharing failed", description: "Could not share the image.", variant: "destructive" });
            }
        }
    } else {
        toast({ title: "Sharing not available", description: "Your browser does not support the Web Share API.", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">AI Photo Editor</CardTitle>
          <CardDescription>Upload your photo and let AI automatically enhance it with professional adjustments.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 space-y-6">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="image-upload" className="block mb-2 font-medium">Upload Image</Label>
              <div className="flex items-center gap-2">
                <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="flex-grow"/>
                {uploadedImage && <Button variant="ghost" size="icon" onClick={() => {setUploadedImage(null); setEnhancedImage(null);}}><Trash2 className="h-5 w-5"/></Button>}
              </div>
            </div>

            <Button onClick={handleEnhanceImage} disabled={!uploadedImage || isLoading} className="w-full">
              <Wand2 className="mr-2 h-5 w-5" /> {isLoading ? "Enhancing..." : "AI Auto Enhance"}
            </Button>
            {isLoading && <Progress value={progress} className="w-full mt-2" />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div>
                <h3 className="font-semibold mb-2">Original</h3>
                <div className="aspect-square border rounded-lg flex items-center justify-center bg-muted overflow-hidden">
                  {uploadedImage ? (
                    <Image src={uploadedImage} alt="Uploaded original" width={500} height={500} className="object-contain max-h-full max-w-full" data-ai-hint="photo original"/>
                  ) : (
                    <div className="text-center text-muted-foreground p-4">
                      <Upload className="mx-auto h-12 w-12 mb-2" />
                      <p>Upload an image to start</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Enhanced</h3>
                <div className="aspect-square border rounded-lg flex items-center justify-center bg-muted overflow-hidden">
                  {enhancedImage ? (
                     <Image src={enhancedImage} alt="Enhanced" width={500} height={500} className="object-contain max-h-full max-w-full" data-ai-hint="photo enhanced"/>
                  ) : (
                    <div className="text-center text-muted-foreground p-4">
                      <Wand2 className="mx-auto h-12 w-12 mb-2" />
                      <p>Enhanced image will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {enhancementDetails && (
              <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
                <h4 className="font-semibold mb-1">Enhancement Details:</h4>
                <p className="text-sm text-muted-foreground">{enhancementDetails}</p>
              </div>
            )}
             {enhancedImage && (
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                <Button variant="outline" onClick={handleShare}><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                <Button asChild><a href={enhancedImage} download={`petediano_enhanced_${Date.now()}.png`}><Download className="mr-2 h-5 w-5" /> Download</a></Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
