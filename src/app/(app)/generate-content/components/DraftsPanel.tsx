import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { GenerateContentDraftsOutput } from '@/ai/flows/generate-content-drafts';
import { Clipboard, Loader2, Pencil, Sparkles } from 'lucide-react';

export const DraftsPanel = ({
  isGenerating,
  drafts,
  activeTab,
  onActiveTabChange,
  activeModelLabel,
  elapsedSeconds,
  estimatedSeconds,
  onCopy,
  onDraftChange,
}: {
  isGenerating: boolean;
  drafts: GenerateContentDraftsOutput | null;
  activeTab: string;
  onActiveTabChange: (value: string) => void;
  activeModelLabel: string;
  elapsedSeconds: number;
  estimatedSeconds: number | null;
  onCopy: () => void;
  onDraftChange: (value: string) => void;
}) => (
  <Card className="min-h-[500px]">
    <CardContent className="p-0">
      {isGenerating ? (
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Generating with {activeModelLabel}</p>
              <p className="text-xs text-muted-foreground">
                {elapsedSeconds > 0 ? `Elapsed ${elapsedSeconds}s` : 'Warming up the model...'}
                {estimatedSeconds ? ` · Estimated ${estimatedSeconds}s` : ''}
              </p>
            </div>
          </div>
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full w-1/3 bg-primary/70 animate-pulse" />
          </div>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-4" />
        </div>
      ) : drafts ? (
        <Tabs value={activeTab} onValueChange={onActiveTabChange} className="w-full">
          <div className="flex items-center justify-between px-4 pt-4 border-b">
            <TabsList>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              {activeTab === 'preview' && (
                <Button variant="outline" size="sm" onClick={() => onActiveTabChange('draft')}>
                  <Pencil /> Edit
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onCopy}>
                <Clipboard /> Copy
              </Button>
            </div>
          </div>
          <TabsContent value="draft" className="p-6">
            <Textarea
              className="min-h-[400px] text-base font-mono bg-muted/50"
              value={drafts.blogPost}
              onChange={e => onDraftChange(e.target.value)}
            />
          </TabsContent>
          <TabsContent value="preview" className="p-6">
            <div className="prose prose-sm max-w-none text-foreground dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{drafts.blogPost}</ReactMarkdown>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center text-muted-foreground p-12 h-full flex flex-col items-center justify-center">
          <Sparkles className="h-10 w-10 mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-1">Content will appear here</h3>
          <p className="max-w-xs mx-auto">
            Click the generate button to create your first draft.
          </p>
        </div>
      )}
    </CardContent>
  </Card>
);
