"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2 } from "lucide-react";
import TicTacToeGame from "@/components/games/PetedianoPSGame";

export default function GamePage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Gamepad2 className="mr-3 h-8 w-8" /> Game Center
          </CardTitle>
          <CardDescription>Take a break and play a classic game of Tic-Tac-Toe.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6 flex flex-col items-center justify-center">
           <TicTacToeGame />
        </CardContent>
      </Card>
    </div>
  );
}
