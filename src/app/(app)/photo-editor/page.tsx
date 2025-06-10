"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Wand2, Trash2, RefreshCw, Download, Heart, ThumbsDown, MessageCircle, Share2 } from "lucide-react";
import Image from "next/image";
import { aiPhotoEnhancer, type AiPhotoEnhancerInput, type AiPhotoEnhancerOutput } from '@/ai/flows/ai-photo-enhancer';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { canUseFeature, recordFeatureUsage, FEATURE_NAMES } from '@/lib/usage-limiter';
import Link from 'next/link';

export default function PhotoEditorPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [enhancementDetails, setEnhancementDetails] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

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

  const showUpgradeToast = () => {
    toast({
      title: "Daily Limit Reached",
      description: "You've used all your free photo enhancements for today.",
      variant: "destructive",
      action: (
        <Link href="/vip">
          <Button variant="secondary" size="sm">Upgrade to VIP</Button>
        </Link>
      ),
    });
  };

  const handleEnhanceImage = async () => {
    if (!uploadedImage) {
      toast({ title: "Error", description: "Please upload an image first.", variant: "destructive" });
      return;
    }

    if (!canUseFeature(FEATURE_NAMES.PHOTO_EDITOR)) {
      showUpgradeToast();
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
      recordFeatureUsage(FEATURE_NAMES.PHOTO_EDITOR);
      toast({ title: "Success", description: "Image enhanced successfully!" });
    } catch (error) {
      console.error("Error enhancing image:", error);
      toast({ title: "Error", description: "Failed to enhance image. " + (error as Error).message, variant: "destructive" });
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
          <CardTitle className="font-headline text-3xl text-primary">AI Photo Editor</CardTitle>
          <CardDescription>Upload your photo and let AI enhance it, or manually apply stunning effects and adjustments.</CardDescription>
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

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-lg">Manual Adjustments (Coming Soon)</h3>
              <div className="space-y-2">
                <Label>Brightness</Label>
                <Slider defaultValue={[50]} max={100} step={1} disabled />
              </div>
              <div className="space-y-2">
                <Label>Contrast</Label>
                <Slider defaultValue={[50]} max={100} step={1} disabled />
              </div>
              <div className="space-y-2">
                <Label>Add Text</Label>
                <Input placeholder="Enter text" disabled />
              </div>
              <div className="space-y-2">
                 <Label>Font</Label>
                 <Select disabled>
                    <SelectTrigger><SelectValue placeholder="Select font" /></SelectTrigger>
                    <SelectContent><SelectItem value="arial">Arial</SelectItem></SelectContent>
                 </Select>
              </div>
               <Button variant="outline" disabled className="w-full">Remove Background</Button>
            </div>
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
                <Button variant="ghost" size="icon"><Heart className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon"><ThumbsDown className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon"><MessageCircle className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon"><Share2 className="h-5 w-5" /></Button>
                <Button asChild><a href={enhancedImage} download={`petediano_enhanced_${Date.now()}.png`}><Download className="mr-2 h-5 w-5" /> Download</a></Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
