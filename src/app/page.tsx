
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Sparkles, Edit3, Bot, FileText, ImageIcon, KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons/Logo";
import { ModeToggle } from "@/components/ModeToggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';


const features = [
  {
    icon: <Edit3 className="h-8 w-8 text-primary" />,
    title: "AI Photo Editor",
    description: "Enhance, beautify, and transform your photos with powerful AI tools.",
    link: "/photo-editor",
    actionText: "Edit Your Photos"
  },
  {
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    title: "AI Content Generation",
    description: "Create original stories, quotes, and more with creative AI assistance.",
    link: "/content-generator/quotes",
    actionText: "Create Content"
  },
  {
    icon: <ImageIcon className="h-8 w-8 text-primary" />,
    title: "AI Picture Generator",
    description: "Generate stunning visuals, logos, and social media posts from text.",
    link: "/picture-generator",
    actionText: "Generate Images"
  },
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: "PeteAI Assistant",
    description: "Your personal AI brainstormer and helper for various tasks.",
    link: "/assistant",
    actionText: "Chat with PeteAI"
  },
];


function AdminLoginDialog() {
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate a check
    setTimeout(() => {
      if (accessCode === process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE) {
        toast({ title: "Access Granted", description: "Welcome, Admin!" });
        // Store a simple session flag.
        // NOTE: This is not secure for production but matches the request for a simple password.
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('isAdmin', 'true');
        }
        router.push('/dashboard');
      } else {
        toast({ title: "Access Denied", description: "The provided code is incorrect.", variant: "destructive" });
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center"><KeyRound className="mr-2"/>Admin Access</AlertDialogTitle>
        <AlertDialogDescription>
          Please enter the administrator access code to proceed to the dashboard.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <Input 
        type="password"
        placeholder="Enter access code"
        value={accessCode}
        onChange={(e) => setAccessCode(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
      />
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={handleLogin} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
          Proceed
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}


export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>Admin Login</Button>
              </AlertDialogTrigger>
              <AdminLoginDialog />
            </AlertDialog>
          </div>
        </div>
      </header>
        
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32 text-center bg-gradient-to-b from-background to-background/80">
          <div className="container">
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight animated-gradient-text">
              Welcome to Petediano
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-foreground/80">
              Unleash your creativity with a suite of powerful AI tools designed by Peter Damiano. Edit photos, generate content, analyze files, and much more, all in one professional application.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
               <AlertDialog>
                <AlertDialogTrigger asChild>
                   <Button size="lg" className="w-full sm:w-auto">
                    Admin Access <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </AlertDialogTrigger>
                <AdminLoginDialog />
              </AlertDialog>

              <Link href="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Contact Me
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-headline text-3xl md:text-4xl font-semibold text-primary">
                Powerful Features at Your Fingertips
              </h2>
              <p className="mt-4 text-foreground/70 max-w-xl mx-auto">
                Discover what Petediano Pro can do for you.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="items-center">
                    {feature.icon}
                    <CardTitle className="font-headline mt-4 text-2xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-foreground/70">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Petediano Pro by Peter Damiano. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/contact" className="hover:text-primary">Contact</Link>
            <Link href="/faq" className="hover:text-primary">FAQ</Link>
            <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
