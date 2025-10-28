
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { NavLinks } from '@/components/layout/NavLinks';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';
import { GlobalLoadingIndicator } from '@/components/layout/GlobalLoadingIndicator';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // During the initial auth state check, don't redirect yet.
    if (isUserLoading) {
      return;
    }

    // If not a regular logged-in user, redirect to login.
    if (!user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = () => {
    if (!auth) return;
    signOut(auth).then(() => {
        router.push('/');
    });
  };

  // Show a loading screen while we verify the user's session.
  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If we've confirmed the user is not authenticated, render null to prevent flicker before redirect.
  if (!user) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen>
      <GlobalLoadingIndicator />
      <div className="flex min-h-screen">
        <Sidebar className="bg-sidebar text-sidebar-foreground" collapsible="icon">
          <SidebarHeader className="p-4 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center group-data-[collapsible=icon]:hidden">
                  <Logo className="h-8 w-auto fill-sidebar-foreground" />
                </Link>
                <div className="group-data-[collapsible=icon]:hidden">
                 <SidebarTrigger className="text-sidebar-foreground hover:bg-sidebar-accent" />
                </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              <NavLinks />
            </SidebarMenu>
          </SidebarContent>
           <SidebarFooter className="p-4 border-t border-sidebar-border">
              <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center" onClick={handleLogout}>
                <div className="flex items-center gap-2">
                  <LogOut className="h-5 w-5" />
                  <span className="text-left group-data-[collapsible=icon]:hidden">Logout</span>
                </div>
              </Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col">
          <AppHeader />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
