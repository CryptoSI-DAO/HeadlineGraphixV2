
'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import type { ContentModelProvider, GenerateContentDraftsOutput } from '@/ai/flows/generate-content-drafts';
import { generateContentDrafts } from '@/ai/flows/generate-content-drafts';
import {
  Sparkles,
  CheckCircle,
  Clipboard,
  Pencil,
  PlusSquare,
  Expand,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const brandTones = ['Momentum Inc.'];
const modelOptions: { value: ContentModelProvider; label: string; description: string }[] = [
  {
    value: 'gemini',
    label: 'MiMo V2 Flash (Free)',
    description: 'OpenRouter MiMo V2 Flash · $0',
  },
  {
    value: 'glm',
    label: 'GLM 4.5 Air (Free)',
    description: 'OpenRouter GLM 4.5 Air · $0',
  },
];
const DEFAULT_ARTICLE_CONTENT =
  "In an era where digital presence is paramount, small and medium-sized businesses (SMBs) are increasingly turning to Artificial Intelligence (AI) to gain a competitive edge. AI-powered marketing tools, once the exclusive domain of large corporations with deep pockets, are now more accessible than ever. These tools offer sophisticated capabilities—from hyper-personalized customer communication and predictive analytics to automated content creation and dynamic ad optimization. By leveraging AI, SMBs can not only streamline their marketing operations but also uncover deep insights into customer behavior, allowing them to craft more effective and targeted campaigns. This technological shift is leveling the playing field, enabling smaller players to compete more effectively and achieve significant growth in a crowded marketplace.";


export default function GenerateContentPage() {
  const { addHistoryItem, preferences } = useAppContext();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const prefilledHeadline = searchParams.get('headline');
  const prefilledSummary = searchParams.get('summary');
  const prefilledSource = searchParams.get('source');
  const prefilledUrl = searchParams.get('url');

  const [isGenerating, setIsGenerating] = useState(false);
  const [drafts, setDrafts] = useState<GenerateContentDraftsOutput | null>(null);

  const [headline, setHeadline] = useState(prefilledHeadline ?? 'AI-Powered Content Generation');
  const [useFullArticle, setUseFullArticle] = useState<'yes' | 'no'>('no');
  const [brandTone, setBrandTone] = useState(brandTones[0]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [articleContent, setArticleContent] = useState(prefilledSummary ?? DEFAULT_ARTICLE_CONTENT);
  const [baseArticleContent, setBaseArticleContent] = useState(prefilledSummary ?? DEFAULT_ARTICLE_CONTENT);
  const [isFetchingArticle, setIsFetchingArticle] = useState(false);
  const [articleUrlOverride, setArticleUrlOverride] = useState('');
  const [referenceImages, setReferenceImages] = useState(PlaceHolderImages.slice(0, 3));
  const [isLoadingArchiveImages, setIsLoadingArchiveImages] = useState(false);
  const [userAngle, setUserAngle] = useState(prefilledSummary ?? '');
  const [includeBacklinks, setIncludeBacklinks] = useState(true);
  const [modelProvider, setModelProvider] = useState<ContentModelProvider>('gemini');
  const [generationStartedAt, setGenerationStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [estimatedSeconds, setEstimatedSeconds] = useState<number | null>(null);
  
  const [activeTab, setActiveTab] = useState('draft');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  useEffect(() => {
    if (prefilledHeadline) {
      setHeadline(prefilledHeadline);
    }
  }, [prefilledHeadline]);

  useEffect(() => {
    if (prefilledSummary && prefilledSummary.trim().length > 0) {
      setArticleContent(prefilledSummary);
      setBaseArticleContent(prefilledSummary);
      setUserAngle(prefilledSummary);
    } else {
      setArticleContent(DEFAULT_ARTICLE_CONTENT);
      setBaseArticleContent(DEFAULT_ARTICLE_CONTENT);
      setUserAngle('');
    }
  }, [prefilledSummary]);


  const isGoogleNewsUrl = (url?: string | null) => {
    if (!url) return false;
    try {
      const hostname = new URL(url).hostname;
      return hostname === 'news.google.com' || hostname.endsWith('.news.google.com');
    } catch {
      return false;
    }
  };

  const resolvedArticleUrl = articleUrlOverride.trim() || prefilledUrl || '';

  useEffect(() => {
    let cancelled = false;

    if (useFullArticle === 'yes' && resolvedArticleUrl) {
      if (!articleUrlOverride.trim() && isGoogleNewsUrl(resolvedArticleUrl)) {
        console.warn('Full article fetch skipped: Google News URL needs an original article link.');
        setIsFetchingArticle(false);
        return () => {
          cancelled = true;
        };
      }
      setIsFetchingArticle(true);
      fetch(`/api/fetch-article?url=${encodeURIComponent(resolvedArticleUrl)}`)
        .then(async response => {
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Request failed (${response.status}).`);
          }
          return response.json();
        })
        .then(data => {
          const fullContent = typeof data?.content === 'string' ? data.content : '';
          if (process.env.NODE_ENV !== 'production') {
            console.info('fetch-article result', {
              resolvedUrl: data?.resolvedUrl,
              contentLength: fullContent.length,
            });
          }
          if (!cancelled && fullContent.trim().length >= 600) {
            setArticleContent(fullContent);
          }
        })
        .catch(error => {
          if (!cancelled) {
            console.error('Failed to fetch full article content:', error);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsFetchingArticle(false);
          }
        });
      return () => {
        cancelled = true;
      };
    }

    if (useFullArticle === 'no') {
      setArticleContent(baseArticleContent);
    }

    return () => {
      cancelled = true;
    };
  }, [useFullArticle, prefilledUrl, baseArticleContent]);

  const activeModelLabel = modelOptions.find(option => option.value === modelProvider)?.label ?? 'Model';

  const estimateForInput = (provider: ContentModelProvider) => {
    const base = provider === 'glm' ? 18 : 14;
    const perChar = provider === 'glm' ? 0.004 : 0.003;
    const articleChars = useFullArticle === 'yes' ? articleContent.length : 0;
    const inputChars = headline.length + userAngle.length + articleChars;
    const imagePenalty = 8;
    const estimate = Math.round(base + inputChars * perChar + imagePenalty);
    return Math.max(8, Math.min(estimate, 120));
  };

  const inputEstimateSeconds = useMemo(
    () => estimateForInput(modelProvider),
    [modelProvider, articleContent, useFullArticle, headline, userAngle]
  );

  useEffect(() => {
    if (!isGenerating || generationStartedAt === null) {
      setElapsedSeconds(0);
      setEstimatedSeconds(null);
      return;
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - generationStartedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isGenerating, generationStartedAt]);

  useEffect(() => {
    if (!isGenerating) return;
    setEstimatedSeconds(inputEstimateSeconds);
  }, [isGenerating, inputEstimateSeconds]);

  const getBase64FromUrl = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    setDrafts(null);
    setGenerationStartedAt(Date.now());
    
    try {
      const imageAsDataUrls = selectedImages.length > 0
        ? await Promise.all(selectedImages.map(getBase64FromUrl))
        : [];

      setEstimatedSeconds(inputEstimateSeconds);
      const generatedDrafts = await generateContentDrafts({
        headline,
        articleContent: useFullArticle === 'yes' && articleContent.trim().length > 0 ? articleContent : undefined,
        articleUrl: useFullArticle === 'yes' ? (resolvedArticleUrl || undefined) : undefined,
        includeBacklinks,
        backlinkUrls: preferences.backlinkUrls,
        brandTone,
        referenceImages: imageAsDataUrls.length > 0 ? imageAsDataUrls : undefined,
        userAngle,
        modelProvider,
      });

      setDrafts(generatedDrafts);
      toast({
        title: 'Drafts Generated',
        description: 'Your new content drafts are ready for review.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate content. Please try again.',
      });
    } finally {
      setIsGenerating(false);
      setGenerationStartedAt(null);
    }
  };

  const handleSave = (slot: number) => {
    if (!drafts) return;
    addHistoryItem({
      headline,
      config: { brandTone, referenceImage: selectedImages[0] ?? '', userAngle },
      drafts,
    });
    toast({
      title: 'Saved to Content Library',
      description: `Your content pack has been successfully saved to slot #${slot}.`,
      action: <CheckCircle />,
    });
    setIsSaveModalOpen(false);
  };

  const handleCopy = () => {
    if (!drafts) return;
    navigator.clipboard.writeText(drafts.blogPost);
    toast({
        title: 'Copied to Clipboard',
        description: 'The blog post content has been copied.',
    });
  }

  const toggleReferenceImage = (imageUrl: string) => {
    setSelectedImages((prev) =>
      prev.includes(imageUrl)
        ? prev.filter((url) => url !== imageUrl)
        : [...prev, imageUrl]
    );
  };

  const handleFetchArchiveImages = async () => {
    setIsLoadingArchiveImages(true);
    try {
      const response = await fetch('/api/reference-images');
      if (!response.ok) {
        throw new Error('Unable to load reference images.');
      }
      const payload = await response.json();
      const images = Array.isArray(payload?.images) ? payload.images : [];
      if (images.length > 0) {
        const mapped = images.map((image: any) => ({
          id: image.id,
          imageUrl: image.imageUrl,
          description: image.description ?? 'Reference image',
          imageHint: image.aiHint ?? '',
        }));
        setReferenceImages(mapped);
      }
    } catch (error) {
      console.error('Failed to load reference images', error);
      toast({
        variant: 'destructive',
        title: 'Image Archive Unavailable',
        description: 'Unable to load your archived images. Please try again.',
      });
    } finally {
      setIsLoadingArchiveImages(false);
    }
  };

  return (
    <>
      <Header title="Content Generation Studio" />
      <main className="flex-1 p-4 md:p-6">
        <div className="mb-6 rounded-lg border bg-muted/40 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium">AI Model</p>
              <p className="text-sm text-muted-foreground">Choose which provider powers your content drafts.</p>
            </div>
            <div className="flex gap-2">
              {modelOptions.map(option => (
                <Button
                  key={option.value}
                  type="button"
                  variant={modelProvider === option.value ? 'default' : 'ghost'}
                  className={cn(
                    'min-w-[140px] flex flex-1 flex-col items-start gap-1 border',
                    modelProvider === option.value ? 'shadow-sm' : 'border-transparent'
                  )}
                  onClick={() => setModelProvider(option.value)}
                >
                  <span className="text-sm font-semibold">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          Configure your inputs on the left and review the generated drafts on the right.
        </p>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Panel: Configuration */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">1. Set Your Inputs</h2>
            
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="headline">Headline</Label>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm"><Expand className="mr-2" /> View Story</Button>
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
                                  <Button
                                    asChild
                                    variant="link"
                                    className="px-0 h-auto font-semibold"
                                  >
                                    <a href={prefilledUrl} target="_blank" rel="noopener noreferrer">
                                      Open original article
                                    </a>
                                  </Button>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                <Input id="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
                 <div className="flex items-center pt-2">
                    <Label>Use full article for context?</Label>
                    <RadioGroup value={useFullArticle} onValueChange={(value: 'yes'|'no') => setUseFullArticle(value)} className="ml-4 flex items-center">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="r-yes" />
                            <Label htmlFor="r-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="r-no" />
                            <Label htmlFor="r-no">No</Label>
                        </div>
                    </RadioGroup>
                    <div className="ml-auto">
                      <Dialog>
                          <DialogTrigger asChild>
                              <Button variant="outline" size="sm">View Article</Button>
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
                                  <Button
                                    asChild
                                    variant="link"
                                    className="px-0 h-auto font-semibold"
                                  >
                                    <a href={resolvedArticleUrl || '#'} target="_blank" rel="noopener noreferrer">
                                      Open original article
                                    </a>
                                  </Button>
                                )}
                              </div>
                          </DialogContent>
                      </Dialog>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
              <Label htmlFor="brand-preset">Brand Preset</Label>
              <Select value={brandTone} onValueChange={setBrandTone}>
                <SelectTrigger id="brand-preset">
                  <SelectValue placeholder="Select a preset" />
                </SelectTrigger>
                <SelectContent>
                  {brandTones.map((tone) => (
                    <SelectItem key={tone} value={tone}>
                      {tone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {prefilledUrl && isGoogleNewsUrl(prefilledUrl) && (
              <div className="space-y-2">
                <Label htmlFor="article-url">Original article URL</Label>
                <Input
                  id="article-url"
                  placeholder="Paste the original article link (not news.google.com)"
                  value={articleUrlOverride}
                  onChange={(e) => setArticleUrlOverride(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Google News links cannot be scraped directly. Add the source link for full context.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Select Reference Images ({selectedImages.length}/{referenceImages.length})</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleFetchArchiveImages}
                  disabled={isLoadingArchiveImages}
                >
                  {isLoadingArchiveImages ? 'Loading...' : 'Fetch from archive'}
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {referenceImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => toggleReferenceImage(img.imageUrl)}
                    className={cn(
                      'rounded-lg overflow-hidden relative border-2 transition-all',
                      selectedImages.includes(img.imageUrl)
                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                        : 'border-muted hover:border-primary/50'
                    )}
                  >
                    <Image
                      src={img.imageUrl}
                      alt={img.description}
                      width={200}
                      height={200}
                      className="object-cover aspect-square"
                      data-ai-hint={img.imageHint}
                    />
                    {selectedImages.includes(img.imageUrl) && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <CheckCircle size={16} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <Label htmlFor="include-backlinks" className="font-semibold">Include Backlinks</Label>
                    <p className="text-sm text-muted-foreground">Automatically insert relevant links to your site.</p>
                </div>
                <Switch id="include-backlinks" checked={includeBacklinks} onCheckedChange={setIncludeBacklinks} />
            </div>


            <div className="space-y-2">
              <Label htmlFor="user-angle">Add Your Personal Angle</Label>
              <Textarea
                id="user-angle"
                placeholder="e.g., Focus on the impact of AI on small business marketing strategies..."
                value={userAngle}
                onChange={(e) => setUserAngle(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">This helps guide the tone and style of the generated content.</p>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
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

          {/* Right Panel: Results */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">2. Review Your Drafts</h2>
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
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex items-center justify-between px-4 pt-4 border-b">
                        <TabsList>
                            <TabsTrigger value="draft">Draft</TabsTrigger>
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-2">
                            {activeTab === 'preview' && (
                                <Button variant="outline" size="sm" onClick={() => setActiveTab('draft')}>
                                    <Pencil /> Edit
                                </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={handleCopy}>
                                <Clipboard /> Copy
                            </Button>
                        </div>
                    </div>
                    <TabsContent value="draft" className="p-6">
                        <Textarea 
                            className="min-h-[400px] text-base font-mono bg-muted/50"
                            value={drafts.blogPost}
                            onChange={(e) => setDrafts({...drafts, blogPost: e.target.value})}
                         />
                    </TabsContent>
                    <TabsContent value="preview" className="p-6">
                        <div className="prose prose-sm max-w-none text-foreground dark:prose-invert">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {drafts.blogPost}
                            </ReactMarkdown>
                        </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="text-center text-muted-foreground p-12 h-full flex flex-col items-center justify-center">
                    <Sparkles className="h-10 w-10 mb-4 text-primary" />
                    <h3 className="text-lg font-semibold mb-1">Content will appear here</h3>
                    <p className="max-w-xs mx-auto">Click the generate button to create your first draft.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            {drafts && (
              <Button onClick={() => setIsSaveModalOpen(true)} size="lg" className="w-full">
                <CheckCircle /> Save to Library
              </Button>
            )}
          </div>
        </div>
      </main>

      <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose a Save Slot</DialogTitle>
            <DialogDescription>Select one of your 10 available slots to save this content pack.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-5 gap-4 py-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <Button
                key={index}
                variant="outline"
                className="aspect-square h-auto w-full flex flex-col gap-2"
                onClick={() => handleSave(index + 1)}
              >
                <PlusSquare className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-semibold">Slot #{index + 1}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
