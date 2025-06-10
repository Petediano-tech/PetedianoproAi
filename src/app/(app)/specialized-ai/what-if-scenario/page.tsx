
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lightbulb, Sparkles, Loader2, Download, Copy, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
import { generateWhatIfScenario, type GenerateWhatIfScenarioInput, type GenerateWhatIfScenarioOutput, type Scenario } from '@/ai/flows/generate-what-if-scenario';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { canUseFeature, recordFeatureUsage, FEATURE_NAMES } from '@/lib/usage-limiter';
import Link from 'next/link';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { playNotificationSound } from '@/utils/audioPlayer';
import { Badge } from '@/components/ui/badge';

export default function WhatIfScenarioGeneratorPage() {
  const [baseSituation, setBaseSituation] = useState<string>("");
  const [pointOfDivergence, setPointOfDivergence] = useState<string>("");
  const [numberOfVariations, setNumberOfVariations] = useState<number>(1);
  const [customInstructions, setCustomInstructions] = useState<string>("");
  
  const [generatedOutput, setGeneratedOutput] = useState<GenerateWhatIfScenarioOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const { soundSettings } = useSoundSettings();

  const showUpgradeToast = () => {
    toast({
      title: "Daily Limit Reached",
      description: "You've used all your free scenario generations for today.",
      variant: "destructive",
      action: ( <Link href="/vip"> <Button variant="secondary" size="sm">Upgrade to VIP</Button> </Link> ),
    });
  };

  const handleGenerateScenario = async () => {
    if (!baseSituation) {
      toast({ title: "Missing Field", description: "Please provide a base situation or premise.", variant: "destructive" });
      return;
    }

    if (!canUseFeature(FEATURE_NAMES.WHAT_IF_SCENARIO_GENERATOR)) {
      showUpgradeToast();
      return;
    }

    setIsLoading(true);
    setProgressValue(10);
    setGeneratedOutput(null);
    
    const progressInterval = setInterval(() => {
        setProgressValue(prev => Math.min(prev + 5, 90));
    }, 700);

    try {
      const input: GenerateWhatIfScenarioInput = { baseSituation, pointOfDivergence, numberOfVariations, customInstructions };
      const result = await generateWhatIfScenario(input);
      setGeneratedOutput(result);
      recordFeatureUsage(FEATURE_NAMES.WHAT_IF_SCENARIO_GENERATOR);
      toast({ title: "Success", description: "Scenarios generated!" });
      playNotificationSound(soundSettings);
    } catch (error) {
      console.error("Error generating scenarios:", error);
      toast({ title: "Error", description: "Failed to generate scenarios. " + (error as Error).message, variant: "destructive" });
    } finally {
      clearInterval(progressInterval);
      setProgressValue(100);
      setIsLoading(false);
      setTimeout(() => setProgressValue(0), 1500);
    }
  };
  
  const formatOutputToText = (output: GenerateWhatIfScenarioOutput | null): string => {
    if (!output) return "";
    let text = `Original Premise Recap:\n${output.originalPremiseRecap}\n\n`;
    text += `Generated Scenarios:\n`;
    output.scenarios.forEach((scenario, index) => {
      text += `\n--- Scenario ${index + 1}: ${scenario.scenarioTitle} ---\n`;
      text += `Description:\n${scenario.scenarioDescription}\n\n`;
      text += `Key Consequences:\n${scenario.keyConsequences.map(c => `- ${c}`).join('\n')}\n`;
      if (scenario.likelihoodAssessment) text += `Likelihood: ${scenario.likelihoodAssessment}\n`;
    });
    return text.trim();
  };

  const handleCopyOutput = () => {
    const outputText = formatOutputToText(generatedOutput);
    if (!outputText) return;
    navigator.clipboard.writeText(outputText)
      .then(() => toast({ title: "Copied!", description: "Scenarios copied to clipboard." }))
      .catch(() => toast({ title: "Error", description: "Failed to copy scenarios.", variant: "destructive" }));
  };
  
  const handleDownloadOutput = (format: 'txt' | 'json') => {
    if (!generatedOutput) return;
    let data = "";
    let fileExtension = format;
    let mimeType = "text/plain";

    if (format === 'json') {
      data = JSON.stringify(generatedOutput, null, 2);
      mimeType = "application/json";
    } else { // txt
      data = formatOutputToText(generatedOutput);
    }
    
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = generatedOutput.scenarios[0]?.scenarioTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'what_if_scenario';
    link.download = `${safeTitle}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: `Scenarios ${format.toUpperCase()} downloaded.` });
  };


  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Lightbulb className="mr-3 h-8 w-8" /> AI "What-If" Scenario Generator
          </CardTitle>
          <CardDescription>Explore plausible alternative outcomes or "what-if" scenarios for given situations.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="font-headline text-xl">Scenario Parameters</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label htmlFor="baseSituation">Base Situation/Premise</Label><Textarea id="baseSituation" placeholder="e.g., What if Rome never fell?" value={baseSituation} onChange={(e) => setBaseSituation(e.target.value)} rows={3}/></div>
            <div><Label htmlFor="pointOfDivergence">Point of Divergence (Optional)</Label><Textarea id="pointOfDivergence" placeholder="e.g., A key battle was won by the other side." value={pointOfDivergence} onChange={(e) => setPointOfDivergence(e.target.value)} rows={2}/></div>
            <div>
              <Label htmlFor="numberOfVariations">Number of Scenario Variations (1-3)</Label>
              <Select value={String(numberOfVariations)} onValueChange={(val) => setNumberOfVariations(Number(val))}>
                <SelectTrigger id="numberOfVariations"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Scenario</SelectItem>
                  <SelectItem value="2">2 Scenarios</SelectItem>
                  <SelectItem value="3">3 Scenarios</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="customInstructions">Custom Instructions (Optional)</Label><Textarea id="customInstructions" placeholder="e.g., Focus on technological impact. Keep it optimistic." value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} rows={2}/></div>
            <Button onClick={handleGenerateScenario} disabled={isLoading} className="w-full">
              <Sparkles className="mr-2 h-5 w-5" /> {isLoading ? "Generating Scenarios..." : "Generate Scenarios"}
            </Button>
            {isLoading && <Progress value={progressValue} className="w-full mt-2" />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="font-headline text-xl">Generated "What-If" Scenarios</CardTitle></CardHeader>
          <CardContent className="min-h-[500px]">
            {isLoading && !generatedOutput && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /><p className="text-lg">AI is exploring alternative realities...</p>
              </div>
            )}
            {!isLoading && !generatedOutput && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Lightbulb className="h-16 w-16 mb-4" /><p>Your "what-if" scenarios will appear here.</p>
              </div>
            )}
            {generatedOutput && (
              <ScrollArea className="h-[calc(100vh-22rem)] p-1">
                <div className="space-y-6">
                  <Card className="bg-secondary/20">
                    <CardHeader><CardTitle className="font-headline text-lg !mt-0 !mb-1">Original Premise Recap</CardTitle></CardHeader>
                    <CardContent><p className="text-sm !my-0">{generatedOutput.originalPremiseRecap}</p></CardContent>
                  </Card>
                  
                  <h3 className="font-headline text-xl text-primary pt-4 border-t">Generated Scenarios:</h3>
                  <div className="space-y-4">
                    {generatedOutput.scenarios.map((scenario: Scenario, index: number) => (
                      <Card key={index} className="bg-card border shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold">{index + 1}. {scenario.scenarioTitle}</CardTitle>
                          {scenario.likelihoodAssessment && (
                            <Badge variant="outline" className="mt-1 text-xs w-fit">
                              {scenario.likelihoodAssessment.includes("plausible") ? <CheckCircle className="h-3 w-3 mr-1.5 text-green-500"/> : 
                               scenario.likelihoodAssessment.includes("unlikely") ? <AlertTriangle className="h-3 w-3 mr-1.5 text-yellow-500"/> : 
                               <HelpCircle className="h-3 w-3 mr-1.5 text-blue-500"/>}
                              {scenario.likelihoodAssessment}
                            </Badge>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          <div>
                            <strong className="text-primary">Description:</strong>
                            <p className="text-foreground/80 whitespace-pre-line mt-1">{scenario.scenarioDescription}</p>
                          </div>
                           <div>
                            <strong className="text-primary">Key Consequences:</strong>
                            <ul className="list-disc pl-5 mt-1 space-y-0.5 text-foreground/80">
                              {scenario.keyConsequences.map((consequence, i) => <li key={i}>{consequence}</li>)}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <CardFooter className="justify-center pt-6 border-t gap-2 !mt-8 !px-0">
                      <Button variant="outline" onClick={handleCopyOutput}><Copy className="mr-2 h-4 w-4" /> Copy Text</Button>
                      <Button variant="outline" onClick={() => handleDownloadOutput('txt')}><Download className="mr-2 h-4 w-4" /> TXT</Button>
                      <Button variant="outline" onClick={() => handleDownloadOutput('json')}><Download className="mr-2 h-4 w-4" /> JSON</Button>
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

