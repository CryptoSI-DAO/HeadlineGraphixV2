import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const LoadingSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2 mt-2" />
    </CardHeader>
    <CardContent className="h-10" />
    <CardFooter className="flex flex-col gap-2 items-stretch">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </CardFooter>
  </Card>
);
