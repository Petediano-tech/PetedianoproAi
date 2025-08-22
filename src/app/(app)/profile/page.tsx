
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Edit, Calendar } from 'lucide-react';
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";

const getInitials = (name: string | null | undefined) => {
  if (!name) return 'U';
  const names = name.split(' ');
  if (names.length === 1 && names[0].length > 0) return names[0][0].toUpperCase();
  if (names.length > 1 && names[0].length > 0 && names[names.length-1].length > 0) {
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  }
  return 'U';
};

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null; // Or a loading spinner, though AuthProvider should prevent this
  }
  
  const joinDate = user.metadata.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : 'N/A';

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="relative">
          <div className="absolute top-4 right-4">
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Edit className="h-5 w-5" />
                <span className="sr-only">Edit Profile</span>
              </Button>
            </Link>
          </div>
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-32 w-32 mb-4 border-4 border-primary shadow-lg">
              <AvatarImage src={user.photoURL || `https://placehold.co/128x128.png?text=${getInitials(user.displayName)}`} alt={user.displayName || 'User'} data-ai-hint="user avatar large"/>
              <AvatarFallback className="text-4xl">{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
            <CardTitle className="font-headline text-4xl text-primary">{user.displayName || 'No Name Provided'}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">@{user.displayName?.toLowerCase().replace(' ', '_') || 'username'}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-accent mb-1">About Me</h3>
            <p className="text-foreground/80 bg-secondary/30 p-3 rounded-md">{"Bio not available yet."}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-md bg-secondary/20">
                <Mail className="h-5 w-5 text-primary"/>
                <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email || 'No Email'}</p>
                </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-md bg-secondary/20">
                <Calendar className="h-5 w-5 text-primary"/>
                <div>
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="font-medium">{joinDate}</p>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
