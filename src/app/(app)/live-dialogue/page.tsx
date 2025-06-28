
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessagesSquare, HardHat } from "lucide-react";

export default function LiveDialogueMaintenancePage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <MessagesSquare className="mr-3 h-8 w-8" /> AI Live Dialogue Generator
          </CardTitle>
          <CardDescription>Create multi-speaker audio stories with character voices, soundscapes, and optional AI-generated images.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6 text-center min-h-[400px] flex flex-col items-center justify-center">
          <HardHat className="h-24 w-24 text-primary mb-6 opacity-50" />
          <h2 className="font-headline text-2xl mb-2">Feature Under Maintenance</h2>
          <p className="text-muted-foreground max-w-md">
            The Live Dialogue feature is currently undergoing improvements to ensure it's reliable and robust. 
            We apologize for the inconvenience and will bring it back better than ever soon!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
