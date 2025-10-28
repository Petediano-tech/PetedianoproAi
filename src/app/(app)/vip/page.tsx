
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, CheckCircle } from "lucide-react";

export default function VipPage() {

  return (
    <div className="container mx-auto py-8 space-y-12">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="font-headline text-4xl text-primary flex items-center justify-center">
            <Crown className="mr-3 h-10 w-10 text-yellow-500" /> Petediano Pro Admin Access
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            All features are fully unlocked.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <CheckCircle className="h-24 w-24 text-green-500 mx-auto" />
            <p className="text-lg mt-4">As the administrator, you have unlimited access to all AI generation tools and features.</p>
        </CardContent>
      </Card>
    </div>
  );
}
