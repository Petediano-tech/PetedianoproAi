
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Sparkles, Bot, Edit3, ImageIcon, FileText } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons/Logo";
import { ModeToggle } from "@/components/ModeToggle";

const featureHighlights = [
  {
    icon: <Edit3 className="h-8 w-8 text-accent" />,
    title: "AI Photo Editor",
    description: "Automatically enhance photos, apply effects, and more.",
  },
  {
    icon: <ImageIcon className="h-8 w-8 text-accent" />,
    title: "AI Picture Generator",
    description: "Create stunning wallpapers, logos, and original images from text.",
  },
  {
    icon: <Sparkles className="h-8 w-8 text-accent" />,
    title: "AI Content Suite",
    description: "Generate stories, video scripts, blog posts, and social media plans.",
  },
  {
    icon: <Bot className="h-8 w-8 text-accent" />,
    title: "PeteAI Assistant",
    description: "Your friendly AI helper for brainstorming and app guidance.",
  },
];


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <section className="py-20 md:py-32 text-center">
          <div className="container">
            <div className="animated-gradient-text font-headline text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Unleash Your Creativity
            </div>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
              Welcome to Petediano Pro, your all-in-one AI-powered suite for content creation, photo editing, and idea generation. Let your imagination run wild.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="font-semibold">
                  Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/faq">
                  <Button size="lg" variant="outline">Learn More</Button>
              </Link>
            </div>
          </div>
        </section>
        
        <section className="py-20 md:py-24 bg-secondary/30">
            <div className="container">
                <h2 className="font-headline text-3xl md:text-4xl text-center font-bold text-primary mb-12">Everything You Need to Create</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {featureHighlights.map(feature => (
                        <Card key={feature.title} className="text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <CardHeader>
                                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-2">
                                    {feature.icon}
                                </div>
                                <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

      </main>
      <footer className="py-8 border-t">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Petediano Pro by Peter Damiano. All rights reserved.</p>
            <div className="flex gap-4">
                <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
                <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
                <Link href="/contact" className="hover:text-primary">Contact</Link>
            </div>
        </div>
      </footer>
    </div>
  );
}
