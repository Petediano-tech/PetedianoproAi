
"use client";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { GalleryHorizontal, ThumbsUp, User } from "lucide-react";
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Mock data - in a real app, this would come from a database.
const galleryItems = [
  { id: 1, type: 'image', title: 'Sunset over Neo-Kyoto', author: 'CyberArtisan', likes: 128, url: 'https://placehold.co/600x400.png', dataAiHint: 'cyberpunk city' },
  { id: 2, type: 'image', title: 'Forest Guardian', author: 'MythWeaver', likes: 256, url: 'https://placehold.co/600x400.png', dataAiHint: 'fantasy creature' },
  { id: 3, type: 'story', title: 'The Last Starship', author: 'StoryTellerX', likes: 95, content: 'The engines hummed a lonely song, a requiem for a galaxy left behind. Captain Eva Rostova stared at the swirling nebula on the main viewer, a cosmic tombstone for a billion souls...' },
  { id: 4, type: 'image', title: 'Steampunk Explorer', author: 'Cogsmith', likes: 180, url: 'https://placehold.co/600x400.png', dataAiHint: 'steampunk character' },
  { id: 5, type: 'story', title: 'Recipe for Disaster', author: 'ChefChaos', likes: 72, content: 'The first rule of interdimensional baking is to never, ever substitute a quasar crystal for baking soda. I, of course, had done exactly that. The gingerbread house was now... expanding.' },
  { id: 6, type: 'image', title: 'Lost Ruins of Atlantis', author: 'DeepDive', likes: 310, url: 'https://placehold.co/600x400.png', dataAiHint: 'underwater ruins' },
];

type GalleryItemType = typeof galleryItems[0];

const GalleryCard = ({ item }: { item: GalleryItemType }) => {
  return (
    <Card className="overflow-hidden flex flex-col">
      {item.type === 'image' && (
        <div className="aspect-video relative">
          <Image src={item.url} alt={item.title} layout="fill" objectFit="cover" data-ai-hint={item.dataAiHint} />
        </div>
      )}
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
        <CardDescription className="flex items-center gap-1 text-xs pt-1">
            <User className="h-3 w-3" /> By {item.author}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {item.type === 'story' && (
          <p className="text-sm text-muted-foreground line-clamp-4">{item.content}</p>
        )}
         {item.type === 'image' && (
          <div className="h-1"></div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-secondary/20 py-2 px-4">
        <Badge variant={item.type === 'image' ? 'default' : 'secondary'}>{item.type}</Badge>
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <ThumbsUp className="h-4 w-4" /> {item.likes}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function CommunityGalleryPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <GalleryHorizontal className="mr-3 h-8 w-8" /> Community Gallery
          </CardTitle>
          <CardDescription>Explore amazing creations made by the Petediano Pro community. Get inspired!</CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleryItems.map(item => (
          <GalleryCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
