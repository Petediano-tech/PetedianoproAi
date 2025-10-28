
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Share2 as ShareIcon, Sparkles, Loader2, Download, Copy, MessageSquare, ThumbsUp, CalendarDays } from "lucide-react"; // Renamed Share2
import { generateSocialCampaign, type GenerateSocialCampaignInput, type GenerateSocialCampaignOutput, type PostIdea, type SocialPlatform } from '@/ai/flows/generate-social-campaign';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { playNotificationSound } from '@/utils/audioPlayer';
import { Badge } from '@/components/ui/badge';

const allPlatforms: SocialPlatform[] = ['Instagram', 'X (Twitter)', 'Facebook', 'LinkedIn', 'TikTok', 'YouTube Shorts'];
const campaignDurations = ['1 Week', '2 Weeks', '1 Month'];
const tones = ['Professional', 'Friendly & Casual', 'Humorous & Witty', 'Inspirational & Uplifting', 'Urgent & Action-Oriented', 'Educational & Informative'];

export default function SocialMediaPlannerPage() {
  const [campaignTopic, setCampaignTopic] = useState<string>("");
  const [targetPlatforms, setTargetPlatforms] = useState<SocialPlatform[]>([]);
  const [campaignGoal, setCampaignGoal] = useState<string>("");
  const [campaignDuration, setCampaignDuration] = useState<string>(campaignDurations[0]);
  const [targetAudience, setTargetAudience] = useState<string>("");
  const [tone, setTone] = useState<string>(tones[1]);
  const [existingAssets, setExistingAssets] = useState<string>("");
  
  const [generatedCampaign, setGeneratedCampaign] = useState<GenerateSocialCampaignOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const { soundSettings } = useSoundSettings();

  const handlePlatformChange = (platform: SocialPlatform) => {
    setTargetPlatforms(prev => 
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const handleGenerateCampaign = async () => {
    if (!campaignTopic || targetPlatforms.length === 0 || !campaignGoal) {
      toast({ title: "Missing Fields", description: "Please fill in Topic, select at least one Platform, and specify a Goal.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setProgressValue(10);
    setGeneratedCampaign(null);
    
    const progressInterval = setInterval(() => {
        setProgressValue(prev => Math.min(prev + 5, 90));
    }, 900);

    try {
      const input: GenerateSocialCampaignInput = { 
        campaignTopic, 
        targetPlatforms, 
        campaignGoal, 
        campaignDuration: campaignDuration as GenerateSocialCampaignInput['campaignDuration'], 
        targetAudience,
        tone: tone as GenerateSocialCampaignInput['tone'],
        existingAssets
      };
      const result = await generateSocialCampaign(input);
      setGeneratedCampaign(result);
      toast({ title: "Success", description: "Social media campaign plan generated!" });
      playNotificationSound(soundSettings);
    } catch (error) {
      console.error("Error generating campaign:", error);
      toast({ title: "Error", description: "Failed to generate campaign. " + (error as Error).message, variant: "destructive" });
    } finally {
      clearInterval(progressInterval);
      setProgressValue(100);
      setIsLoading(false);
      setTimeout(() => setProgressValue(0), 1500);
    }
  };
  
  const formatCampaignToText = (campaign: GenerateSocialCampaignOutput | null): string => {
    if (!campaign) return "";
    let text = `Campaign Title: ${campaign.campaignTitle}\n\n`;
    text += `Strategy Summary: ${campaign.campaignStrategySummary}\n\n`;
    if (campaign.contentPillars && campaign.contentPillars.length > 0) {
        text += `Content Pillars:\n${campaign.contentPillars.map(p => `- ${p}`).join('\n')}\n\n`;
    }
    text += `Post Ideas:\n`;
    campaign.postIdeas.forEach((post, index) => {
      text += `\n--- Post ${index + 1} ---\n`;
      text += `Platform: ${post.platform}\n`;
      text += `Type: ${post.postType}\n`;
      if(post.daySuggestion) text += `Suggested Day: ${post.daySuggestion}\n`;
      text += `Caption Idea: ${post.captionIdea}\n`;
      if (post.hashtagSuggestions.length > 0) text += `Hashtags: ${post.hashtagSuggestions.join(', ')}\n`;
      if (post.visualConcept) text += `Visual Concept: ${post.visualConcept}\n`;
      if (post.callToAction) text += `CTA: ${post.callToAction}\n`;
    });
    return text.trim();
  };

  const handleCopyCampaign = () => {
    const campaignText = formatCampaignToText(generatedCampaign);
    if (!campaignText) return;
    navigator.clipboard.writeText(campaignText)
      .then(() => toast({ title: "Copied!", description: "Campaign plan copied to clipboard." }))
      .catch(() => toast({ title: "Error", description: "Failed to copy plan.", variant: "destructive" }));
  };
  
  const handleDownloadCampaign = (format: 'txt' | 'json') => {
    if (!generatedCampaign) return;
    let data = "";
    let fileExtension = format;
    let mimeType = "text/plain";

    if (format === 'json') {
      data = JSON.stringify(generatedCampaign, null, 2);
      mimeType = "application/json";
    } else { // txt
      data = formatCampaignToText(generatedCampaign);
    }
    
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = generatedCampaign.campaignTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeTitle || 'social_campaign'}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: `Campaign ${format.toUpperCase()} downloaded.` });
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <ShareIcon className="mr-3 h-8 w-8" /> AI Social Media Campaign Planner
          </CardTitle>
          <CardDescription>Get suggestions for social media posts, captions, hashtags, and visual concepts for your campaign.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="font-headline text-xl">Campaign Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label htmlFor="campaignTopic">Campaign Topic/Product</Label><Input id="campaignTopic" placeholder="e.g., New Summer Drink Collection" value={campaignTopic} onChange={(e) => setCampaignTopic(e.target.value)} /></div>
            <div>
              <Label>Target Platforms</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {allPlatforms.map(p => (
                  <div key={p} className="flex items-center space-x-2">
                    <Checkbox id={`platform-${p}`} checked={targetPlatforms.includes(p)} onCheckedChange={() => handlePlatformChange(p)} />
                    <Label htmlFor={`platform-${p}`} className="font-normal text-sm">{p}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div><Label htmlFor="campaignGoal">Campaign Goal</Label><Input id="campaignGoal" placeholder="e.g., Drive pre-orders" value={campaignGoal} onChange={(e) => setCampaignGoal(e.target.value)} /></div>
            <div>
              <Label htmlFor="campaignDuration">Campaign Duration</Label>
              <Select value={campaignDuration} onValueChange={setCampaignDuration}>
                <SelectTrigger id="campaignDuration"><SelectValue /></SelectTrigger>
                <SelectContent>{campaignDurations.map(dur => <SelectItem key={dur} value={dur}>{dur}</SelectItem>)}</SelectContent>
              </Select>
            </div>
             <div>
              <Label htmlFor="tone">Desired Tone (Optional)</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone"><SelectValue /></SelectTrigger>
                <SelectContent>{tones.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="targetAudience">Target Audience (Optional)</Label><Input id="targetAudience" placeholder="e.g., Young adults, 18-25" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} /></div>
            <div><Label htmlFor="existingAssets">Existing Assets to Repurpose (Optional)</Label><Textarea id="existingAssets" placeholder="e.g., Recent blog post about ingredients, photoshoot images" value={existingAssets} onChange={(e) => setExistingAssets(e.target.value)} rows={2}/></div>
            <Button onClick={handleGenerateCampaign} disabled={isLoading} className="w-full">
              <Sparkles className="mr-2 h-5 w-5" /> {isLoading ? "Planning Campaign..." : "Plan Campaign"}
            </Button>
            {isLoading && <Progress value={progressValue} className="w-full mt-2" />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="font-headline text-xl">Generated Campaign Plan</CardTitle></CardHeader>
          <CardContent className="min-h-[500px]">
            {isLoading && !generatedCampaign && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /><p className="text-lg">AI is strategizing your campaign...</p>
              </div>
            )}
            {!isLoading && !generatedCampaign && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <ShareIcon className="h-16 w-16 mb-4" /><p>Your campaign plan will appear here.</p>
              </div>
            )}
            {generatedCampaign && (
              <ScrollArea className="h-[calc(100vh-22rem)] p-1">
                <div className="space-y-6">
                  <h2 className="font-headline text-3xl text-center text-accent !mb-1">{generatedCampaign.campaignTitle}</h2>
                  <Card className="bg-secondary/20">
                    <CardHeader><CardTitle className="font-headline text-lg !mt-0 !mb-1">Strategy Summary</CardTitle></CardHeader>
                    <CardContent><p className="text-sm !my-0">{generatedCampaign.campaignStrategySummary}</p></CardContent>
                  </Card>
                  {generatedCampaign.contentPillars && generatedCampaign.contentPillars.length > 0 && (
                    <Card className="bg-secondary/20">
                        <CardHeader><CardTitle className="font-headline text-lg !mt-0 !mb-1">Content Pillars</CardTitle></CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-5 text-sm space-y-0.5 !my-0">
                                {generatedCampaign.contentPillars.map((pillar, i) => <li key={i}>{pillar}</li>)}
                            </ul>
                        </CardContent>
                    </Card>
                  )}
                  
                  <h3 className="font-headline text-xl text-primary pt-4 border-t">Post Ideas:</h3>
                  <div className="space-y-4">
                    {generatedCampaign.postIdeas.map((post: PostIdea, index: number) => (
                      <Card key={index} className="bg-card border shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-base font-semibold flex justify-between items-center">
                            <span>Post {index + 1}: {post.postType} for {post.platform}</span>
                            {post.daySuggestion && <Badge variant="outline" className="text-xs"><CalendarDays className="h-3 w-3 mr-1.5"/>{post.daySuggestion}</Badge>}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <p><strong className="flex items-center"><MessageSquare className="inline h-4 w-4 mr-2 text-accent"/>Caption Idea:</strong> {post.captionIdea}</p>
                          {post.visualConcept && <p><strong>Visual Concept:</strong> {post.visualConcept}</p>}
                          {post.hashtagSuggestions.length > 0 && <div><strong>Hashtags:</strong> <div className="flex flex-wrap gap-1 mt-1">{post.hashtagSuggestions.map(tag => <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>)}</div></div>}
                          {post.callToAction && <p><strong className="flex items-center"><ThumbsUp className="inline h-4 w-4 mr-2 text-accent"/>Call To Action:</strong> {post.callToAction}</p>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <CardFooter className="justify-center pt-6 border-t gap-2 !mt-8 !px-0">
                      <Button variant="outline" onClick={handleCopyCampaign}><Copy className="mr-2 h-4 w-4" /> Copy Text</Button>
                      <Button variant="outline" onClick={() => handleDownloadCampaign('txt')}><Download className="mr-2 h-4 w-4" /> TXT</Button>
                      <Button variant="outline" onClick={() => handleDownloadCampaign('json')}><Download className="mr-2 h-4 w-4" /> JSON</Button>
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
