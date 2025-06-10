
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
    ArrowRight, Edit3, Sparkles, ImageIcon, FileText, Bot, MessageSquare, 
    Settings, DollarSign, Film, Video, Newspaper, Presentation, Share2 as ShareIcon, 
    Users, Brain, Lightbulb 
} from "lucide-react";

const mainFeatures = [
  { title: "AI Photo Editor", description: "Enhance and edit your photos.", icon: Edit3, href: "/photo-editor" },
  { title: "AI Picture Generator", description: "Generate unique images.", icon: ImageIcon, href: "/picture-generator" },
  { title: "Animation Generator", description: "Create animation concepts.", icon: Film, href: "/animation-generator" },
  { title: "File Analyzer", description: "Analyze uploaded files.", icon: FileText, href: "/file-analyzer" },
  { title: "PeteAI Assistant", description: "Your AI-powered assistant.", icon: Bot, href: "/assistant" },
];

const contentGenerationFeatures = [
  { title: "Quotes Generator", description: "Create motivational quotes.", icon: MessageSquare, href: "/content-generator/quotes" },
  { title: "Stories Generator", description: "Develop long-form stories.", icon: FileText, href: "/content-generator/stories" },
  { title: "Video Script Generator", description: "Draft scripts for videos.", icon: Video, href: "/content-generator/video-scripts" },
  { title: "Blog Post Writer", description: "Generate article drafts.", icon: Newspaper, href: "/content-generator/blog-posts" },
  { title: "Presentation Generator", description: "Outline slide presentations.", icon: Presentation, href: "/content-generator/presentations" },
  { title: "Social Media Planner", description: "Plan social media campaigns.", icon: ShareIcon, href: "/content-generator/social-media-plans" },
];

const specializedAIFeatures = [
    { title: "Character Persona Gen", description: "Develop character profiles.", icon: Users, href: "/specialized-ai/character-persona"},
    { title: '"What If" Scenarios', description: "Explore alternative outcomes.", icon: Lightbulb, href: "/specialized-ai/what-if-scenario"},
];


export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="bg-card p-6 rounded-lg shadow-md">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">
          Welcome to your Dashboard!
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Ready to create something amazing today? Explore your AI toolkit below.
        </p>
      </div>

      <Section title="Core Tools" features={mainFeatures} />
      <Section title="Content Generation Suite" features={contentGenerationFeatures} />
      <Section title="Specialized AI Tools" features={specializedAIFeatures} />

      <div className="grid gap-6 md:grid-cols-2">
         <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-accent" />
              <CardTitle className="font-headline text-2xl">App Settings</CardTitle>
            </div>
            <CardDescription className="pt-2">Customize your app experience, manage your profile, and more.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings">
              <Button variant="outline" className="w-full">
                Open Settings <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-xl transition-shadow">
          <CardHeader>
             <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary-foreground" />
              <CardTitle className="font-headline text-2xl">Unlock VIP</CardTitle>
            </div>
            <CardDescription className="pt-2 text-primary-foreground/80">Access exclusive features and unlimited generations by upgrading to VIP.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/vip">
              <Button variant="secondary" className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                Explore VIP Plans <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface Feature {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
}

interface SectionProps {
  title: string;
  features: Feature[];
}

function Section({ title, features }: SectionProps) {
  if (!features || features.length === 0) return null;
  return (
    <div>
      <h2 className="font-headline text-2xl md:text-3xl font-semibold text-primary mb-6">{title}</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <feature.icon className="h-8 w-8 text-primary" />
                <CardTitle className="font-headline text-2xl">{feature.title}</CardTitle>
              </div>
              <CardDescription className="pt-2">{feature.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow" /> {/* Pushes button to bottom */}
            <CardContent>
              <Link href={feature.href}>
                <Button className="w-full">
                  Go to {feature.title} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
