
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Search, Loader2 } from "lucide-react";
import Image from "next/image";
import { analyzeUploadedFile, type AnalyzeUploadedFileInput, type AnalyzeUploadedFileOutput } from '@/ai/flows/analyze-uploaded-file';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { canUseFeature, recordFeatureUsage, FEATURE_NAMES } from '@/lib/usage-limiter';
import Link from 'next/link';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { playNotificationSound } from '@/utils/audioPlayer';

export default function FileAnalyzerPage() {
  const [fileDataUri, setFileDataUri] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeUploadedFileOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { soundSettings } = useSoundSettings();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileDataUri(reader.result as string);
        if (file.type.startsWith("image/")) {
          setFilePreview(reader.result as string);
        } else {
          setFilePreview(null); 
        }
        setFileType(file.type);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const showUpgradeToast = () => {
    toast({
      title: "Daily Limit Reached",
      description: "You've used all your free file analyses for today.",
      variant: "destructive",
      action: (
        <Link href="/vip">
          <Button variant="secondary" size="sm">Upgrade to VIP</Button>
        </Link>
      ),
    });
  };

  const handleAnalyzeFile = async () => {
    if (!fileDataUri) {
      toast({ title: "Error", description: "Please upload a file first.", variant: "destructive" });
      return;
    }

    if (!await canUseFeature(FEATURE_NAMES.FILE_ANALYZER)) {
      showUpgradeToast();
      return;
    }

    setIsLoading(true);
    setProgress(30);
    setAnalysisResult(null);
    try {
      const input: AnalyzeUploadedFileInput = { fileDataUri };
      setTimeout(() => setProgress(60), 500);
      const result: AnalyzeUploadedFileOutput = await analyzeUploadedFile(input);
      setTimeout(() => setProgress(100), 1000);
      setAnalysisResult(result);
      await recordFeatureUsage(FEATURE_NAMES.FILE_ANALYZER);
      toast({ title: "Success", description: "File analyzed successfully!" });
      playNotificationSound(soundSettings);
    } catch (error) {
      console.error("Error analyzing file:", error);
      toast({ title: "Error", description: "Failed to analyze file. " + (error as Error).message, variant: "destructive" });
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
          <CardTitle className="font-headline text-3xl text-primary">AI File Analyzer</CardTitle>
          <CardDescription>Upload a file (image, PDF, etc.) and let AI analyze its content, source, and extract text.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Upload &amp; Analyze</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="file-upload">Upload File</Label>
              <Input id="file-upload" type="file" onChange={handleFileUpload} />
              {fileType && <p className="text-sm text-muted-foreground mt-1">Type: {fileType}</p>}
            </div>
            {filePreview && (
              <div className="border rounded-lg p-2">
                <Image src={filePreview} alt="File preview" width={200} height={200} className="object-contain max-h-[200px] w-auto mx-auto" data-ai-hint="file preview" />
              </div>
            )}
            {!filePreview && fileDataUri && (
                <div className="border rounded-lg p-4 text-center text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-2" />
                    <p>Preview not available for this file type.</p>
                </div>
            )}
            <Button onClick={handleAnalyzeFile} disabled={!fileDataUri || isLoading} className="w-full">
              <Search className="mr-2 h-5 w-5" /> {isLoading ? "Analyzing..." : "Analyze File"}
            </Button>
             {isLoading && <Progress value={progress} className="w-full mt-2" />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[400px]">
            {isLoading && !analysisResult && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p>AI is inspecting your file...</p>
              </div>
            )}
            {!isLoading && !analysisResult && (
              <div className="text-center text-muted-foreground h-full flex flex-col justify-center items-center">
                <FileText className="mx-auto h-16 w-16 mb-4" />
                <p>Upload a file and click &quot;Analyze File&quot; to see results.</p>
              </div>
            )}
            {analysisResult && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-1">File Description:</h3>
                  <p className="text-foreground/80 bg-secondary/30 p-3 rounded-md">{analysisResult.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Generation Details/Source:</h3>
                  <p className="text-foreground/80 bg-secondary/30 p-3 rounded-md">{analysisResult.generationDetails}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Extracted Text:</h3>
                  {analysisResult.extractedText ? (
                    <Textarea value={analysisResult.extractedText} readOnly rows={6} className="bg-secondary/30" />
                  ) : (
                    <p className="text-muted-foreground p-3 bg-secondary/30 rounded-md">No text extracted or not applicable.</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
