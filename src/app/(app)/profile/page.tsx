
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Edit } from 'lucide-react';
import Link from "next/link";

// Generic user data - replace with actual auth and state management
const user = {
  name: 'Your Name',
  username: 'your_username',
  email: 'your.email@example.com',
  profilePictureUrl: '', 
  bio: 'Your bio will appear here. You can edit this in settings.',
  joinDate: new Date().toLocaleDateString(), 
};

const getInitials = (name: string) => {
  if (!name) return 'U';
  const names = name.split(' ');
  if (names.length === 1 && names[0].length > 0) return names[0][0].toUpperCase();
  if (names.length > 1 && names[0].length > 0 && names[names.length-1].length > 0) {
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  }
  return 'U';
};

export default function ProfilePage() {
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
              <AvatarImage src={user.profilePictureUrl || `https://placehold.co/128x128.png?text=${getInitials(user.name)}`} alt={user.name} data-ai-hint="user avatar large"/>
              <AvatarFallback className="text-4xl">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <CardTitle className="font-headline text-4xl text-primary">{user.name}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">@{user.username}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-accent mb-1">About Me</h3>
            <p className="text-foreground/80 bg-secondary/30 p-3 rounded-md">{user.bio || "No bio provided."}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-md bg-secondary/20">
                <Mail className="h-5 w-5 text-primary"/>
                <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-md bg-secondary/20">
                <User className="h-5 w-5 text-primary"/>
                <div>
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="font-medium">{user.joinDate}</p>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
