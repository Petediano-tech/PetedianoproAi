
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Video, Sparkles, Loader2, Download, Copy, Film, Users, Clock, AlignLeft, Mic } from "lucide-react";
import { generateVideoScript, type GenerateVideoScriptInput, type GenerateVideoScriptOutput, type Scene } from '@/ai/flows/generate-video-script';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { canUseFeature, recordFeatureUsage, FEATURE_NAMES } from '@/lib/usage-limiter';
import Link from 'next/link';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { playNotificationSound } from '@/utils/audioPlayer';

const videoStyles = ['Tutorial', 'Vlog', 'Marketing Ad', 'Explainer', 'Product Review', 'Documentary Short'];
const estimatedDurations = ['Under 1 minute', '1-3 minutes', '3-5 minutes', '5-10 minutes', '10+ minutes'];
const tones = ['Informative', 'Engaging', 'Humorous', 'Serious', 'Inspiring', 'Formal', 'Casual'];

export default function VideoScriptGeneratorPage() {
  const [topic, setTopic] = useState<string>("");
  const [videoStyle, setVideoStyle] = useState<string>(videoStyles[0]);
  const [targetAudience, setTargetAudience] = useState<string>("");
  const [estimatedDuration, setEstimatedDuration] = useState<string>(estimatedDurations[1]);
  const [keyPoints, setKeyPoints] = useState<string>("");
  const [tone, setTone] = useState<string>(tones[0]);
  
  const [generatedScript, setGeneratedScript] = useState<GenerateVideoScriptOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const { soundSettings } = useSoundSettings();

  const showUpgradeToast = () => {
    toast({
      title: "Daily Limit Reached",
      description: "You've used all your free video script generations for today.",
      variant: "destructive",
      action: (
        <Link href="/vip">
          <Button variant="secondary" size="sm">Upgrade to VIP</Button>
        </Link>
      ),
    });
  };

  const handleGenerateScript = async () => {
    if (!topic || !videoStyle || !targetAudience || !estimatedDuration || !tone) {
      toast({ title: "Missing Fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    if (!canUseFeature(FEATURE_NAMES.VIDEO_SCRIPT_GENERATOR)) {
      showUpgradeToast();
      return;
    }

    setIsLoading(true);
    setProgressValue(10);
    setGeneratedScript(null);
    
    const progressInterval = setInterval(() => {
        setProgressValue(prev => Math.min(prev + 5, 90));
    }, 800);

    try {
      const input: GenerateVideoScriptInput = { 
        topic, 
        videoStyle: videoStyle as GenerateVideoScriptInput['videoStyle'], 
        targetAudience, 
        estimatedDuration: estimatedDuration as GenerateVideoScriptInput['estimatedDuration'], 
        keyPoints,
        tone: tone as GenerateVideoScriptInput['tone']
      };
      const result = await generateVideoScript(input);
      setGeneratedScript(result);
      recordFeatureUsage(FEATURE_NAMES.VIDEO_SCRIPT_GENERATOR);
      toast({ title: "Success", description: "Video script generated successfully!" });
      playNotificationSound(soundSettings);
    } catch (error) {
      console.error("Error generating video script:", error);
      toast({ title: "Error", description: "Failed to generate script. " + (error as Error).message, variant: "destructive" });
    } finally {
      clearInterval(progressInterval);
      setProgressValue(100);
      setIsLoading(false);
      setTimeout(() => setProgressValue(0), 1500);
    }
  };

  const handleCopyScript = () => {
    if (!generatedScript) return;
    const scriptText = `
Title: ${generatedScript.videoTitle}

Hook:
${generatedScript.hook}

Introduction:
${generatedScript.introduction}

Scenes:
${generatedScript.scenes.map(scene => `
Scene ${scene.sceneNumber}:
Visuals: ${scene.visualDescription}
Voiceover/Dialogue: ${scene.voiceoverOrDialogue}
${scene.onScreenText ? `On-Screen Text: ${scene.onScreenText}` : ''}
${scene.bRollSuggestions ? `B-Roll: ${scene.bRollSuggestions}` : ''}
${scene.estimatedDurationSeconds ? `Est. Duration: ${scene.estimatedDurationSeconds}s` : ''}
`).join('\n')}

${generatedScript.callToAction ? `Call to Action: ${generatedScript.callToAction}` : ''}

Outro:
${generatedScript.outro}
    `;
    navigator.clipboard.writeText(scriptText.trim())
      .then(() => toast({ title: "Copied!", description: "Script copied to clipboard." }))
      .catch(() => toast({ title: "Error", description: "Failed to copy script.", variant: "destructive" }));
  };

  const handleDownloadScript = () => {
    if (!generatedScript) return;
    const jsonString = JSON.stringify(generatedScript, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = generatedScript.videoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeTitle || 'video_script'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: "Script JSON downloaded." });
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Video className="mr-3 h-8 w-8" /> AI Video Script Generator
          </CardTitle>
          <CardDescription>Generate structured video scripts with scene suggestions, dialogue, and B-roll ideas.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Script Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="topic">Video Topic</Label>
              <Input id="topic" placeholder="e.g., How to make sourdough bread" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="videoStyle">Video Style</Label>
              <Select value={videoStyle} onValueChange={setVideoStyle}>
                <SelectTrigger id="videoStyle"><SelectValue placeholder="Select style" /></SelectTrigger>
                <SelectContent>{videoStyles.map(style => <SelectItem key={style} value={style}>{style}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input id="targetAudience" placeholder="e.g., Beginner bakers, Students" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="estimatedDuration">Estimated Duration</Label>
              <Select value={estimatedDuration} onValueChange={setEstimatedDuration}>
                <SelectTrigger id="estimatedDuration"><SelectValue placeholder="Select duration" /></SelectTrigger>
                <SelectContent>{estimatedDurations.map(dur => <SelectItem key={dur} value={dur}>{dur}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tone">Desired Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone"><SelectValue placeholder="Select tone" /></SelectTrigger>
                <SelectContent>{tones.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="keyPoints">Key Points (Optional)</Label>
              <Textarea id="keyPoints" placeholder="e.g., Importance of starter, Kneading technique, Baking temperature" value={keyPoints} onChange={(e) => setKeyPoints(e.target.value)} rows={3}/>
            </div>
            <Button onClick={handleGenerateScript} disabled={isLoading} className="w-full">
              <Sparkles className="mr-2 h-5 w-5" /> {isLoading ? "Generating Script..." : "Generate Script"}
            </Button>
            {isLoading && <Progress value={progressValue} className="w-full mt-2" />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Generated Video Script</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[500px]">
            {isLoading && !generatedScript && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg">AI is drafting your video script...</p>
              </div>
            )}
            {!isLoading && !generatedScript && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Film className="h-16 w-16 mb-4" />
                <p>Your video script will appear here.</p>
              </div>
            )}
            {generatedScript && (
              <ScrollArea className="h-[calc(100vh-22rem)] p-1">
                <div className="space-y-6">
                  <h2 className="font-headline text-3xl text-center text-accent">{generatedScript.videoTitle}</h2>
                  
                  <Section title="Hook" icon={<Sparkles />}>{generatedScript.hook}</Section>
                  <Section title="Introduction" icon={<AlignLeft />}>{generatedScript.introduction}</Section>
                  
                  <div>
                    <h3 className="font-headline text-xl mb-3 text-primary flex items-center"><Film className="mr-2 h-5 w-5"/>Scenes</h3>
                    <div className="space-y-4">
                      {generatedScript.scenes.map((scene: Scene) => (
                        <Card key={scene.sceneNumber} className="bg-card border shadow-sm">
                          <CardHeader>
                            <CardTitle className="text-lg font-semibold">Scene {scene.sceneNumber} {scene.estimatedDurationSeconds ? `(~${scene.estimatedDurationSeconds}s)` : ''}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <p><strong>Visuals:</strong> {scene.visualDescription}</p>
                            <p><Mic className="inline h-4 w-4 mr-1 text-accent"/> <strong>Voiceover/Dialogue:</strong> {scene.voiceoverOrDialogue}</p>
                            {scene.onScreenText && <p><strong>On-Screen Text:</strong> {scene.onScreenText}</p>}
                            {scene.bRollSuggestions && <p><strong>B-Roll:</strong> {scene.bRollSuggestions}</p>}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  {generatedScript.callToAction && <Section title="Call To Action" icon={<Sparkles />}>{generatedScript.callToAction}</Section>}
                  <Section title="Outro" icon={<AlignLeft />}>{generatedScript.outro}</Section>

                  <CardFooter className="justify-center pt-6 border-t gap-2">
                      <Button variant="outline" onClick={handleCopyScript}>
                          <Copy className="mr-2 h-4 w-4" /> Copy Script
                      </Button>
                      <Button variant="outline" onClick={handleDownloadScript}>
                          <Download className="mr-2 h-4 w-4" /> Download JSON
                      </Button>
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

function Section({ title, children, icon }: { title: string; children: React.ReactNode, icon?: React.ReactNode }) {
    if (!children) return null;
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center">
                  {icon && React.cloneElement(icon as React.ReactElement, { className: "mr-2 h-5 w-5 text-primary"})}
                  {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-foreground/80 whitespace-pre-line">{children}</p>
            </CardContent>
        </Card>
    );
}
