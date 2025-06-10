
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSignature, Construction } from "lucide-react";

export default function DocumentSummarizerPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <FileSignature className="mr-3 h-8 w-8" /> AI Document Summarizer
          </CardTitle>
          <CardDescription>Upload documents (PDF, DOCX) and get concise summaries of their content.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6 text-center min-h-[400px] flex flex-col items-center justify-center">
          <Construction className="h-24 w-24 text-primary mb-6 opacity-50" />
          <h2 className="font-headline text-2xl mb-2">Feature Under Construction</h2>
          <p className="text-muted-foreground max-w-md">
            The AI Document Summarizer is currently being developed and will be available soon. 
            Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
