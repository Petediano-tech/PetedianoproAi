
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Logo } from "@/components/icons/Logo";

export default function PrivacyPage() {
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
            <CardTitle className="font-headline text-4xl text-primary">Privacy Policy</CardTitle>
            <CardDescription className="text-lg mt-2">
              Last Updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 prose dark:prose-invert max-w-none">
            <p>Welcome to Petediano Pro. Your privacy is critically important to us. This Privacy Policy document outlines the types of information that is collected and recorded by Petediano Pro and how we use it.</p>
            
            <h2 className="font-headline text-2xl text-accent">1. Information We Collect</h2>
            <p>We collect information that you provide to us directly, such as when you create an account, and information that is automatically collected when you use our services.</p>
            <ul>
                <li><strong>Personal Data</strong>: When you register for an account, we may ask for your contact information, including items such as name, email address, and a password.</li>
                <li><strong>Usage Data</strong>: We may also collect information that your browser sends whenever you visit our Service or when you access the Service by or through a mobile device.</li>
                <li><strong>Content Data</strong>: We collect the content you create, upload, or receive from others when using our services. This includes things like photos you edit, stories you write, and prompts you enter.</li>
            </ul>

            <h2 className="font-headline text-2xl text-accent">2. How We Use Your Information</h2>
            <p>We use the information we collect in various ways, including to:</p>
            <ul>
              <li>Provide, operate, and maintain our website</li>
              <li>Improve, personalize, and expand our website</li>
              <li>Understand and analyze how you use our website</li>
              <li>Develop new products, services, features, and functionality</li>
              <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</li>
              <li>Send you emails</li>
              <li>Find and prevent fraud</li>
            </ul>

            <h2 className="font-headline text-2xl text-accent">3. Log Files</h2>
            <p>Petediano Pro follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable.</p>
            
            <h2 className="font-headline text-2xl text-accent">4. Third-Party Services</h2>
            <p>We use third-party services like Firebase for authentication and database management, and Google's Generative AI (Genkit) to power our AI features. These services may collect information used to identify you. We encourage you to review their privacy policies.</p>
            
            <h2 className="font-headline text-2xl text-accent">5. Data Security</h2>
            <p>The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>
            
            <h2 className="font-headline text-2xl text-accent">6. Your Data Rights</h2>
            <p>You have the right to access, update or to delete the information we have on you. Whenever made possible, you can access, update or request deletion of your Personal Data directly within your account settings section. If you are unable to perform these actions yourself, please contact us to assist you.</p>

            <h2 className="font-headline text-2xl text-accent">7. Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the "Last updated" date at the top of this Privacy Policy.</p>
            
            <p>If you have any questions about this Privacy Policy, please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.</p>
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
