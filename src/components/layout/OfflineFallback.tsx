
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import PetedianoPSGame from '@/components/games/PetedianoPSGame';
import { WifiOff, Gamepad2 } from 'lucide-react';

export default function OfflineFallback() {
  const [showGame, setShowGame] = useState(false);

  if (showGame) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <PetedianoPSGame />
        <Button onClick={() => setShowGame(false)} variant="outline" className="mt-4">
          Back to Offline Message
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
      <WifiOff className="h-24 w-24 text-primary opacity-70 mb-6" />
      <h1 className="font-headline text-4xl text-primary mb-3">Oops! You&apos;re Offline</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        It seems your internet connection is taking a little nap. 
        Please check your connection and try again.
      </p>
      <Image 
        src="https://placehold.co/300x200.png" 
        alt="Worried character" 
        width={300} 
        height={200} 
        className="rounded-lg mb-8 shadow-md"
        data-ai-hint="sad robot connection" 
      />
      <Button onClick={() => setShowGame(true)} size="lg">
        <Gamepad2 className="mr-2 h-5 w-5" /> Play Petediano PS While You Wait
      </Button>
      <p className="text-sm text-muted-foreground mt-12">
        Petediano Pro needs an internet connection to work its magic.
      </p>
    </div>
  );
}
