
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
import type { GenerateContentDraftsOutput } from '@/ai/flows/generate-content-drafts';
import { generateContentDrafts } from '@/ai/flows/generate-content-drafts';
import {
  Sparkles,
  CheckCircle,
  Clipboard,
  Pencil,
  PlusSquare,
  Expand,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const brandTones = ['Momentum Inc.'];
const MOCK_ARTICLE = "In an era where digital presence is paramount, small and medium-sized businesses (SMBs) are increasingly turning to Artificial Intelligence (AI) to gain a competitive edge. AI-powered marketing tools, once the exclusive domain of large corporations with deep pockets, are now more accessible than ever. These tools offer sophisticated capabilities—from hyper-personalized customer communication and predictive analytics to automated content creation and dynamic ad optimization. By leveraging AI, SMBs can not only streamline their marketing operations but also uncover deep insights into customer behavior, allowing them to craft more effective and targeted campaigns. This technological shift is leveling the playing field, enabling smaller players to compete more effectively and achieve significant growth in a crowded marketplace.";


export default function GenerateContentPage() {
  const { addHistoryItem } = useAppContext();
  const { toast } = useToast();

  const [isGenerating, setIsGenerating] = useState(false);
  const [drafts, setDrafts] = useState<GenerateContentDraftsOutput | null>(null);

  const [headline, setHeadline] = useState('AI-Powered Content Generation');
  const [useFullArticle, setUseFullArticle] = useState<'yes' | 'no'>('no');
  const [brandTone, setBrandTone] = useState(brandTones[0]);
  const [selectedImage, setSelectedImage] = useState(PlaceHolderImages[0].imageUrl);
  const [userAngle, setUserAngle] = useState('');
  const [includeBacklinks, setIncludeBacklinks] = useState(true);
  
  const [activeTab, setActiveTab] = useState('draft');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

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
    
    try {
      const imageAsDataUrl = await getBase64FromUrl(selectedImage);

      const generatedDrafts = await generateContentDrafts({
        headline,
        articleContent: useFullArticle === 'yes' ? MOCK_ARTICLE : undefined,
        brandTone,
        referenceImage: imageAsDataUrl,
        userAngle,
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
    }
  };

  const handleSave = (slot: number) => {
    if (!drafts) return;
    addHistoryItem({
      headline,
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
                                <DialogDescription>Full article content</DialogDescription>
                            </DialogHeader>
                            <div className="prose max-w-none dark:prose-invert max-h-[60vh] overflow-y-auto">
                                <p>{MOCK_ARTICLE}</p>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                <Input id="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
                 <div className="flex items-center space-x-4 pt-2">
                    <Label>Use full article for context?</Label>
                    <RadioGroup value={useFullArticle} onValueChange={(value: 'yes'|'no') => setUseFullArticle(value)} className="flex items-center">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="r-yes" />
                            <Label htmlFor="r-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="r-no" />
                            <Label htmlFor="r-no">No</Label>
                        </div>
                    </RadioGroup>
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
                            <TabsTrigger value="infographic">Infographic</TabsTrigger>
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
                    <TabsContent value="infographic" className="mt-4 p-6 flex justify-center">
                        <div className="relative aspect-[2/3] w-full max-w-xs rounded-lg overflow-hidden border">
                            <Image src={drafts.infographic} alt="Generated Infographic" fill className="object-cover" />
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
