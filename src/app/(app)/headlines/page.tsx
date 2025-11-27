'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/Header';
import type { Headline } from '@/lib/types';
import { MOCK_HEADLINES } from '@/lib/mock-data';
import { ArrowRight, Calendar, Globe } from 'lucide-react';

const HeadlineCard = ({ headline }: { headline: Headline }) => (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{headline.title}</CardTitle>
        <CardDescription className="flex items-center gap-4 pt-2">
            <span className="flex items-center gap-1.5"><Globe size={14}/> {headline.source}</span>
            <span className="flex items-center gap-1.5"><Calendar size={14}/> {headline.date}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow" />
      <CardFooter>
        <Button asChild className="w-full">
            <Link href={`/studio/${headline.slug}`}>
                Generate Content Pack <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </CardFooter>
    </Card>
);

const LoadingSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent className="h-10" />
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
);

export default function HeadlinesPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Simulate 2-second loading time
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Header title="Latest Headlines" />
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <>
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
            </>
          ) : (
            MOCK_HEADLINES.map(headline => (
              <HeadlineCard key={headline.id} headline={headline} />
            ))
          )}
        </div>
      </main>
    </>
  );
}
