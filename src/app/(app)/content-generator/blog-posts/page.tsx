
"use client";
import { useState } from 'react';
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
        keywords,
        targetAudience, 
        tone: tone as GenerateBlogPostInput['tone'], 
        desiredLength: desiredLength as GenerateBlogPostInput['desiredLength'],
        customInstructions
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
    const postText = formatPostToText(generatedPost);
    if (!postText) return;
    navigator.clipboard.writeText(postText)
      .then(() => toast({ title: "Copied!", description: "Blog post copied to clipboard." }))
      .catch(() => toast({ title: "Error", description: "Failed to copy post.", variant: "destructive" }));
  };

  const handleDownloadPost = (format: 'txt' | 'json' | 'md') => {
    if (!generatedPost) return;
    let data = "";
    let fileExtension = format;
    let mimeType = "text/plain";

    if (format === 'json') {
      data = JSON.stringify(generatedPost, null, 2);
      mimeType = "application/json";
    } else if (format === 'md') {
      data = `# ${generatedPost.blogTitle}\n\n**Introduction:**\n${generatedPost.introduction}\n\n`;
      generatedPost.mainContent.forEach(section => {
        data += `## ${section.headingText}\n\n`;
        section.paragraphs.forEach(p => data += `${p}\n\n`);
      });
      data += `**Conclusion:**\n${generatedPost.conclusion}\n\n`;
      if (generatedPost.suggestedMetaDescription) {
        data += `**Meta Description:** ${generatedPost.suggestedMetaDescription}\n\n`;
      }
      if (generatedPost.suggestedTags && generatedPost.suggestedTags.length > 0) {
        data += `**Tags:** ${generatedPost.suggestedTags.map(t => `\`${t}\``).join(' ')}\n`;
      }
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
              <Textarea id="customInstructions" placeholder="e.g., Include a section on policy changes. Avoid jargon." value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} rows={3}/>
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
              <ScrollArea className="h-[calc(100vh-22rem)] p-1 prose dark:prose-invert max-w-none">
                <div className="space-y-6">
                  <h1 className="font-headline text-3xl text-primary !mb-2">{generatedPost.blogTitle}</h1>
                  
                  <div className="mb-4 p-4 bg-secondary/20 rounded-md">
                      <h2 className="font-headline text-xl text-accent !mt-0 !mb-1">Introduction</h2>
                      <p className="!my-0">{generatedPost.introduction}</p>
                  </div>
                  
                  {generatedPost.mainContent.map((section: HeadingSection, index: number) => (
                    <div key={index} className="mb-4">
                      <h2 className="font-headline text-xl text-accent !mt-0 !mb-1">{section.headingText}</h2>
                      {section.paragraphs.map((p, pIndex) => <p key={pIndex} className="!my-2">{p}</p>)}
                    </div>
                  ))}
                  
                  <div className="mt-4 p-4 bg-secondary/20 rounded-md">
                    <h2 className="font-headline text-xl text-accent !mt-0 !mb-1">Conclusion</h2>
                    <p className="!my-0">{generatedPost.conclusion}</p>
                  </div>

                  {generatedPost.suggestedMetaDescription && (
                    <div className="mt-4 text-sm">
                        <strong className="font-semibold text-primary">Meta Description:</strong> {generatedPost.suggestedMetaDescription}
                    </div>
                  )}
                  {generatedPost.suggestedTags && generatedPost.suggestedTags.length > 0 && (
                     <div className="mt-2 text-sm">
                        <strong className="font-semibold text-primary">Suggested Tags:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {generatedPost.suggestedTags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                        </div>
                    </div>
                  )}
                </div>
                <CardFooter className="justify-center pt-6 border-t gap-2 !mt-8 !px-0">
                      <Button variant="outline" onClick={handleCopyPost}>
                          <Copy className="mr-2 h-4 w-4" /> Copy Text
                      </Button>
                      <Button variant="outline" onClick={() => handleDownloadPost('txt')}>
                          <Download className="mr-2 h-4 w-4" /> Download TXT
                      </Button>
                       <Button variant="outline" onClick={() => handleDownloadPost('md')}>
                          <Download className="mr-2 h-4 w-4" /> Download MD
                      </Button>
                      <Button variant="outline" onClick={() => handleDownloadPost('json')}>
                          <Download className="mr-2 h-4 w-4" /> Download JSON
                      </Button>
                  </CardFooter>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
