
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Construction } from "lucide-react";

export default function WhatIfScenarioGeneratorPage() {
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

      <Card>
        <CardContent className="pt-6 text-center min-h-[400px] flex flex-col items-center justify-center">
          <Construction className="h-24 w-24 text-primary mb-6 opacity-50" />
          <h2 className="font-headline text-2xl mb-2">Feature Under Construction</h2>
          <p className="text-muted-foreground max-w-md">
            The AI "What-If" Scenario Generator is currently being developed and will be available soon. 
            Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
