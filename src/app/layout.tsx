import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { DemoAuthProvider } from '@/context/DemoAuthContext';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HeadlineGraphix V2',
  description: 'Generate content packs from headlines.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} font-body antialiased`}>
        <DemoAuthProvider>
          <AppProvider>
            {children}
            <Toaster />
          </AppProvider>
        </DemoAuthProvider>
      </body>
    </html>
  );
}
