'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getBrowserClient } from '@/lib/supabase-browser';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  isSignedIn: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const supabase = getBrowserClient();
    
    console.log('AuthContext - Initializing auth check');
    console.log('AuthContext - Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    supabase.auth
      .getSession()
      .then(({ data }) => {
        console.log('AuthContext - Session data:', data);
        if (!isMounted) {
          return;
        }
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Unable to load Supabase session', error);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setIsLoading(false);
        }
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      console.log('AuthContext - Auth state changed:', _event);
      console.log('AuthContext - New session:', nextSession);
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    console.log('AuthContext - Signing out');
    const supabase = getBrowserClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase sign-out failed', error);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      isSignedIn: Boolean(user),
      isLoading,
      signOut,
    }),
    [user, session, isLoading, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
