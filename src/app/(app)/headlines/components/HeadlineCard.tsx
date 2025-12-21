import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Headline } from '@/lib/types';
import { Calendar, Globe, ImageIcon, Sparkles } from 'lucide-react';
import { formatHeadlineDate } from '../utils';

export const HeadlineCard = ({ headline }: { headline: Headline }) => (
  <Card className="flex flex-col">
    <CardHeader>
      <CardTitle>{headline.title}</CardTitle>
      <CardDescription className="flex items-center gap-4 pt-2">
        <span className="flex items-center gap-1.5">
          <Globe size={14} /> {headline.source}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar size={14} /> {formatHeadlineDate(headline.date)}
        </span>
      </CardDescription>
    </CardHeader>
    <CardContent className="flex-grow">
      {headline.content ? (
        <p className="text-sm text-muted-foreground line-clamp-4">{headline.content}</p>
      ) : (
        <p className="text-sm text-muted-foreground italic">No summary available.</p>
      )}
    </CardContent>
    <CardFooter className="flex flex-col gap-2 items-stretch">
      <Button asChild variant="outline">
        <a href={headline.url} target="_blank" rel="noopener noreferrer">
          View Article
        </a>
      </Button>
      <Button asChild>
        <Link
          href={{
            pathname: '/generate-content',
            query: {
              headline: headline.title,
              summary: headline.content ?? '',
              source: headline.source,
              url: headline.url,
            },
          }}
        >
          <Sparkles /> Generate Content
        </Link>
      </Button>
      <Button asChild variant="secondary">
        <Link href="/generate-image">
          <ImageIcon /> Generate Image
        </Link>
      </Button>
    </CardFooter>
  </Card>
);
