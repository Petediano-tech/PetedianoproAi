
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, LogOut, Settings, User } from 'lucide-react';
import { Logo } from '@/components/icons/Logo';
import { ModeToggle } from '@/components/ModeToggle';
import {
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useRouter, usePathname } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();


  const handleLogout = () => {
    if (sessionStorage.getItem('isAdmin') === 'true') {
        sessionStorage.removeItem('isAdmin');
        router.push('/');
    } else if (auth) {
        signOut(auth).then(() => {
            router.push('/');
        });
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const displayName = user?.displayName || (sessionStorage.getItem('isAdmin') === 'true' ? 'Admin' : 'User');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-2">
          {pathname !== '/dashboard' && (
            <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
         <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <Link href="/dashboard" className="hidden md:flex items-center">
            <Logo className="h-8 w-auto" />
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <ModeToggle />
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                       <AvatarImage src={user?.photoURL || undefined} alt={displayName} data-ai-hint="user avatar"/>
                       <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                    </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{displayName}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator/>
                  <DropdownMenuItem asChild>
                    <Link href="/settings"><Settings className="mr-2 h-4 w-4"/> Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4"/>
                    <span>Logout</span>
                  </DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
