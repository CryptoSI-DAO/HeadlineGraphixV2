'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from './ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, type ReactNode } from 'react';
import { useDemoAuth } from '@/context/DemoAuthContext';

function HeaderAuthButtons() {
  const router = useRouter();
  const { signIn, signOut } = useDemoAuth();

  const handleSignIn = useCallback(() => {
    signIn();
    router.push('/');
  }, [router, signIn]);

  const handleSignOut = useCallback(() => {
    signOut();
    router.push('/login');
  }, [router, signOut]);

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleSignOut}>
        Sign out
      </Button>
      <Button size="sm" onClick={handleSignIn}>
        Sign in Demo
      </Button>
    </div>
  );
}

export function Header({ title, cta, children }: { title: string; cta?: { href: string; label: string }; children?: ReactNode }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      </div>
      <div className="ml-auto flex items-center gap-4">
        {children}
        {cta && <Button asChild><Link href={cta.href}>{cta.label}</Link></Button>}
        <HeaderAuthButtons />
      </div>
    </header>
  );
}
