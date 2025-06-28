
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
  DollarSign,
  Info,
  HelpCircle,
  Phone,
  Mail,
  Film,
  Video,
  Newspaper,
  Presentation,
  Share2 as ShareIcon,
  Users,
  Brain,
  Lightbulb,
  Gamepad2,
  MessagesSquare,
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
      { href: '/content-generator/video-scripts', label: 'Video Scripts', icon: Video },
      { href: '/content-generator/blog-posts', label: 'Blog Posts', icon: Newspaper },
      { href: '/content-generator/presentations', label: 'Presentations', icon: Presentation },
      { href: '/content-generator/social-media-plans', label: 'Social Media Plans', icon: ShareIcon },
    ],
  },
  { href: '/picture-generator', label: 'Picture Generator', icon: ImageIcon },
  { href: '/animation-generator', label: 'Anime Story Generator', icon: Film },
  { href: '/file-analyzer', label: 'File Analyzer', icon: FileText },
  { href: '/assistant', label: 'PeteAI Assistant', icon: Bot },
  {
    label: 'Specialized AI',
    icon: Brain,
    subItems: [
      { href: '/specialized-ai/character-persona', label: 'Character Persona', icon: Users },
      { href: '/specialized-ai/what-if-scenario', label: '"What If" Scenarios', icon: Lightbulb },
    ],
  },
  { href: '/game', label: 'Game Center', icon: Gamepad2 },
  { type: 'separator' },
  { href: '/vip', label: 'VIP Membership', icon: DollarSign },
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
          const isGroupActive = item.subItems.some(subItem => pathname.startsWith(subItem.href));
          return (
            <div key={item.label} className="px-2">
              <div className={cn(
                  "flex items-center gap-2 py-2 text-sm font-medium text-sidebar-foreground/70 group-data-[collapsible=icon]:justify-center",
                  isGroupActive && "text-sidebar-primary"
                )}>
                <item.icon className={cn("h-4 w-4", isGroupActive && "text-sidebar-primary")} />
                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </div>
              <ul className="pl-4 group-data-[collapsible=icon]:pl-0">
                {item.subItems.map((subItem) => (
                  <li key={subItem.href}>
                    <Link href={subItem.href}>
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
                        <span>
                          <subItem.icon className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
                          <span className="group-data-[collapsible=icon]:hidden">{subItem.label}</span>
                        </span>
                      </SidebarMenuButton>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        if (!item.href) return null;
        return (
          <Link href={item.href} key={item.href}>
            <SidebarMenuButton
              asChild
              variant="default"
              className={cn(
                "w-full justify-start group-data-[collapsible=icon]:justify-center",
                 pathname === item.href && "bg-sidebar-primary text-sidebar-primary-foreground"
              )}
              tooltip={{ children: item.label }}
            >
              <span>
                <item.icon className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </span>
            </SidebarMenuButton>
          </Link>
        );
      })}
    </>
  );
}
