import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ProfileFieldCardProps = {
  title: string;
  label: string;
  value: string;
  placeholder?: string;
  inputType?: string;
  isSaving: boolean;
  isDisabled: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
};

export const ProfileFieldCard = ({
  title,
  label,
  value,
  placeholder,
  inputType = 'text',
  isSaving,
  isDisabled,
  onChange,
  onSave,
}: ProfileFieldCardProps) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type={inputType}
        value={value}
        disabled={isDisabled || isSaving}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </CardContent>
    <CardFooter>
      <Button className="w-full" onClick={onSave} disabled={isDisabled || isSaving}>
        {isSaving ? 'Saving...' : 'Save'}
      </Button>
    </CardFooter>
  </Card>
);
