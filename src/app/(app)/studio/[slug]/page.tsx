'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { MOCK_HEADLINES } from '@/lib/mock-data';
import type { Headline } from '@/lib/types';
import type { GenerateContentDraftsOutput } from '@/ai/flows/generate-content-drafts';
import { generateContentDrafts } from '@/ai/flows/generate-content-drafts';
import { Sparkles, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const brandTones = ['Professional', 'Casual', 'Witty', 'Informative', 'Enthusiastic'];

export default function StudioPage() {
  const params = useParams();
  const { slug } = params;
  const { addHistoryItem } = useAppContext();
  const { toast } = useToast();

  const [headline, setHeadline] = useState<Headline | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [drafts, setDrafts] = useState<GenerateContentDraftsOutput | null>(null);

  const [brandTone, setBrandTone] = useState(brandTones[0]);
  const [selectedImage, setSelectedImage] = useState(PlaceHolderImages[0].imageUrl);
  const [userAngle, setUserAngle] = useState('');

  useEffect(() => {
    const foundHeadline = MOCK_HEADLINES.find(h => h.slug === slug);
    if (foundHeadline) {
        setHeadline(foundHeadline);
    }
  }, [slug]);

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
    if (!headline) return;

    setIsGenerating(true);
    setDrafts(null);
    
    try {
      const imageAsDataUrl = await getBase64FromUrl(selectedImage);

      const generatedDrafts = await generateContentDrafts({
        headline: headline.title,
        brandTone,
        referenceImages: [imageAsDataUrl],
        userAngle,
        modelProvider: 'gemini',
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

  const handleSave = () => {
    if (!drafts || !headline) return;
    addHistoryItem({
        headline: headline.title,
        config: { brandTone, referenceImage: selectedImage, userAngle },
        drafts,
    });
    toast({
        title: 'Saved to History',
        description: 'Your content pack has been successfully saved.',
    });
  };
  
  const referenceImages = PlaceHolderImages.slice(0, 3);

  if (!headline) {
    return (
        <>
            <Header title="Content Studio" />
            <main className="flex-1 p-6 text-center">
                <p>Loading headline...</p>
            </main>
        </>
    );
  }

  return (
    <>
      <Header title="Content Pack Studio">
        {drafts && <Button onClick={handleSave}><CheckCircle /> Save to History</Button>}
      </Header>
      <main className="flex-1 grid md:grid-cols-2 gap-6 p-4 md:p-6">
        {/* Left Panel: Configuration */}
        <Card className="h-fit sticky top-24">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Generate content for: &ldquo;{headline.title}&rdquo;</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="brand-tone">Brand Tone</Label>
              <Select value={brandTone} onValueChange={setBrandTone}>
                <SelectTrigger id="brand-tone">
                  <SelectValue placeholder="Select a tone" />
                </SelectTrigger>
                <SelectContent>
                  {brandTones.map(tone => <SelectItem key={tone} value={tone}>{tone}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reference Image</Label>
              <div className="grid grid-cols-3 gap-2">
                {referenceImages.map(img => (
                  <button key={img.id} onClick={() => setSelectedImage(img.imageUrl)} className={cn('rounded-md overflow-hidden relative border-2', selectedImage === img.imageUrl ? 'border-primary ring-2 ring-primary' : 'border-transparent')}>
                    <Image src={img.imageUrl} alt={img.description} width={150} height={150} className="object-cover aspect-square" data-ai-hint={img.imageHint} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-angle">Your Angle (Optional)</Label>
              <Textarea id="user-angle" placeholder="e.g., Focus on the sustainability aspect..." value={userAngle} onChange={(e) => setUserAngle(e.target.value)} />
            </div>
            <Button size="lg" className="w-full" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate Drafts'}
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        
        {/* Right Panel: Results */}
        <div>
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
                    <Textarea className="min-h-[400px] text-base" value={drafts.blogPost} onChange={(e) => setDrafts({...drafts, blogPost: e.target.value})} />
                </TabsContent>
                <TabsContent value="linkedin" className="mt-4">
                    <Textarea className="min-h-[200px] text-base" value={drafts.linkedInPost}  onChange={(e) => setDrafts({...drafts, linkedInPost: e.target.value})} />
                </TabsContent>
                <TabsContent value="infographic" className="mt-4">
                    <div className="relative aspect-[2/3] w-full max-w-md mx-auto rounded-lg overflow-hidden border">
                        <Image src={drafts.infographic} alt="Generated Infographic" fill className="object-cover" data-ai-hint="infographic design" />
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
        </div>
      </main>
    </>
  );
}
