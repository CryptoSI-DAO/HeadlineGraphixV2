import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserPreferences } from '@/lib/types';
import { BacklinkSuggestionsDialog } from './BacklinkSuggestionsDialog';
import { normalizeList } from '../utils';

export const ContentPreferencesCard = ({
  localPreferences,
  isLoading,
  isSaving,
  error,
  onSave,
  onTopicChange,
  onBacklinkChange,
}: {
  localPreferences: UserPreferences;
  isLoading: boolean;
  isSaving: boolean;
  error?: string | null;
  onSave: () => void;
  onTopicChange: (index: number, value: string) => void;
  onBacklinkChange: (index: number, value: string) => void;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Content Preferences</CardTitle>
      <CardDescription>Set your focus topics and desired backlinks for AI generation.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Label className="font-semibold">Focus Topics</Label>
          {normalizeList(localPreferences.focusTopics).map((topic, index) => (
            <Input
              key={index}
              value={topic}
              disabled={isLoading || isSaving}
              onChange={event => onTopicChange(index, event.target.value)}
              placeholder={`Topic #${index + 1}`}
            />
          ))}
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label className="font-semibold">Backlink URLs</Label>
            <BacklinkSuggestionsDialog />
          </div>
          {normalizeList(localPreferences.backlinkUrls).map((url, index) => (
            <Input
              key={index}
              value={url}
              disabled={isLoading || isSaving}
              onChange={event => onBacklinkChange(index, event.target.value)}
              placeholder={`URL #${index + 1}`}
            />
          ))}
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <Button onClick={onSave} disabled={isLoading || isSaving}>
        {isSaving ? 'Saving...' : 'Save Preferences'}
      </Button>
    </CardFooter>
  </Card>
);
