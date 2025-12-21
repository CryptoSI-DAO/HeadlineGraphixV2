import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { NewsProviderId } from '@/lib/news/providers';
import type { NewsProviderMeta } from '@/lib/news/providers';
import { NEWS_PROVIDER_OPTIONS } from '@/lib/news/providers';

export const ProviderCard = ({
  provider,
  onChange,
  meta,
}: {
  provider: NewsProviderId;
  onChange: (value: NewsProviderId) => void;
  meta?: NewsProviderMeta;
}) => (
  <Card>
    <CardHeader className="pb-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">News feed provider</p>
    </CardHeader>
    <CardContent className="space-y-2 pt-0">
      <Select value={provider} onValueChange={value => onChange(value as NewsProviderId)}>
        <SelectTrigger>
          <SelectValue placeholder="Select a provider" />
        </SelectTrigger>
        <SelectContent>
          {NEWS_PROVIDER_OPTIONS.map(option => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {meta && <p className="text-xs text-muted-foreground">{meta.description}</p>}
    </CardContent>
  </Card>
);
