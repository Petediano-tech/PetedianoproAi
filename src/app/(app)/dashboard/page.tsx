
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Edit3, Sparkles, ImageIcon, FileText, Bot, MessageSquare, Settings, DollarSign, Film } from "lucide-react";

const mainFeatures = [
  { title: "AI Photo Editor", description: "Enhance and edit your photos.", icon: Edit3, href: "/photo-editor" },
  { title: "Content Generation", description: "Create quotes and stories.", icon: Sparkles, href: "/content-generator/quotes" },
  { title: "Picture Generator", description: "Generate unique images.", icon: ImageIcon, href: "/picture-generator" },
  { title: "Animation Generator", description: "Create animation concepts.", icon: Film, href: "/animation-generator" },
  { title: "File Analyzer", description: "Analyze uploaded files.", icon: FileText, href: "/file-analyzer" },
  { title: "PeteAI Assistant", description: "Your AI-powered assistant.", icon: Bot, href: "/assistant" },
];

// Dummy user data
const user = {
  name: "Peter",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="bg-card p-6 rounded-lg shadow-md">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">
          Welcome back, {user.name}!
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Ready to create something amazing today? Explore your AI toolkit below.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mainFeatures.map((feature) => (
          <Card key={feature.title} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <feature.icon className="h-8 w-8 text-primary" />
                <CardTitle className="font-headline text-2xl">{feature.title}</CardTitle>
              </div>
              <CardDescription className="pt-2">{feature.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow" />
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
