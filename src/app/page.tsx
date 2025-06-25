
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Sparkles, Edit3, Bot, FileText, ImageIcon, LogOut, Film } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/icons/Logo";
import { ModeToggle } from "@/components/ModeToggle";
import { AppHeader } from '@/components/layout/AppHeader';
import { NavLinks } from '@/components/layout/NavLinks';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
} from '@/components/ui/sidebar';

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
    icon: <Film className="h-8 w-8 text-primary" />,
    title: "AI Anime Story Generator",
    description: "Create anime-style stories, complete with beautifully generated images.",
    link: "/animation-generator",
    actionText: "Generate a Story"
  },
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: "PeteAI Assistant",
    description: "Your personal AI brainstormer and helper for various tasks.",
    link: "/assistant",
    actionText: "Chat with PeteAI"
  },
];

export default function HomePage() {
  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        
        {/* Mobile Sidebar (Sheet) logic is handled by the Sidebar component */}
        <Sidebar className="bg-sidebar text-sidebar-foreground">
          <SidebarHeader className="p-4 border-b border-sidebar-border">
            <Link href="/" className="flex items-center">
              <Logo className="h-8 w-auto fill-sidebar-foreground" />
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              <NavLinks />
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

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
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Explore Features
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
                    <CardFooter className="justify-center">
                      <Link href={feature.link || '/dashboard'}>
                        <Button variant="link" className="text-primary">
                          {feature.actionText} <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardFooter>
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
    </SidebarProvider>
  );
}
