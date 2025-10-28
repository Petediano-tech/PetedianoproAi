
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
import { LogOut, User as UserIcon, Settings } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';
import { GlobalLoadingIndicator } from '@/components/layout/GlobalLoadingIndicator';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // This is a simple, insecure client-side check for admin.
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

    // During the initial auth state check, don't redirect yet.
    if (isUserLoading) {
      return;
    }

    // If not admin and not a regular logged-in user, redirect to login.
    if (!isAdmin && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = () => {
    if (sessionStorage.getItem('isAdmin') === 'true') {
        sessionStorage.removeItem('isAdmin');
        router.push('/');
    } else {
        signOut(auth).then(() => {
            router.push('/');
        });
    }
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
  if (!user && !(sessionStorage.getItem('isAdmin') === 'true')) {
    return null;
  }
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const displayName = user?.displayName || (sessionStorage.getItem('isAdmin') === 'true' ? 'Admin' : 'User');
  const displayEmail = user?.email || '';

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
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                       <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center p-2 h-auto">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.photoURL || undefined} alt={displayName} data-ai-hint="user avatar" />
                                <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                            </Avatar>
                            <div className="text-left group-data-[collapsible=icon]:hidden">
                                <p className="font-semibold text-sm truncate">{displayName}</p>
                                <p className="text-xs text-sidebar-foreground/70 truncate">{displayEmail}</p>
                            </div>
                        </div>
                       </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator/>
                      <DropdownMenuItem asChild>
                          <Link href="/settings"><Settings className="mr-2 h-4 w-4"/> Settings</Link>
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Logout</span>
                      </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
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
