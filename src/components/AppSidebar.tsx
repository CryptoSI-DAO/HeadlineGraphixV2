'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Home, Newspaper, ImageIcon, History, Settings } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/headlines', label: 'Headlines', icon: Newspaper },
  { href: '/reference-images', label: 'Reference Images', icon: ImageIcon },
  { href: '/history', label: 'History', icon: History },
];

const settingsItem = { href: '/settings', label: 'Settings', icon: Settings };

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2" data-collapsible-hide>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bot size={20} />
            </div>
            <span className="font-semibold text-lg">HeadlineGraphix</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-0">
        <SidebarMenu className="p-2">
            {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                    tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === settingsItem.href}
                    tooltip={{ children: settingsItem.label }}
                >
                  <Link href={settingsItem.href}>
                    <settingsItem.icon />
                    <span>{settingsItem.label}</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
        <Separator className="my-2" />
        <div className="p-2 flex items-center gap-3" data-collapsible-hide>
            <Avatar className="h-9 w-9">
                <AvatarImage src="https://picsum.photos/seed/avatar/40/40" alt="User Avatar" />
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-sm">
                <span className="font-semibold">Jane Doe</span>
                <span className="text-muted-foreground text-xs">jane.doe@example.com</span>
            </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
