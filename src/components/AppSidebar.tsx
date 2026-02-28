
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Newspaper, ImageIcon, Library, Sparkles, LayoutTemplate, Archive } from 'lucide-react';
import Image from 'next/image';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile } from '@/hooks/use-profile';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/headlines', label: 'Headlines', icon: Newspaper },
  { href: '/generate-content', label: 'Generate Content', icon: Sparkles },
  { href: '/generate-image', label: 'Generate Image', icon: ImageIcon },
  { href: '/image-archive', label: 'Image Archive', icon: Archive },
  { href: '/content-library', label: 'Content Library', icon: Library },
  { href: '/brand-kits', label: 'Brand Kits', icon: LayoutTemplate },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { displayProfile, isLoading: isProfileLoading } = useProfile();
  const avatarFallback = useMemo(() => {
    const source = displayProfile.name || displayProfile.email;
    return source ? source.trim().charAt(0).toUpperCase() : 'U';
  }, [displayProfile.email, displayProfile.name]);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2" data-collapsible-hide>
            <Image
              src="/hgicononly.png"
              alt="HeadlineGraphix icon"
              width={32}
              height={32}
              className="h-8 w-8"
              priority
            />
            <span className="text-lg font-semibold">HeadlineGraphix</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col p-0">
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
        <div className="mt-auto">
          <Separator className="mx-2 my-2" data-collapsible-hide />
          <Link
            href="/"
            className="mx-2 flex items-center gap-3 rounded-md px-4 pb-4 pt-2 text-left transition hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-collapsible-hide
          >
            {isProfileLoading ? (
              <>
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex flex-1 flex-col gap-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </>
            ) : (
              <>
                <Avatar className="h-9 w-9">
                  {displayProfile.avatarUrl ? (
                    <AvatarImage src={displayProfile.avatarUrl} alt={`${displayProfile.name} avatar`} />
                  ) : null}
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col text-sm">
                  <span className="truncate font-semibold">{displayProfile.name}</span>
                  <span className="truncate text-muted-foreground text-xs">{displayProfile.email}</span>
                </div>
              </>
            )}
          </Link>
          <div className="px-4 pb-4 text-xs text-muted-foreground" data-collapsible-hide>
            Version 2.0.0
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
