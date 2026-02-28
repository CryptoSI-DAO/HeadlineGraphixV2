import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export const TopicSummaryCard = ({ summary }: { summary: string }) => (
  <Card>
    <CardHeader className="pb-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Focus topics</p>
      <CardTitle className="text-base font-semibold">{summary}</CardTitle>
    </CardHeader>
  </Card>
);
