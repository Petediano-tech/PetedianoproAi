import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Logo } from "@/components/icons/Logo";

const faqs = [
  {
    question: "What is Petediano Pro?",
    answer: "Petediano Pro is a comprehensive application designed by Peter Damiano, offering a suite of AI-powered tools for photo editing, content generation, file analysis, picture creation, and more. It aims to provide professional-grade creative capabilities to all users."
  },
  {
    question: "How do I create an account?",
    answer: "You can create an account by clicking the 'Sign Up' button on the homepage or login page. You can sign up using your Google account or by providing a username, email address, and creating a password."
  },
  {
    question: "What AI features are available?",
    answer: "Petediano Pro includes an AI Photo Editor (enhancement, effects, background removal), AI Content Generator (motivational quotes, funny quotes, long stories with images), AI File Analyzer (describes file content, source, extracts text), AI Picture Generator (wallpapers, logos, flyers), and the PeteAI Assistant for brainstorming and support."
  },
  {
    question: "Is there a free trial or free tier?",
    answer: "Yes, Petediano Pro offers a free tier that allows users to generate up to 5 items per feature per day. For unlimited access and more benefits, you can upgrade to a VIP membership."
  },
  {
    question: "How does the VIP membership work?",
    answer: "VIP membership provides unlimited generations for all features, priority support, and other exclusive benefits. There are several plans available (Monthly, Quarterly, Yearly, Lifetime). You can subscribe using Malawian payment methods like Airtel Money or TNM Mpamba. After payment, send a screenshot to Peter Damiano for activation."
  },
  {
    question: "Can I use my own passkey for VIP access?",
    answer: "The owner of the app, Peter Damiano, has a special Pro VIP passkey (`Pete012@Ai`). If you have this passkey, you can enter it on the VIP page to activate lifetime VIP access."
  },
  {
    question: "How is my data protected?",
    answer: "We take user privacy and data security seriously. Please refer to our Privacy Policy for detailed information on how we collect, use, and protect your data. You have options to manage your account, including account deletion."
  },
  {
    question: "How do I contact support or Peter Damiano?",
    answer: "You can contact Peter Damiano via WhatsApp, SMS, or call at 0982001368, or email at peterdamiano12masterpro@gmail.com. You can also find his social media links on the Contact page."
  },
  {
    question: "Can I customize the app's appearance?",
    answer: "Yes, the app settings allow users to customize the theme (light/dark mode) and potentially fonts in the future to personalize their experience."
  }
];

export default function FAQPage() {
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
            <CardTitle className="font-headline text-4xl text-primary">Frequently Asked Questions</CardTitle>
            <CardDescription className="text-lg mt-2">
              Find answers to common questions about Petediano Pro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="font-semibold text-left hover:text-primary text-lg">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-foreground/80 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
        <div className="mt-12 text-center">
            <p className="text-muted-foreground">Can&apos;t find your answer?</p>
            <Link href="/contact">
                <Button variant="link" className="text-primary text-lg">Contact Support</Button>
            </Link>
        </div>
      </main>
      <footer className="py-8 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Petediano Pro by Peter Damiano. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
