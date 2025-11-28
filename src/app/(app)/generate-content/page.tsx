'use client';

import { useState } from 'react';
import Image from 'next/image';
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
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { MOCK_DRAFTS } from '@/lib/mock-data';
import {
  Sparkles,
  CheckCircle,
  ClipboardCopy,
  Download,
  FilePenLine,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { GeneratedContent } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const brandTones = ['Momentum Inc.'];

export default function GenerateContentPage() {
  const { addHistoryItem, preferences } = useAppContext();
  const { toast } = useToast();

  const [isGenerating, setIsGenerating] = useState(false);
  const [drafts, setDrafts] = useState<typeof MOCK_DRAFTS | null>(null);

  const [brandTone, setBrandTone] = useState(brandTones[0]);
  const [selectedImage, setSelectedImage] = useState(PlaceHolderImages[0].imageUrl);
  const [userAngle, setUserAngle] = useState('');
  const [includeBacklinks, setIncludeBacklinks] = useState(true);

  const handleGenerate = () => {
    setIsGenerating(true);
    setDrafts(null);
    setTimeout(() => {
      const generatedDrafts = {
        blogPost: `### Unlocking Growth: How AI is Revolutionizing Small Business Marketing\n\nIn today's competitive landscape, small businesses are constantly seeking innovative ways to stand out. Artificial Intelligence (AI) has emerged as a game-changer, offering powerful tools that were once exclusive to large corporations. From personalized customer experiences to data-driven campaign optimization, AI is leveling the playing field.\n\nLet's explore how you can leverage AI to supercharge your marketing efforts and drive sustainable growth. By focusing on the impact of AI on small business marketing strategies, we can uncover practical applications that deliver real results.\n\n- Automated Content Creation\n- Predictive Analytics for Customer Behavior\n- Hyper-Personalization at Scale`,
        linkedInPost: MOCK_DRAFTS.linkedInPost,
        infographic: MOCK_DRAFTS.infographic,
      };
      setDrafts(generatedDrafts);
      setIsGenerating(false);
      toast({
        title: 'Drafts Generated',
        description: 'Your new content drafts are ready for review.',
      });
    }, 2000);
  };

  const handleSave = () => {
    if (!drafts) return;
    addHistoryItem({
      headline: 'AI-Powered Content Generation',
      config: { brandTone, referenceImage: selectedImage, userAngle },
      drafts,
    });
    toast({
      title: 'Saved to Content Library',
      description: 'Your content pack has been successfully saved.',
      action: <CheckCircle />,
    });
  };

  const referenceImages = PlaceHolderImages.slice(0, 3);

  return (
    <>
      <Header title="Content Generation Studio">
        {drafts && (
          <Button onClick={handleSave}>
            <CheckCircle /> Save to Library
          </Button>
        )}
      </Header>
      <main className="flex-1 p-4 md:p-6">
        <p className="text-muted-foreground mb-8 max-w-2xl">
          Configure your inputs on the left and review the generated drafts on the right.
        </p>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Panel: Configuration */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">1. Set Your Inputs</h2>
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

            <div className="space-y-4">
              <Label>Select Reference Images (1/{referenceImages.length})</Label>
              <div className="grid grid-cols-3 gap-4">
                {referenceImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.imageUrl)}
                    className={cn(
                      'rounded-lg overflow-hidden relative border-2 transition-all',
                      selectedImage === img.imageUrl
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
                    {selectedImage === img.imageUrl && (
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
              {isGenerating ? 'Generating...' : 'Generate Content'}
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Right Panel: Results */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">2. Review Your Drafts</h2>
            <Card className="min-h-[500px]">
              <CardContent className="p-0">
                {isGenerating ? (
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-4" />
                  </div>
                ) : drafts ? (
                  <Tabs defaultValue="blog" className="w-full">
                    <div className="flex items-center px-4 pt-4 border-b">
                        <TabsList>
                            <TabsTrigger value="blog">Blog Draft</TabsTrigger>
                            <TabsTrigger value="linkedin">LinkedIn Post</TabsTrigger>
                            <TabsTrigger value="visual">Visual Asset</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="blog" className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <Badge variant="outline">Draft</Badge>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon"><ClipboardCopy size={16} /></Button>
                                <Button variant="ghost" size="icon"><FilePenLine size={16} /></Button>
                                <Button variant="ghost" size="icon"><Download size={16} /></Button>
                            </div>
                        </div>
                        <div className="prose prose-sm max-w-none text-foreground dark:prose-invert">
                            <pre className="whitespace-pre-wrap font-sans bg-transparent p-0">{drafts.blogPost}</pre>
                        </div>
                    </TabsContent>
                    <TabsContent value="linkedin" className="p-6">
                        <div className="prose prose-sm max-w-none text-foreground dark:prose-invert">
                            <pre className="whitespace-pre-wrap font-sans bg-transparent p-0">{drafts.linkedInPost}</pre>
                        </div>
                    </TabsContent>
                    <TabsContent value="visual" className="p-6 flex justify-center">
                      <div className="relative aspect-[2/3] w-full max-w-xs rounded-lg overflow-hidden border">
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
                  <div className="text-center text-muted-foreground p-12 h-full flex flex-col items-center justify-center">
                    <Sparkles className="h-10 w-10 mb-4 text-primary" />
                    <h3 className="text-lg font-semibold mb-1">Content will appear here</h3>
                    <p className="max-w-xs mx-auto">Click the generate button to create your first draft.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}