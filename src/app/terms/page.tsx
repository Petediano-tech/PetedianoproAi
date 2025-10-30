import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Logo } from "@/components/icons/Logo";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
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
            <CardTitle className="font-headline text-4xl text-primary">Terms of Service</CardTitle>
            <CardDescription className="text-lg mt-2">
              Last Updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 prose dark:prose-invert max-w-none">
            <p>Welcome to Petediano Pro! These terms and conditions outline the rules and regulations for the use of Petediano Pro&apos;s Website, located at [Your App URL].</p>
            <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use Petediano Pro if you do not agree to take all of the terms and conditions stated on this page.</p>
            
            <h2 className="font-headline text-2xl text-accent">1. License</h2>
            <p>Unless otherwise stated, Petediano Pro and/or its licensors own the intellectual property rights for all material on Petediano Pro. All intellectual property rights are reserved. You may access this from Petediano Pro for your own personal use subjected to restrictions set in these terms and conditions.</p>
            <p>You must not:</p>
            <ul>
              <li>Republish material from Petediano Pro</li>
              <li>Sell, rent or sub-license material from Petediano Pro</li>
              <li>Reproduce, duplicate or copy material from Petediano Pro</li>
              <li>Redistribute content from Petediano Pro</li>
            </ul>

            <h2 className="font-headline text-2xl text-accent">2. User Accounts</h2>
            <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
            <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.</p>

            <h2 className="font-headline text-2xl text-accent">3. User-Generated Content</h2>
            <p>Our Service may allow you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material (&quot;Content&quot;). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.</p>
            <p>By posting Content to the Service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service. You retain any and all of your rights to any Content you submit, post or display on or through the Service and you are responsible for protecting those rights.</p>
            
            <h2 className="font-headline text-2xl text-accent">4. Acceptable Use</h2>
            <p>You agree not to use the Service:</p>
            <ul>
                <li>In any way that violates any applicable national or international law or regulation.</li>
                <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way by exposing them to inappropriate content or otherwise.</li>
                <li>To transmit, or procure the sending of, any advertising or promotional material, including any &quot;junk mail,&quot; &quot;chain letter,&quot; &quot;spam,&quot; or any other similar solicitation.</li>
                <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity.</li>
            </ul>

            <h2 className="font-headline text-2xl text-accent">5. Termination</h2>
            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
            <p>Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service or request account deletion through the app settings.</p>

            <h2 className="font-headline text-2xl text-accent">6. Disclaimer</h2>
            <p>The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.</p>

            <h2 className="font-headline text-2xl text-accent">7. Changes to Terms</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days&apos; notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
            
            <p>If you have any questions about these Terms, please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.</p>
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
