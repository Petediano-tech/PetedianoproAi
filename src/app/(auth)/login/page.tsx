
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/icons/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Missing fields',
        description: 'Please enter both email and password.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      const redirectUrl = searchParams.get('redirect') || '/dashboard';
      router.push(redirectUrl);
    } catch (error: any) {
      console.error('Login failed:', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      }
      toast({
        title: 'Login Failed',
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
          <CardTitle className="font-headline text-3xl">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Log In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-4 text-center text-sm">
           <div>
            <Link href="/forgot-password" passHref>
              <Button variant="link" className="px-0 font-normal">
                Forgot password?
              </Button>
            </Link>
          </div>
          <div>
            Don&apos;t have an account?
            <Link href="/signup" passHref>
              <Button variant="link" className="px-1 font-semibold">
                Sign up
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
