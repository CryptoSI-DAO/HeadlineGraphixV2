import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Sparkles } from 'lucide-react';
import { ArticleInputs } from './ArticleInputs';
import { ReferenceImagesPicker } from './ReferenceImagesPicker';
import { brandTones } from '../constants';

export const GenerateContentInputs = ({
  headline,
  setHeadline,
  prefilledSource,
  prefilledUrl,
  resolvedArticleUrl,
  articleContent,
  isFetchingArticle,
  useFullArticle,
  setUseFullArticle,
  articleUrlOverride,
  setArticleUrlOverride,
  showUrlOverride,
  brandTone,
  setBrandTone,
  referenceImages,
  selectedImages,
  toggleReferenceImage,
  isLoadingArchiveImages,
  fetchArchiveImages,
  includeBacklinks,
  setIncludeBacklinks,
  userAngle,
  setUserAngle,
  handleGenerate,
  isGenerating,
  elapsedSeconds,
}: {
  headline: string;
  setHeadline: (value: string) => void;
  prefilledSource: string | null;
  prefilledUrl: string | null;
  resolvedArticleUrl: string;
  articleContent: string;
  isFetchingArticle: boolean;
  useFullArticle: 'yes' | 'no';
  setUseFullArticle: (value: 'yes' | 'no') => void;
  articleUrlOverride: string;
  setArticleUrlOverride: (value: string) => void;
  showUrlOverride: boolean;
  brandTone: string;
  setBrandTone: (value: string) => void;
  referenceImages: { id: string; imageUrl: string; description: string; imageHint: string }[];
  selectedImages: string[];
  toggleReferenceImage: (url: string) => void;
  isLoadingArchiveImages: boolean;
  fetchArchiveImages: () => void;
  includeBacklinks: boolean;
  setIncludeBacklinks: (value: boolean) => void;
  userAngle: string;
  setUserAngle: (value: string) => void;
  handleGenerate: () => void;
  isGenerating: boolean;
  elapsedSeconds: number;
}) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold">1. Set Your Inputs</h2>

    <ArticleInputs
      headline={headline}
      onHeadlineChange={setHeadline}
      prefilledSource={prefilledSource}
      prefilledUrl={prefilledUrl}
      resolvedArticleUrl={resolvedArticleUrl}
      articleContent={articleContent}
      isFetchingArticle={isFetchingArticle}
      useFullArticle={useFullArticle}
      onUseFullArticleChange={setUseFullArticle}
      articleUrlOverride={articleUrlOverride}
      onArticleUrlOverrideChange={setArticleUrlOverride}
      showUrlOverride={showUrlOverride}
    />

    <div className="space-y-4">
      <Label htmlFor="brand-preset">Brand Preset</Label>
      <Select value={brandTone} onValueChange={setBrandTone}>
        <SelectTrigger id="brand-preset">
          <SelectValue placeholder="Select a preset" />
        </SelectTrigger>
        <SelectContent>
          {brandTones.map(tone => (
            <SelectItem key={tone} value={tone}>
              {tone}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <ReferenceImagesPicker
      referenceImages={referenceImages}
      selectedImages={selectedImages}
      onToggle={toggleReferenceImage}
      isLoadingArchiveImages={isLoadingArchiveImages}
      onFetchArchiveImages={fetchArchiveImages}
    />

    <div className="flex items-center justify-between rounded-lg border p-4">
      <div>
        <Label htmlFor="include-backlinks" className="font-semibold">
          Include Backlinks
        </Label>
        <p className="text-sm text-muted-foreground">
          Automatically insert relevant links to your site.
        </p>
      </div>
      <Switch id="include-backlinks" checked={includeBacklinks} onCheckedChange={setIncludeBacklinks} />
    </div>

    <div className="space-y-2">
      <Label htmlFor="user-angle">Add Your Personal Angle</Label>
      <Textarea
        id="user-angle"
        placeholder="e.g., Focus on the impact of AI on small business marketing strategies..."
        value={userAngle}
        onChange={event => setUserAngle(event.target.value)}
        className="min-h-[100px]"
      />
      <p className="text-xs text-muted-foreground">
        This helps guide the tone and style of the generated content.
      </p>
    </div>

    <Button size="lg" className="w-full" onClick={handleGenerate} disabled={isGenerating}>
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Generating{elapsedSeconds > 0 ? ` · ${elapsedSeconds}s` : '...'}
        </>
      ) : (
        'Generate Content'
      )}
      <Sparkles className="ml-2 h-5 w-5" />
    </Button>
  </div>
);
