import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const QuickStartCard = () => (
  <Card className="bg-primary text-primary-foreground">
    <CardHeader>
      <CardTitle>Ready to Start?</CardTitle>
      <CardDescription className="text-primary-foreground/80">
        Jump right into the action and get the latest headlines to generate your next content pack.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Button asChild variant="secondary" size="lg" className="w-full md:w-auto">
        <Link href="/headlines">
          Fetch Latest Headlines <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </CardContent>
  </Card>
);
