import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Expand } from 'lucide-react';

export const ArticleInputs = ({
  headline,
  onHeadlineChange,
  prefilledSource,
  prefilledUrl,
  resolvedArticleUrl,
  articleContent,
  isFetchingArticle,
  useFullArticle,
  onUseFullArticleChange,
  articleUrlOverride,
  onArticleUrlOverrideChange,
  showUrlOverride,
}: {
  headline: string;
  onHeadlineChange: (value: string) => void;
  prefilledSource: string | null;
  prefilledUrl: string | null;
  resolvedArticleUrl: string;
  articleContent: string;
  isFetchingArticle: boolean;
  useFullArticle: 'yes' | 'no';
  onUseFullArticleChange: (value: 'yes' | 'no') => void;
  articleUrlOverride: string;
  onArticleUrlOverrideChange: (value: string) => void;
  showUrlOverride: boolean;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label htmlFor="headline">Headline</Label>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Expand className="mr-2" /> View Story
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{headline}</DialogTitle>
            <DialogDescription>
              Full article content
              {prefilledSource ? ` from ${prefilledSource}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="prose max-w-none dark:prose-invert max-h-[60vh] overflow-y-auto">
            {isFetchingArticle && (
              <p className="text-xs text-muted-foreground">Fetching full article…</p>
            )}
            <p>{articleContent}</p>
            {prefilledUrl && (
              <Button asChild variant="link" className="px-0 h-auto font-semibold">
                <a href={prefilledUrl} target="_blank" rel="noopener noreferrer">
                  Open original article
                </a>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
    <Input id="headline" value={headline} onChange={e => onHeadlineChange(e.target.value)} />
    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
      <Label>Use full article for context?</Label>
      <RadioGroup
        value={useFullArticle}
        onValueChange={value => onUseFullArticleChange(value as 'yes' | 'no')}
        className="flex items-center sm:ml-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id="r-yes" />
          <Label htmlFor="r-yes">Yes</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id="r-no" />
          <Label htmlFor="r-no">No</Label>
        </div>
      </RadioGroup>
      <div className="sm:ml-auto">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              View Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{headline}</DialogTitle>
              <DialogDescription>
                Full article content
                {prefilledSource ? ` from ${prefilledSource}` : ''}
              </DialogDescription>
            </DialogHeader>
            <div className="prose max-w-none dark:prose-invert max-h-[60vh] overflow-y-auto">
              <p>{articleContent}</p>
              {prefilledUrl && (
                <Button asChild variant="link" className="px-0 h-auto font-semibold">
                  <a
                    href={resolvedArticleUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open original article
                  </a>
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>

    {showUrlOverride && (
      <div className="space-y-2">
        <Label htmlFor="article-url">Original article URL</Label>
        <Input
          id="article-url"
          placeholder="Paste the original article link (not news.google.com)"
          value={articleUrlOverride}
          onChange={e => onArticleUrlOverrideChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Google News links cannot be scraped directly. Add the source link for full context.
        </p>
      </div>
    )}
  </div>
);
