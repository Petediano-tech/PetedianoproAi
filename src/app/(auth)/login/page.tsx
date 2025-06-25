
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/icons/Logo";
import { Info } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <Link href="/" className="inline-block mb-4">
            <Logo className="h-10 w-auto mx-auto" />
          </Link>
          <CardTitle className="font-headline text-3xl text-primary flex items-center justify-center gap-2">
             <Info className="h-8 w-8" />
             Login Information
          </CardTitle>
          <CardDescription>
            The sign-in system is currently not active.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            You can access all application features directly. No need to log in!
          </p>
          <Link href="/dashboard" passHref>
             <Button className="mt-6 w-full">Go to Dashboard</Button>
          </Link>
        </CardContent>
         <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Need to create an account?{" "}
            <Link href="/signup" passHref>
              <Button variant="link" className="p-0 h-auto text-primary">Sign up</Button>
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
