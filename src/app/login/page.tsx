'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getBrowserClient } from '@/lib/supabase-browser';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { isSignedIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isSignedIn) {
      router.replace('/');
    }
  }, [isLoading, isSignedIn, router]);

  const handleLogin = useCallback(async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const supabase = getBrowserClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    router.replace('/');
  }, [email, password, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <Image
            src="/hglogolite%20trans.png"
            alt="HeadlineGraphix logo"
            width={128}
            height={128}
            className="mx-auto mb-4 h-16 w-16"
            priority
          />
          <CardTitle className="text-2xl font-bold">HeadlineGraphix V2</CardTitle>
          <CardDescription>Sign in to access your content studio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
              />
            </div>
            {errorMessage && (
              <p className="text-sm text-destructive" role="alert">
                {errorMessage}
              </p>
            )}
            <Button
              onClick={handleLogin}
              className="w-full"
              size="lg"
              disabled={isSubmitting || !email || !password}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
