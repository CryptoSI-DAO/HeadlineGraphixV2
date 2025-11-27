'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-8 ring-primary/5">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">HeadlineGraphix V2</CardTitle>
          <CardDescription>Sign in to access your content studio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={handleLogin} className="w-full" size="lg">
              Sign in with Clerk
            </Button>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            This is a mock authentication.
            <br />
            Clicking the button will redirect you to the dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
