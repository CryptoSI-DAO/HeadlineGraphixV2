import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export const ImageSizePicker = ({
  imageSize,
  onChange,
  options,
}: {
  imageSize: string;
  onChange: (value: string) => void;
  options: {
    id: string;
    icon: LucideIcon;
    label: string;
    dims: string;
    desc: string;
  }[];
}) => (
  <div className="space-y-3">
    <Label>Image Size</Label>
    <RadioGroup value={imageSize} onValueChange={onChange} className="grid grid-cols-3 gap-4">
      {options.map(size => (
        <Label
          key={size.id}
          htmlFor={`size-${size.id}`}
          className={cn(
            'rounded-lg border-2 p-3 flex flex-col items-center justify-center cursor-pointer transition-colors',
            imageSize === size.id
              ? 'border-primary ring-2 ring-primary'
              : 'border-muted hover:border-primary/50'
          )}
        >
          <RadioGroupItem value={size.id} id={`size-${size.id}`} className="sr-only" />
          <size.icon className="w-8 h-8 mb-2" />
          <span className="font-semibold">{size.label}</span>
          <span className="text-xs text-muted-foreground">{size.dims}</span>
          <span className="text-xs text-center text-muted-foreground/80 mt-1">{size.desc}</span>
        </Label>
      ))}
    </RadioGroup>
  </div>
);
