"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Sparkles, BookOpen, Download, Loader2, Copy, ImageIcon, BookText, Share2 } from "lucide-react";
import Image from "next/image";
import { 
  generateStoryText, type GenerateStoryTextInput,
  generateStoryImage, type GenerateStoryImageInput
} from '@/ai/flows/generate-story-with-images';
import { toast } from '@/hooks/use-toast';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { playNotificationSound } from '@/utils/audioPlayer';
import jsPDF from 'jspdf';
import { useFirestore } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, serverTimestamp } from 'firebase/firestore';

interface PageState {
  text: string;
  imageDescription: string;
  imageUrl?: string;
  isImageLoading: boolean;
}

interface StoryState {
  title: string;
  pages: PageState[];
}

export default function StoryGeneratorPage() {
  const [topic, setTopic] = useState<string>("");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [story, setStory] = useState<StoryState | null>(null);

  const [isStoryLoading, setIsStoryLoading] = useState(false);
  const [isBatchImageLoading, setIsBatchImageLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const { soundSettings } = useSoundSettings();
  const firestore = useFirestore();

  const handleGenerateStoryText = async () => {
    if (!topic) {
      toast({ title: "Error", description: "Please enter a topic for the story.", variant: "destructive" });
      return;
    }

    setIsStoryLoading(true);
    setStory(null);
    try {
      const input: GenerateStoryTextInput = { topic, length };
      const result = await generateStoryText(input);

      if (result.pages.length === 0) {
        toast({ title: "Generation Failed", description: "The AI could not create a story from your prompt. Please try again.", variant: "destructive"});
        return;
      }
      
      setStory({
        title: result.title,
        pages: result.pages.map(p => ({
          text: p.text,
          imageDescription: p.imageDescription,
          isImageLoading: false,
        }))
      });
      toast({ title: "Success", description: "Story text generated!" });
      playNotificationSound(soundSettings);
    } catch (error) {
      console.error("Error generating story text:", error);
      toast({ title: "Error", description: "Failed to generate story text. " + (error as Error).message, variant: "destructive" });
    } finally {
      setIsStoryLoading(false);
    }
  };

  const handleGenerateAllImages = async () => {
    if (!story) return;

    setIsBatchImageLoading(true);
    setStory(s => s ? { ...s, pages: s.pages.map(p => ({ ...p, isImageLoading: true })) } : null);

    const updatedPages = [...story.pages];
    for (let i = 0; i < updatedPages.length; i++) {
        try {
            const input: GenerateStoryImageInput = { imageDescription: updatedPages[i].imageDescription };
            const result = await generateStoryImage(input);
            updatedPages[i].imageUrl = result.imageUrl;
        } catch (error) {
            console.error(`Error generating image for scene ${i + 1}:`, error);
            toast({ title: `Image ${i+1} Failed`, variant: "destructive" });
        } finally {
            updatedPages[i].isImageLoading = false;
            setStory(s => s ? { ...s, pages: [...updatedPages] } : null);
        }
    }
    toast({ title: "Image Generation Complete" });
    setIsBatchImageLoading(false);
  };
  
    const handleShareToCommunity = () => {
    if (!story || !firestore) {
      toast({ title: "Error", description: "Please generate a story first.", variant: "destructive" });
      return;
    }
    
    const galleryItemsRef = collection(firestore, 'galleryItems');
    addDocumentNonBlocking(galleryItemsRef, {
      type: 'story',
      title: story.title,
      author: 'Anonymous',
      likes: 0,
      content: story.pages.map(p => p.text).join('\n\n'),
      createdAt: serverTimestamp(),
    });

    toast({ title: "Shared!", description: "Your story has been shared with the community." });
  };


  const handleDownloadPdf = async () => {
    if (!story) return;
    setIsDownloading(true);
    toast({ title: "Preparing PDF...", description: "This may take a moment." });

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const maxLineWidth = pageWidth - margin * 2;
      let y = margin;

      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      const titleLines = doc.splitTextToSize(story.title, maxLineWidth);
      doc.text(titleLines, pageWidth / 2, y, { align: 'center' });
      y += (doc.getTextDimensions(titleLines).h) + 10;
      doc.setFont('helvetica', 'normal');

      for (const page of story.pages) {
         if (y > margin) {
            y += 5;
            if (y > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
        }
        
        if (page.imageUrl) {
          try {
            const img = new window.Image();
            img.crossOrigin = "anonymous";
            
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = (err) => reject(new Error(`Image failed to load: ${err}`));
              img.src = page.imageUrl!;
            });
            
            const imgProps = doc.getImageProperties(img);
            const imgHeight = (imgProps.height * maxLineWidth) / imgProps.width;

            if (y + imgHeight > pageHeight - margin) {
              doc.addPage();
              y = margin;
            }
            doc.addImage(page.imageUrl, 'PNG', margin, y, maxLineWidth, imgHeight);
            y += imgHeight + 10;
          } catch (e) {
            console.error("Could not add image to PDF", e);
             if (y + 10 > pageHeight - margin) { doc.addPage(); y = margin; }
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text("[Image could not be loaded]", margin, y);
            y += 10;
            doc.setTextColor(0);
          }
        }
        
        doc.setFontSize(12);
        const textLines = doc.splitTextToSize(page.text, maxLineWidth);
        const textHeight = doc.getTextDimensions(textLines).h;
        
        if (y + textHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
        doc.text(textLines, margin, y);
        y += textHeight + 5;
      }
      
      const safeTitle = story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      doc.save(`${safeTitle || 'ai_story'}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast({ title: "PDF Error", description: "Could not generate the PDF. " + (error as Error).message, variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };
  
  const handleCopyStory = () => {
      if (!story) return;
      const fullText = story.title + "\n\n" + story.pages.map(p => p.text).join("\n\n");
      navigator.clipboard.writeText(fullText)
        .then(() => toast({title: "Copied!", description: "The full story text has been copied."}))
        .catch(() => toast({title: "Error", description: "Could not copy the story.", variant: "destructive"}));
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">AI Story Generator</CardTitle>
          <CardDescription>Create stories more reliably. First, generate text. Then, generate images.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Story Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="topic">Story Topic</Label>
              <Input id="topic" placeholder="e.g., A space adventure" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="length">Story Length</Label>
              <Select value={length} onValueChange={(value: "short" | "medium" | "long") => setLength(value)}>
                <SelectTrigger id="length"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateStoryText} disabled={isStoryLoading || !topic} className="w-full">
              <BookText className="mr-2 h-5 w-5" /> {isStoryLoading ? "Generating Text..." : "1. Generate Story Text"}
            </Button>
            {isStoryLoading && <p className="text-sm text-center text-muted-foreground">AI is writing...</p>}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Generated Story</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[500px]">
            {isStoryLoading && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg">Generating your epic tale...</p>
              </div>
            )}
            {!isStoryLoading && !story && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <BookOpen className="h-16 w-16 mb-4" />
                <p>Your generated story will appear here.</p>
              </div>
            )}
            {story && (
              <div className="space-y-4">
                <h2 className="font-headline text-3xl text-center text-accent">{story.title}</h2>
                <div className="text-center">
                    <Button onClick={handleGenerateAllImages} disabled={isBatchImageLoading}>
                      <ImageIcon className="mr-2 h-5 w-5" />
                      {isBatchImageLoading ? "Generating Images..." : "2. Generate All Images"}
                    </Button>
                </div>
                <ScrollArea className="h-[500px] w-full rounded-md border p-4 bg-background">
                  {story.pages.map((page, index) => (
                    <div key={index} className="mb-8 p-4 rounded-lg shadow-sm bg-card even:bg-card/80">
                      <div className="relative aspect-video w-full mb-4 rounded overflow-hidden bg-secondary/30 flex items-center justify-center">
                        {page.imageUrl ? (
                            <Image src={page.imageUrl} alt={`Illustration for page ${index + 1}`} layout="fill" objectFit="cover" data-ai-hint="story illustration" />
                        ) : page.isImageLoading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        ) : (
                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <p className="font-body text-lg leading-relaxed whitespace-pre-line">{page.text}</p>
                    </div>
                  ))}
                </ScrollArea>
                <CardFooter className="flex flex-wrap gap-2 justify-center pt-4 border-t">
                   <Button onClick={handleShareToCommunity} variant="outline" disabled={isDownloading}>
                    <Share2 className="mr-2 h-4 w-4" /> Share to Community
                  </Button>
                  <Button onClick={handleCopyStory} variant="outline" disabled={isDownloading}>
                    <Copy className="mr-2 h-4 w-4" /> Copy Story Text
                  </Button>
                  <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    {isDownloading ? 'Generating PDF...' : 'Download as PDF'}
                  </Button>
                </CardFooter>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
