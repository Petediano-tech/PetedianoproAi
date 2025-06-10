
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Briefcase, UserCircle, Settings, LogOut, Palette, Type, DollarSign, ChevronLeft } from 'lucide-react';
import { Logo } from '@/components/icons/Logo';
import { UserNav } from './UserNav';
import { ModeToggle } from '@/components/ModeToggle';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLinks } from './NavLinks';
import { useRouter, usePathname } from 'next/navigation';


export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-2">
          {pathname !== '/' && (
            <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
         <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <Link href={pathname === '/' ? "/" : "/dashboard"} className="flex items-center">
            <Logo className="h-8 w-auto" />
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}

