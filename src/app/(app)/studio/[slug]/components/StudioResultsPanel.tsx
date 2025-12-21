import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { GenerateContentDraftsOutput } from '@/ai/flows/generate-content-drafts';

export const StudioResultsPanel = ({
  isGenerating,
  drafts,
  onDraftChange,
}: {
  isGenerating: boolean;
  drafts: GenerateContentDraftsOutput | null;
  onDraftChange: (value: Partial<GenerateContentDraftsOutput>) => void;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Generated Drafts</CardTitle>
      <CardDescription>Review and edit the generated content below.</CardDescription>
    </CardHeader>
    <CardContent>
      {isGenerating ? (
        <div className="space-y-4 p-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : drafts ? (
        <Tabs defaultValue="blog">
          <TabsList>
            <TabsTrigger value="blog">Blog Post</TabsTrigger>
            <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
            <TabsTrigger value="infographic">Infographic</TabsTrigger>
          </TabsList>
          <TabsContent value="blog" className="mt-4">
            <Textarea
              className="min-h-[400px] text-base"
              value={drafts.blogPost}
              onChange={event => onDraftChange({ blogPost: event.target.value })}
            />
          </TabsContent>
          <TabsContent value="linkedin" className="mt-4">
            <Textarea
              className="min-h-[200px] text-base"
              value={drafts.linkedInPost}
              onChange={event => onDraftChange({ linkedInPost: event.target.value })}
            />
          </TabsContent>
          <TabsContent value="infographic" className="mt-4">
            <div className="relative aspect-[2/3] w-full max-w-md mx-auto rounded-lg overflow-hidden border">
              <Image
                src={drafts.infographic}
                alt="Generated Infographic"
                fill
                className="object-cover"
                data-ai-hint="infographic design"
              />
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center text-muted-foreground p-12">
          <p>Click &ldquo;Generate Drafts&rdquo; to create content.</p>
        </div>
      )}
    </CardContent>
  </Card>
);
