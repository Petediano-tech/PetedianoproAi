
"use client";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Newspaper, Sparkles, Loader2, Download, Copy, Tag, FileText as FileTextIcon } from "lucide-react";
import { generateBlogPost, type GenerateBlogPostInput, type GenerateBlogPostOutput, type HeadingSection } from '@/ai/flows/generate-blog-post';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { playNotificationSound } from '@/utils/audioPlayer';
import { Badge } from '@/components/ui/badge';

const tones = ['Informative', 'Casual', 'Formal', 'Humorous', 'Persuasive', 'Technical', 'Storytelling'];
const desiredLengths = ['Short (~300-500 words)', 'Medium (~800-1200 words)', 'Long (1500+ words)'];

export default function BlogPostWriterPage() {
  const [topic, setTopic] = useState<string>("");
  const [keywords, setKeywords] = useState<string>("");
  const [targetAudience, setTargetAudience] = useState<string>("");
  const [tone, setTone] = useState<string>(tones[0]);
  const [desiredLength, setDesiredLength] = useState<string>(desiredLengths[0]);
  const [customInstructions, setCustomInstructions] = useState<string>("");
  
  const [generatedPost, setGeneratedPost] = useState<GenerateBlogPostOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const { soundSettings } = useSoundSettings();

  const handleGeneratePost = async () => {
    if (!topic || !targetAudience || !tone || !desiredLength) {
      toast({ title: "Missing Fields", description: "Please fill in Topic, Target Audience, Tone, and Desired Length.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setProgressValue(10);
    setGeneratedPost(null);
    
    const progressInterval = setInterval(() => {
        setProgressValue(prev => Math.min(prev + 5, 90));
    }, 800);

    try {
      const input: GenerateBlogPostInput = { 
          topic, 
          keywords: keywords || undefined, 
          targetAudience, 
          tone: tone as GenerateBlogPostInput['tone'], 
          desiredLength: desiredLength as GenerateBlogPostInput['desiredLength'], 
          customInstructions: customInstructions || undefined
      };
      const result = await generateBlogPost(input);
      setGeneratedPost(result);
      toast({ title: "Success", description: "Blog post generated successfully!" });
      playNotificationSound(soundSettings);
    } catch (error) {
        console.error("Error generating blog post:", error);
        toast({ title: "Error", description: "Failed to generate post. " + (error as Error).message, variant: "destructive" });
    } finally {
        clearInterval(progressInterval);
        setProgressValue(100);
        setIsLoading(false);
        setTimeout(() => setProgressValue(0), 1500);
    }
  };

  const formatPostToText = (post: GenerateBlogPostOutput | null): string => {
    if (!post) return "";
    let text = `Title: ${post.blogTitle}\n\n`;
    text += `Introduction:\n${post.introduction}\n\n`;
    post.mainContent.forEach(section => {
      text += `## ${section.headingText}\n`;
      section.paragraphs.forEach(p => text += `${p}\n\n`);
    });
    text += `Conclusion:\n${post.conclusion}\n\n`;
    if (post.suggestedMetaDescription) {
      text += `Meta Description: ${post.suggestedMetaDescription}\n\n`;
    }
    if (post.suggestedTags && post.suggestedTags.length > 0) {
      text += `Tags: ${post.suggestedTags.join(', ')}\n`;
    }
    return text.trim();
  };

  const handleCopyPost = () => {
    if (!generatedPost) {
        toast({ title: "Unavailable", description: "Please generate a post first.", variant: "destructive" });
        return;
    }
    const postText = formatPostToText(generatedPost);
    navigator.clipboard.writeText(postText)
      .then(() => toast({ title: "Copied!", description: "Blog post copied to clipboard." }))
      .catch(() => toast({ title: "Error", description: "Failed to copy post.", variant: "destructive" }));
  };

  const handleDownloadPost = (format: 'txt' | 'json' | 'md') => {
    if (!generatedPost) {
        toast({ title: "Unavailable", description: "Please generate a post first.", variant: "destructive" });
        return;
    }
    let data = "";
    let fileExtension = format;
    let mimeType = "text/plain";

    if (format === 'json') {
      data = JSON.stringify(generatedPost, null, 2);
      mimeType = "application/json";
    } else if (format === 'md') {
       data = `# ${generatedPost.blogTitle}\n\n`;
       data += `**Introduction:**\n${generatedPost.introduction}\n\n`;
       generatedPost.mainContent.forEach(section => {
        data += `## ${section.headingText}\n\n`;
        section.paragraphs.forEach(p => data += `${p}\n\n`);
      });
       data += `### Conclusion\n\n${generatedPost.conclusion}\n`;
       mimeType = "text/markdown";
    } else { // txt
      data = formatPostToText(generatedPost);
    }
    
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = generatedPost.blogTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeTitle || 'blog_post'}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: `Post ${format.toUpperCase()} downloaded.` });
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Newspaper className="mr-3 h-8 w-8" /> AI Blog Post / Article Writer
          </CardTitle>
          <CardDescription>Generate draft articles or blog posts with headings and an introduction/conclusion.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Article Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="topic">Topic / Title Idea</Label>
              <Input id="topic" placeholder="e.g., The Future of Renewable Energy" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
             <div>
              <Label htmlFor="keywords">Keywords (Optional, comma-separated)</Label>
              <Input id="keywords" placeholder="e.g., solar, wind, sustainability" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input id="targetAudience" placeholder="e.g., General public, Investors" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone"><SelectValue placeholder="Select tone" /></SelectTrigger>
                <SelectContent>{tones.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="desiredLength">Desired Length</Label>
              <Select value={desiredLength} onValueChange={setDesiredLength}>
                <SelectTrigger id="desiredLength"><SelectValue placeholder="Select length" /></SelectTrigger>
                <SelectContent>{desiredLengths.map(len => <SelectItem key={len} value={len}>{len}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="customInstructions">Custom Instructions (Optional)</Label>
              <Textarea id="customInstructions" placeholder="e.g., Include a section on policy changes. Avoid jargon." value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} rows={3} />
            </div>
            <Button onClick={handleGeneratePost} disabled={isLoading} className="w-full">
              <Sparkles className="mr-2 h-5 w-5" /> {isLoading ? "Writing Article..." : "Write Article"}
            </Button>
            {isLoading && <Progress value={progressValue} className="w-full mt-2" />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Generated Blog Post</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[500px]">
            {isLoading && !generatedPost && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg">AI is crafting your article...</p>
              </div>
            )}
            {!isLoading && !generatedPost && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <FileTextIcon className="h-16 w-16 mb-4" />
                <p>Your generated blog post will appear here.</p>
              </div>
            )}
            {generatedPost && (
                <ScrollArea className="h-[calc(100vh-22rem)] p-1">
                    <div className="space-y-6">
                        <h2 className="font-headline text-3xl text-center text-accent !mb-2">{generatedPost.blogTitle}</h2>
                        <Card className="bg-secondary/20">
                            <CardHeader><CardTitle className="font-headline text-lg !mt-0 !mb-1">Introduction</CardTitle></CardHeader>
                            <CardContent><p className="text-sm !my-0">{generatedPost.introduction}</p></CardContent>
                        </Card>
                        
                        <div>
                          <h3 className="font-headline text-xl text-primary mb-3">Main Content</h3>
                           <div className="space-y-4">
                            {generatedPost.mainContent.map((section: HeadingSection, index: number) => (
                               <Card key={index} className="bg-card border shadow-sm">
                                  <CardHeader><CardTitle className="text-lg font-semibold">{section.headingText}</CardTitle></CardHeader>
                                  <CardContent className="space-y-2 text-sm">
                                    {section.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                                  </CardContent>
                               </Card>
                            ))}
                           </div>
                        </div>

                        <Card className="bg-secondary/20">
                            <CardHeader><CardTitle className="font-headline text-lg !mt-0 !mb-1">Conclusion</CardTitle></CardHeader>
                            <CardContent><p className="text-sm !my-0">{generatedPost.conclusion}</p></CardContent>
                        </Card>

                        {(generatedPost.suggestedMetaDescription || (generatedPost.suggestedTags && generatedPost.suggestedTags.length > 0)) && (
                            <Card className="bg-secondary/20">
                                <CardHeader><CardTitle className="font-headline text-lg !mt-0 !mb-1">SEO Suggestions</CardTitle></CardHeader>
                                <CardContent className="space-y-2 text-sm !my-0">
                                    {generatedPost.suggestedMetaDescription && <p><strong>Meta Description:</strong> {generatedPost.suggestedMetaDescription}</p>}
                                    {generatedPost.suggestedTags && generatedPost.suggestedTags.length > 0 && (
                                        <div><strong>Tags:</strong> <div className="flex flex-wrap gap-2 mt-1">{generatedPost.suggestedTags.map(tag => <Badge key={tag} variant="secondary"><Tag className="mr-1 h-3 w-3"/>{tag}</Badge>)}</div></div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                        <CardFooter className="justify-center pt-6 border-t gap-2 !mt-8 !px-0">
                            <Button variant="outline" onClick={handleCopyPost}><Copy className="mr-2 h-4 w-4" /> Copy Text</Button>
                            <Button variant="outline" onClick={() => handleDownloadPost('txt')}><Download className="mr-2 h-4 w-4" /> TXT</Button>
                            <Button variant="outline" onClick={() => handleDownloadPost('md')}><Download className="mr-2 h-4 w-4" /> MD</Button>
                            <Button variant="outline" onClick={() => handleDownloadPost('json')}><Download className="mr-2 h-4 w-4" /> JSON</Button>
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
    