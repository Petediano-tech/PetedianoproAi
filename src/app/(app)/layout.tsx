
"use client";

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
import { LogOut, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';
import { GlobalLoadingIndicator } from '@/components/layout/GlobalLoadingIndicator';
import { useAuth } from '@/context/AuthProvider';
import { usePathname } from 'next/navigation';

const AUTH_PAGES = ['/login', '/signup', '/forgot-password', '/'];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  if (AUTH_PAGES.includes(pathname)) {
    return <>{children}</>;
  }
  
  if (loading) {
     return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // This part should technically not be reached due to the AuthProvider redirect,
    // but it's a good failsafe.
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
             <Button onClick={logout} variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center">
                <LogOut className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
                <span className="group-data-[collapsible=icon]:hidden">Logout</span>
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
