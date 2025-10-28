"use client";
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase';
import { collection, doc, updateDoc, increment } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { GalleryHorizontal, ThumbsUp, User, Loader2 } from "lucide-react";
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

// This matches the structure in backend.json for a gallery item
export interface GalleryItem {
  id: string;
  type: 'image' | 'story';
  title: string;
  author: string;
  likes: number;
  url?: string;       // For images
  content?: string;   // For stories
  dataAiHint?: string;
  createdAt: any; // Firestore Timestamp
}

const GalleryCard = ({ item }: { item: GalleryItem }) => {
  const firestore = useFirestore();

  const handleLike = () => {
    if (!firestore || !item.id) return;
    const itemRef = doc(firestore, 'galleryItems', item.id);
    // Non-blocking update for better UX
    updateDoc(itemRef, {
      likes: increment(1)
    }).catch(err => {
      console.error("Error liking item:", err);
      // Optionally show a toast to the user
    });
  };

  return (
    <Card className="overflow-hidden flex flex-col">
      {item.type === 'image' && item.url && (
        <div className="aspect-video relative">
          <Image src={item.url} alt={item.title} layout="fill" objectFit="cover" data-ai-hint={item.dataAiHint} />
        </div>
      )}
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
        <CardDescription className="flex items-center gap-1 text-xs pt-1">
            <User className="h-3 w-3" /> By {item.author || 'Anonymous'}
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
        <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={handleLike}>
          <ThumbsUp className="h-4 w-4" /> {item.likes || 0}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function CommunityGalleryPage() {
  const firestore = useFirestore();
  const galleryItemsQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'galleryItems');
  }, [firestore]);
  
  const { data: galleryItems, isLoading, error } = useCollection<GalleryItem>(galleryItemsQuery);

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
      
       {isLoading && (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      )}

      {error && (
          <div className="text-center text-destructive">
              <p>Error loading gallery: {error.message}</p>
          </div>
      )}

      {!isLoading && !error && galleryItems && galleryItems.length === 0 && (
          <div className="text-center text-muted-foreground">
              <p>The gallery is empty. Be the first to share something!</p>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleryItems?.map(item => (
          <GalleryCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
