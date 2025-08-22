
"use client";
import * as React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Code, Sparkles, Loader2, Download, Copy, Terminal, MessageSquare } from "lucide-react";
import { explainCode, type ExplainCodeInput, type ExplainCodeOutput } from '@/ai/flows/explain-code';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { canUseFeature, recordFeatureUsage, FEATURE_NAMES } from '@/lib/usage-limiter';
import Link from 'next/link';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { playNotificationSound } from '@/utils/audioPlayer';

export default function CodeExplainerPage() {
  const [codeSnippet, setCodeSnippet] = useState<string>("function helloWorld() {\n  console.log('Hello, World!');\n}");
  const [language, setLanguage] = useState<string>("JavaScript");
  
  const [generatedOutput, setGeneratedOutput] = useState<ExplainCodeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const { soundSettings } = useSoundSettings();

  const showUpgradeToast = () => {
    toast({
      title: "Daily Limit Reached",
      description: "You've used all your free code explanations for today.",
      variant: "destructive",
      action: ( <Link href="/vip"> <Button variant="secondary" size="sm">Upgrade to VIP</Button> </Link> ),
    });
  };

  const handleExplainCode = async () => {
    if (!codeSnippet || !language) {
      toast({ title: "Missing Fields", description: "Please provide both a code snippet and its language.", variant: "destructive" });
      return;
    }
    if (!await canUseFeature(FEATURE_NAMES.CODE_EXPLAINER)) {
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
      const input: ExplainCodeInput = { codeSnippet, language };
      const result = await explainCode(input);
      setGeneratedOutput(result);
      await recordFeatureUsage(FEATURE_NAMES.CODE_EXPLAINER);
      toast({ title: "Success", description: "Code explanation generated!" });
      playNotificationSound(soundSettings);
    } catch (error) {
      console.error("Error explaining code:", error);
      toast({ title: "Error", description: "Failed to explain code. " + (error as Error).message, variant: "destructive" });
    } finally {
      clearInterval(progressInterval);
      setProgressValue(100);
      setIsLoading(false);
      setTimeout(() => setProgressValue(0), 1500);
    }
  };

  const formatOutputToText = (output: ExplainCodeOutput | null): string => {
    if (!output) return "";
    let text = `Summary: ${output.summary}\n\n`;
    text += "Line-by-Line Explanation:\n";
    output.lineByLineExplanation.forEach(line => {
      text += `Line(s) ${line.line}: ${line.explanation}\n`;
    });
    return text.trim();
  };

  const handleCopyOutput = () => {
    const outputText = formatOutputToText(generatedOutput);
    if (!outputText) return;
    navigator.clipboard.writeText(outputText)
      .then(() => toast({ title: "Copied!", description: "Explanation copied." }))
      .catch(() => toast({ title: "Error", description: "Failed to copy.", variant: "destructive" }));
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Code className="mr-3 h-8 w-8" /> AI Code Explainer
          </CardTitle>
          <CardDescription>Paste in a code snippet and get a simple, easy-to-understand explanation of what it does.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="font-headline text-xl">Code Input</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label htmlFor="language">Language</Label><Input id="language" placeholder="e.g., JavaScript, Python" value={language} onChange={(e) => setLanguage(e.target.value)} /></div>
            <div><Label htmlFor="codeSnippet">Code Snippet</Label><Textarea id="codeSnippet" placeholder="Paste your code here..." value={codeSnippet} onChange={(e) => setCodeSnippet(e.target.value)} rows={12} className="font-code text-sm" /></div>
            <Button onClick={handleExplainCode} disabled={isLoading} className="w-full">
              <Sparkles className="mr-2 h-5 w-5" /> {isLoading ? "Explaining..." : "Explain Code"}
            </Button>
            {isLoading && <Progress value={progressValue} className="w-full mt-2" />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="font-headline text-xl">Code Explanation</CardTitle></CardHeader>
          <CardContent className="min-h-[500px]">
            {isLoading && !generatedOutput && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /><p className="text-lg">AI is analyzing the code...</p>
              </div>
            )}
            {!isLoading && !generatedOutput && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Terminal className="h-16 w-16 mb-4" /><p>Your code explanation will appear here.</p>
              </div>
            )}
            {generatedOutput && (
              <ScrollArea className="h-[calc(100vh-22rem)] p-1">
                <div className="space-y-6">
                  <Card className="bg-secondary/30">
                    <CardHeader><CardTitle className="font-headline text-lg flex items-center !m-0"><MessageSquare className="mr-2 h-5 w-5 text-accent"/>Summary</CardTitle></CardHeader>
                    <CardContent><p className="text-sm">{generatedOutput.summary}</p></CardContent>
                  </Card>
                  <div>
                    <h3 className="font-headline text-xl text-primary mb-2">Line-by-Line Explanation</h3>
                    <div className="space-y-2">
                      {generatedOutput.lineByLineExplanation.map((line, index) => (
                        <div key={index} className="flex gap-4 p-3 border rounded-md">
                          <div className="font-bold font-code text-primary/80 text-sm w-12 text-center">L{line.line}</div>
                          <div className="flex-grow text-sm border-l pl-4">{line.explanation}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <CardFooter className="justify-center pt-6 border-t gap-2 !mt-8 !px-0">
                      <Button variant="outline" onClick={handleCopyOutput}><Copy className="mr-2 h-4 w-4"/> Copy Explanation</Button>
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
