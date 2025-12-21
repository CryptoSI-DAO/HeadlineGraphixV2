import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ContentModelProvider } from '@/ai/flows/generate-content-drafts';

export const ModelSelector = ({
  modelProvider,
  options,
  onChange,
}: {
  modelProvider: ContentModelProvider;
  options: { value: ContentModelProvider; label: string; description: string }[];
  onChange: (value: ContentModelProvider) => void;
}) => (
  <div className="mb-6 rounded-lg border bg-muted/40 p-4">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-medium">AI Model</p>
        <p className="text-sm text-muted-foreground">
          Choose which provider powers your content drafts.
        </p>
      </div>
      <div className="flex gap-2">
        {options.map(option => {
          const isSelected = modelProvider === option.value;

          return (
            <Button
              key={option.value}
              type="button"
              variant={isSelected ? 'default' : 'ghost'}
              data-selected={isSelected}
              className={cn(
                'min-w-[140px] flex flex-1 flex-col items-start gap-1 border',
                isSelected
                  ? 'shadow-sm dark:bg-primary-foreground text-white'
                  : 'border-transparent'
              )}
              onClick={() => onChange(option.value)}
            >
              <span
                className={cn(
                  'text-sm font-semibold',
                  isSelected ? 'text-white' : 'text-foreground'
                )}
              >
                {option.label}
              </span>
              <span
                className={cn(
                  'text-xs',
                  isSelected ? 'text-white' : 'text-muted-foreground'
                )}
              >
                {option.description}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  </div>
);
