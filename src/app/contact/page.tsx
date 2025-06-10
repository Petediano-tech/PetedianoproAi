import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageCircle, PhoneCall, Share2 } from "lucide-react"; // Using MessageCircle for WhatsApp/SMS
import Link from "next/link";
import { Logo } from "@/components/icons/Logo";
import { ModeToggle } from "@/components/ModeToggle";

// Simple SVG icons for brands if not in Lucide
const FacebookIcon = () => <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>;
const TikTokIcon = () => <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>;
const YouTubeIcon = () => <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>;


const contactMethods = [
  { icon: <MessageCircle className="h-6 w-6 text-primary" />, label: "WhatsApp", value: "0982001368", href: "https://wa.me/265982001368" },
  { icon: <MessageCircle className="h-6 w-6 text-primary" />, label: "SMS", value: "0982001368", href: "sms:+265982001368" },
  { icon: <PhoneCall className="h-6 w-6 text-primary" />, label: "Call", value: "0982001368", href: "tel:+265982001368" },
  { icon: <Mail className="h-6 w-6 text-primary" />, label: "Email", value: "peterdamiano12masterpro@gmail.com", href: "mailto:peterdamiano12masterpro@gmail.com" },
];

const socialLinks = [
  { icon: <FacebookIcon />, label: "Facebook", href: "https://www.facebook.com/profile.php?id=100086106805333", username: "Peter Damiano" },
  { icon: <TikTokIcon />, label: "TikTok", href: "https://tiktok.com/@petediano", username: "@petediano" },
  { icon: <YouTubeIcon />, label: "YouTube", href: "https://youtube.com/@petediano?si=sZrCONvW0skgBeNW", username: "@petediano" },
];

export default function ContactPage() {
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
      <main className="flex-grow container mx-auto py-12 px-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-4xl text-primary">Get in Touch</CardTitle>
            <CardDescription className="text-lg mt-2">
              Connect with Peter Damiano (Petediano), the creator of Petediano Pro.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <section>
              <h2 className="font-headline text-2xl text-accent mb-4">Contact Details</h2>
              <div className="space-y-4">
                {contactMethods.map((method) => (
                  <div key={method.label} className="flex items-center gap-4 p-4 border rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors">
                    {method.icon}
                    <div>
                      <p className="font-semibold">{method.label}</p>
                      <Link href={method.href} target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline">
                        {method.value}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-headline text-2xl text-accent mb-4">Follow on Social Media</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {socialLinks.map((social) => (
                  <Link key={social.label} href={social.href} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center justify-center gap-2 text-center hover:bg-accent hover:text-accent-foreground transition-colors">
                      {social.icon}
                      <span className="font-semibold">{social.label}</span>
                      <span className="text-xs text-muted-foreground group-hover:text-accent-foreground">{social.username}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </section>
          </CardContent>
        </Card>
      </main>
       <footer className="py-8 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Petediano Pro by Peter Damiano. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
