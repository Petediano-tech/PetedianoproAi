
"use client";

import Image from 'next/image';
import { WifiOff } from 'lucide-react';

export default function OfflineFallback() {
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
      <p className="text-sm text-muted-foreground mt-12">
        Petediano Pro needs an internet connection to work its magic.
      </p>
    </div>
  );
}
