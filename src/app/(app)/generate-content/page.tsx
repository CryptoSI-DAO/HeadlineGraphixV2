
'use client';

import { useState } from 'react';
import Image from 'next/image';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { MOCK_DRAFTS } from '@/lib/mock-data';
import {
  Sparkles,
  CheckCircle,
  Clipboard,
  Pencil,
  PlusSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const brandTones = ['Momentum Inc.'];

export default function GenerateContentPage() {
  const { addHistoryItem } = useAppContext();
  const { toast } = useToast();

  const [isGenerating, setIsGenerating] = useState(false);
  const [drafts, setDrafts] = useState<typeof MOCK_DRAFTS | null>(null);

  const [brandTone, setBrandTone] = useState(brandTones[0]);
  const [selectedImage, setSelectedImage] = useState(PlaceHolderImages[0].imageUrl);
  const [userAngle, setUserAngle] = useState('');
  const [includeBacklinks, setIncludeBacklinks] = useState(true);
  const [activeTab, setActiveTab] = useState('draft');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

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

  const handleSave = (slot: number) => {
    if (!drafts) return;
    addHistoryItem({
      headline: 'AI-Powered Content Generation',
      config: { brandTone, referenceImage: selectedImage, userAngle },
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

  const referenceImages = PlaceHolderImages.slice(0, 3);

  return (
    <>
      <Header title="Content Generation Studio" />
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
