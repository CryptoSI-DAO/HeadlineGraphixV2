import type { HeadlineGroup } from '@/lib/news';
import { HeadlineCard } from './HeadlineCard';

export const HeadlineGroupSection = ({ group }: { group: HeadlineGroup }) => (
  <section className="rounded-xl border border-muted/50 bg-card/40 p-4 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Featured Topics</p>
        <p className="text-base font-semibold">{group.label}</p>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{group.topics.join(', ')}</span>
    </div>
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {group.headlines.map(headline => (
        <HeadlineCard key={headline.id} headline={headline} />
      ))}
    </div>
  </section>
);
