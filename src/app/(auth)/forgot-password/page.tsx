
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, MailCheck } from 'lucide-react';
import { Logo } from '@/components/icons/Logo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const auth = useAuth();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your inbox for instructions to reset your password.',
      });
    } catch (error: any) {
      console.error('Password reset failed:', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
        errorMessage = 'No user found with this email address. Please check the email and try again.';
      }
      toast({
        title: 'Password Reset Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
           <Link href="/" className="flex justify-center mb-4">
            <Logo className="h-10 w-auto" />
          </Link>
          <CardTitle className="font-headline text-3xl">Forgot Your Password?</CardTitle>
          <CardDescription>No worries. Enter your email and we&apos;ll send you a reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="text-center space-y-4">
              <MailCheck className="h-16 w-16 text-green-500 mx-auto" />
              <p className="text-lg font-semibold">Check your email</p>
              <p className="text-muted-foreground">
                We&apos;ve sent a password reset link to <span className="font-bold">{email}</span>.
              </p>
               <Button asChild className="w-full">
                  <Link href="/login">Back to Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send Reset Link
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
