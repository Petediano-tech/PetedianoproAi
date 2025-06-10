"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons/Logo";

export default function ForgotPasswordPage() {
  const handlePasswordReset = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle password reset logic
    console.log("Password reset submitted");
    // Show a toast message like "Password reset link sent to your email if it exists in our system."
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <Link href="/" className="inline-block mb-4">
            <Logo className="h-10 w-auto mx-auto" />
          </Link>
          <CardTitle className="font-headline text-3xl text-primary">Forgot Your Password?</CardTitle>
          <CardDescription>No worries! Enter your email address and we&apos;ll send you a link to reset it.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="your@email.com" required />
            </div>
            <Button type="submit" className="w-full">
              Send Reset Link
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/login" passHref>
              <Button variant="link" className="p-0 h-auto text-primary">Login</Button>
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
