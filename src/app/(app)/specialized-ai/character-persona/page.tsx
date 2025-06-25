
"use client";
import * as React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Sparkles, Loader2, Download, Copy, Shield, HeartCrack, Palette as AppearanceIcon, BookOpen, Smile } from "lucide-react";
import { generateCharacterPersona, type GenerateCharacterPersonaInput, type GenerateCharacterPersonaOutput } from '@/ai/flows/generate-character-persona';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { canUseFeature, recordFeatureUsage, FEATURE_NAMES } from '@/lib/usage-limiter';
import Link from 'next/link';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { playNotificationSound } from '@/utils/audioPlayer';
import { Badge } from '@/components/ui/badge';

export default function CharacterPersonaGeneratorPage() {
  const [archetype, setArchetype] = useState<string>("");
  const [keyTraits, setKeyTraits] = useState<string>("");
  const [setting, setSetting] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  
  const [generatedPersona, setGeneratedPersona] = useState<GenerateCharacterPersonaOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const { soundSettings } = useSoundSettings();

  const showUpgradeToast = () => {
    toast({
      title: "Daily Limit Reached",
      description: "You've used all your free persona generations for today.",
      variant: "destructive",
      action: ( <Link href="/vip"> <Button variant="secondary" size="sm">Upgrade to VIP</Button> </Link> ),
    });
  };

  const handleGeneratePersona = async () => {
    if (!archetype) {
      toast({ title: "Missing Field", description: "Please provide a character archetype or role.", variant: "destructive" });
      return;
    }

    if (!canUseFeature(FEATURE_NAMES.CHARACTER_PERSONA_GENERATOR)) {
      showUpgradeToast();
      return;
    }

    setIsLoading(true);
    setProgressValue(10);
    setGeneratedPersona(null);
    
    const progressInterval = setInterval(() => {
        setProgressValue(prev => Math.min(prev + 5, 90));
    }, 600);

    try {
      const input: GenerateCharacterPersonaInput = { archetype, keyTraits, setting, customPrompt };
      const result = await generateCharacterPersona(input);
      setGeneratedPersona(result);
      recordFeatureUsage(FEATURE_NAMES.CHARACTER_PERSONA_GENERATOR);
      toast({ title: "Success", description: "Character persona generated!" });
      playNotificationSound(soundSettings);
    } catch (error) {
      console.error("Error generating persona:", error);
      toast({ title: "Error", description: "Failed to generate persona. " + (error as Error).message, variant: "destructive" });
    } finally {
      clearInterval(progressInterval);
      setProgressValue(100);
      setIsLoading(false);
      setTimeout(() => setProgressValue(0), 1500);
    }
  };

  const formatPersonaToText = (persona: GenerateCharacterPersonaOutput | null): string => {
    if (!persona) return "";
    let text = `Name Suggestion: ${persona.nameSuggestion}\n\n`;
    text += `Appearance:\n${persona.appearance}\n\n`;
    text += `Backstory:\n${persona.backstory}\n\n`;
    text += `Motivations:\n${persona.motivations.map(m => `- ${m}`).join('\n')}\n\n`;
    text += `Flaws:\n${persona.flaws.map(f => `- ${f}`).join('\n')}\n\n`;
    text += `Personality Summary:\n${persona.personalitySummary}\n\n`;
    if (persona.quirks && persona.quirks.length > 0) {
        text += `Quirks:\n${persona.quirks.map(q => `- ${q}`).join('\n')}\n\n`;
    }
    return text.trim();
  };

  const handleCopyPersona = () => {
    const personaText = formatPersonaToText(generatedPersona);
    if (!personaText) return;
    navigator.clipboard.writeText(personaText)
      .then(() => toast({ title: "Copied!", description: "Persona copied to clipboard." }))
      .catch(() => toast({ title: "Error", description: "Failed to copy persona.", variant: "destructive" }));
  };
  
  const handleDownloadPersona = (format: 'txt' | 'json') => {
    if (!generatedPersona) return;
    let data = "";
    let fileExtension = format;
    let mimeType = "text/plain";

    if (format === 'json') {
      data = JSON.stringify(generatedPersona, null, 2);
      mimeType = "application/json";
    } else { // txt
      data = formatPersonaToText(generatedPersona);
    }
    
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = generatedPersona.nameSuggestion.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeName || 'character_persona'}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: `Persona ${format.toUpperCase()} downloaded.` });
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Users className="mr-3 h-8 w-8" /> AI Character Persona Generator
          </CardTitle>
          <CardDescription>Flesh out detailed character profiles including backstory, motivations, and appearance.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="font-headline text-xl">Character Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label htmlFor="archetype">Archetype/Role</Label><Input id="archetype" placeholder="e.g., Wise Old Mentor" value={archetype} onChange={(e) => setArchetype(e.target.value)} /></div>
            <div><Label htmlFor="keyTraits">Key Traits/Skills (Optional, comma-separated)</Label><Input id="keyTraits" placeholder="e.g., Patient, Insightful, Secretive" value={keyTraits} onChange={(e) => setKeyTraits(e.target.value)} /></div>
            <div><Label htmlFor="setting">Setting/Genre (Optional)</Label><Input id="setting" placeholder="e.g., High Fantasy, Sci-Fi Dystopia" value={setting} onChange={(e) => setSetting(e.target.value)} /></div>
            <div><Label htmlFor="customPrompt">Additional Instructions (Optional)</Label><Textarea id="customPrompt" placeholder="e.g., Needs a tragic past related to a lost artifact." value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} rows={3}/></div>
            <Button onClick={handleGeneratePersona} disabled={isLoading} className="w-full">
              <Sparkles className="mr-2 h-5 w-5" /> {isLoading ? "Generating Persona..." : "Generate Persona"}
            </Button>
            {isLoading && <Progress value={progressValue} className="w-full mt-2" />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="font-headline text-xl">Generated Character Persona</CardTitle></CardHeader>
          <CardContent className="min-h-[500px]">
            {isLoading && !generatedPersona && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /><p className="text-lg">AI is crafting your character...</p>
              </div>
            )}
            {!isLoading && !generatedPersona && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Users className="h-16 w-16 mb-4" /><p>Your character persona will appear here.</p>
              </div>
            )}
            {generatedPersona && (
              <ScrollArea className="h-[calc(100vh-22rem)] p-1">
                <div className="space-y-6">
                  <h2 className="font-headline text-3xl text-center text-accent !mb-2">{generatedPersona.nameSuggestion}</h2>
                  
                  <Section title="Appearance" icon={<AppearanceIcon/>}>{generatedPersona.appearance}</Section>
                  <Section title="Backstory" icon={<BookOpen/>}>{generatedPersona.backstory}</Section>
                  <Section title="Personality Summary" icon={<Smile/>}>{generatedPersona.personalitySummary}</Section>
                  
                  <ListSection title="Motivations" items={generatedPersona.motivations} icon={<Shield/>} />
                  <ListSection title="Flaws" items={generatedPersona.flaws} icon={<HeartCrack/>} />
                  {generatedPersona.quirks && generatedPersona.quirks.length > 0 && (
                    <ListSection title="Quirks" items={generatedPersona.quirks} icon={<Sparkles className="text-yellow-500"/>} />
                  )}

                  <CardFooter className="justify-center pt-6 border-t gap-2 !mt-8 !px-0">
                      <Button variant="outline" onClick={handleCopyPersona}><Copy className="mr-2 h-4 w-4" /> Copy Text</Button>
                      <Button variant="outline" onClick={() => handleDownloadPersona('txt')}><Download className="mr-2 h-4 w-4" /> TXT</Button>
                      <Button variant="outline" onClick={() => handleDownloadPersona('json')}><Download className="mr-2 h-4 w-4" /> JSON</Button>
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
        <Card className="bg-card border shadow-sm">
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

function ListSection({ title, items, icon }: { title: string; items: string[], icon?: React.ReactNode }) {
    if (!items || items.length === 0) return null;
    return (
        <Card className="bg-card border shadow-sm">
            <CardHeader>
                 <CardTitle className="font-headline text-lg flex items-center">
                    {icon && React.cloneElement(icon as React.ReactElement, { className: "mr-2 h-5 w-5 text-primary"})}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="list-none space-y-1">
                    {items.map((item, index) => <li key={index}><Badge variant="secondary" className="text-sm font-normal">{item}</Badge></li>)}
                </ul>
            </CardContent>
        </Card>
    )
}
