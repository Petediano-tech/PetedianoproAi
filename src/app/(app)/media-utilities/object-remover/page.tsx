
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanSearch, Construction } from "lucide-react"; // Using ScanSearch as a placeholder icon

export default function ObjectRemoverPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <ScanSearch className="mr-3 h-8 w-8" /> AI Object Remover / Inpainter
          </CardTitle>
          <CardDescription>Remove unwanted objects from your images and let AI fill in the background.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6 text-center min-h-[400px] flex flex-col items-center justify-center">
          <Construction className="h-24 w-24 text-primary mb-6 opacity-50" />
          <h2 className="font-headline text-2xl mb-2">Feature Under Construction</h2>
          <p className="text-muted-foreground max-w-md">
            The AI Object Remover is currently being developed and will be available soon. 
            Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
