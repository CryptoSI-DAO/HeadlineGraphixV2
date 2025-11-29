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
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles,
  Pencil,
  RefreshCw,
  Download,
  ImageIcon,
  FileText,
} from 'lucide-react';
import { generateImage } from '@/ai/flows/generate-image';
import type { GenerateImageOutput } from '@/ai/flows/generate-image';

const brandTones = ['Momentum Inc.'];
const aiModels = ['Visionary V3 (Recommended)', 'Visionary V2', 'Stable Diffusion XL'];

export default function GenerateImagePage() {
  const { toast } = useToast();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GenerateImageOutput | null>(null);

  const [prompt, setPrompt] = useState('');
  const [brand, setBrand] = useState(brandTones[0]);
  const [model, setModel] = useState(aiModels[0]);

  const handleGenerate = async () => {
    if (!prompt) {
      toast({
        variant: 'destructive',
        title: 'Prompt is required',
        description: 'Please enter a headline or story to generate an image.',
      });
      return;
    }
    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const result = await generateImage({ prompt, brand });
      setGeneratedImage(result);
      toast({
        title: 'Image Generated',
        description: 'Your new visual asset is ready.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate image. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Header title="Image Generation" />
      <main className="flex-1 p-4 md:p-6">
        <p className="text-muted-foreground mb-8 max-w-2xl">
          Provide a story or draft, select a model, and generate a unique visual asset.
        </p>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Panel: Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>1. Configure Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="headline-story">Import Headline & Full Story</Label>
                  <Button variant="link" size="sm" className="text-primary">
                    <FileText className="mr-2 h-4 w-4" />
                    Select a Saved Draft
                  </Button>
                </div>
                <Textarea
                  id="headline-story"
                  placeholder="Paste your headline and full story here..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[150px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Select value={brand} onValueChange={setBrand}>
                  <SelectTrigger id="brand">
                    <SelectValue placeholder="Select a brand" />
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

              <div className="space-y-2">
                <Label htmlFor="ai-model">AI Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger id="ai-model">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {aiModels.map((modelName) => (
                      <SelectItem key={modelName} value={modelName}>
                        {modelName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                size="lg"
                className="w-full bg-cyan-400 hover:bg-cyan-500 text-slate-900"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Image'}
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          {/* Right Panel: Results */}
          <Card>
             <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>2. Review & Edit</CardTitle>
                {generatedImage && (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                            <Pencil className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <RefreshCw className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Download className="h-5 w-5" />
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent className="min-h-[400px] flex items-center justify-center">
              {isGenerating ? (
                <div className="w-full aspect-square max-w-sm">
                  <Skeleton className="h-full w-full rounded-lg" />
                </div>
              ) : generatedImage ? (
                <div className="relative aspect-square w-full max-w-sm rounded-lg overflow-hidden border">
                  <Image
                    src={generatedImage.imageUrl}
                    alt="Generated visual asset"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/10 mb-4">
                    <ImageIcon className="h-8 w-8 text-cyan-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1 text-foreground">Your generated image will appear here</h3>
                  <p className="max-w-xs mx-auto text-sm">
                    Configure your inputs and click 'Generate Image' to begin.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
