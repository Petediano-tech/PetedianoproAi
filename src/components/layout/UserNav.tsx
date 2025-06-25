"use client";

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, User, LogOut, DollarSign } from 'lucide-react';

// Dummy user data - replace with actual auth state
const user = {
  name: 'Your Name',
  email: 'your.email@example.com',
  imageUrl: '', 
};

const getInitials = (name: string) => {
  if (!name) return 'U';
  const names = name.split(' ');
  if (names.length === 1) return names[0][0].toUpperCase();
  return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
};


export function UserNav() {
  // In a real app, replace this with actual authentication logic
  const isAuthenticated = true; // Set to true to always show the user menu

  if (!isAuthenticated) {
    return (
      <Link href="/login">
        <Button variant="ghost">Login</Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="group">
          <Settings className="h-5 w-5 text-primary transition-transform duration-300 group-data-[state=open]:rotate-90" />
          <span className="sr-only">Open user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/settings" passHref>
            <DropdownMenuItem className="group">
              <Settings className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/profile" passHref>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/vip" passHref>
            <DropdownMenuItem>
              <DollarSign className="mr-2 h-4 w-4" />
              <span>VIP Membership</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => { /* Handle logout */ console.log('Logout clicked'); }}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
