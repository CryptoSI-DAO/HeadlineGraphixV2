import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from './ui/button';
import Link from 'next/link';

export function Header({ title, cta, children }: { title: string, cta?: {href: string, label: string}, children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      </div>
      <div className="ml-auto flex items-center gap-4">
        {children}
        {cta && <Button asChild><Link href={cta.href}>{cta.label}</Link></Button>}
      </div>
    </header>
  );
}
