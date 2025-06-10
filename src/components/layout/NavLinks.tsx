
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Edit3,
  ImageIcon,
  FileText,
  Bot,
  Sparkles,
  MessageSquare,
  Settings,
  DollarSign,
  Info,
  HelpCircle,
  Phone,
  Mail,
  Film, // Added Film icon
} from 'lucide-react';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/photo-editor', label: 'Photo Editor', icon: Edit3 },
  {
    label: 'Content Generation',
    icon: Sparkles,
    subItems: [
      { href: '/content-generator/quotes', label: 'Quotes', icon: MessageSquare },
      { href: '/content-generator/stories', label: 'Stories', icon: FileText },
    ],
  },
  { href: '/picture-generator', label: 'Picture Generator', icon: ImageIcon },
  { href: '/animation-generator', label: 'Animation Generator', icon: Film }, // Added Animation Generator
  { href: '/file-analyzer', label: 'File Analyzer', icon: FileText },
  { href: '/assistant', label: 'PeteAI Assistant', icon: Bot },
  // { href: '/messaging', label: 'Messaging', icon: MessageSquare }, // Complex, placeholder for now
  { type: 'separator' },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/vip', label: 'VIP', icon: DollarSign },
  { type: 'separator' },
  { href: '/contact', label: 'Contact Us', icon: Phone },
  { href: '/faq', label: 'FAQ', icon: HelpCircle },
];


export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item, index) => {
        if (item.type === 'separator') {
          return <div key={`sep-${index}`} className="my-2 border-t border-sidebar-border mx-2" />;
        }
        if (item.subItems) {
          return (
            <div key={item.label} className="px-2">
              <div className="flex items-center gap-2 py-2 text-sm font-medium text-sidebar-foreground/70">
                <item.icon className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </div>
              <ul className="pl-4">
                {item.subItems.map((subItem) => (
                  <li key={subItem.href}>
                    <Link href={subItem.href} legacyBehavior passHref>
                      <SidebarMenuButton
                        asChild
                        variant="default"
                        size="sm"
                        className={cn(
                          "w-full justify-start group-data-[collapsible=icon]:justify-center",
                          pathname === subItem.href && "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}
                        tooltip={{ children: subItem.label }}
                      >
                        <a>
                          <subItem.icon className="mr-2 h-4 w-4" />
                          <span className="group-data-[collapsible=icon]:hidden">{subItem.label}</span>
                        </a>
                      </SidebarMenuButton>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        return (
          <Link href={item.href} key={item.href} legacyBehavior passHref>
            <SidebarMenuButton
              asChild
              variant="default"
              className={cn(
                "w-full justify-start group-data-[collapsible=icon]:justify-center",
                 pathname === item.href && "bg-sidebar-primary text-sidebar-primary-foreground"
              )}
              tooltip={{ children: item.label }}
            >
              <a>
                <item.icon className="mr-2 h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </a>
            </SidebarMenuButton>
          </Link>
        );
      })}
    </>
  );
}
