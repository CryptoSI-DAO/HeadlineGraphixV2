
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
  Plus,
  X,
  Palette,
  Type,
  Brush,
  RectangleHorizontal,
  RectangleVertical,
  Square as SquareIcon
} from 'lucide-react';
import { generateImage } from '@/ai/flows/generate-image';
import type { GenerateImageOutput } from '@/ai/flows/generate-image';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUploader } from '@/components/ImageUploader';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';


const brandTones = ['Momentum Inc.'];

export default function GenerateImagePage() {
  const { toast } = useToast();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GenerateImageOutput | null>(null);

  const [prompt, setPrompt] = useState('');
  const [brand, setBrand] = useState(brandTones[0]);
  const [referenceImages, setReferenceImages] = useState<(string | null)[]>([null, null, null, null]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [watermark, setWatermark] = useState('');
  const [imageSize, setImageSize] = useState('square');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [font, setFont] = useState('Inter');
  const [artStyle, setArtStyle] = useState('Minimalist');


  const handleOpenModal = (index: number) => {
    setActiveSlot(index);
    setIsModalOpen(true);
  };
  
  const handleSelectFromArchive = (imageUrl: string) => {
    if (activeSlot === null) return;
    const newImages = [...referenceImages];
    newImages[activeSlot] = imageUrl;
    setReferenceImages(newImages);
    setIsModalOpen(false);
    setActiveSlot(null);
  }

  const handleRemoveImage = (index: number) => {
    const newImages = [...referenceImages];
    newImages[index] = null;
    setReferenceImages(newImages);
  }

  const handleGenerate = async () => {
    if (!headline) {
      toast({
        variant: 'destructive',
        title: 'Headline is required',
        description: 'Please enter a headline to generate an image.',
      });
      return;
    }
    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      // The generateImage flow currently only takes prompt and brand.
      // We can extend it to take more parameters in the future.
      const result = await generateImage({ 
        prompt: `${headline}\n\n${content}`, 
        brand 
      });
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

  const archiveImages = PlaceHolderImages.slice(0, 10);

  return (
    <>
      <Header title="Infographic Generation" />
      <main className="flex-1 p-4 md:p-6">
        <p className="text-muted-foreground mb-8 max-w-2xl">
          Provide the content and branding for your infographic, and let our AI create a unique visual asset for you.
        </p>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Panel: Configuration */}
          <Card className="flex flex-col h-[calc(100vh-12rem)]">
            <CardHeader>
              <CardTitle>1. Configure Infographic</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full p-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="headline">Enter Headline <span className="text-destructive">*</span></Label>
                        <Input id="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g., The Future of Renewable Energy" />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                          id="content"
                          placeholder="Add key points or information you want to highlight in your infographic..."
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          className="min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="watermark">Watermark</Label>
                        <Input id="watermark" value={watermark} onChange={(e) => setWatermark(e.target.value)} placeholder="This will appear as a subtle watermark" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Add up to 4 reference images</Label>
                      <div className="grid grid-cols-4 gap-4">
                        {referenceImages.map((imageUrl, index) => (
                          <button
                            key={index}
                            className="relative aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary transition-all group bg-muted/20"
                            onClick={() => handleOpenModal(index)}
                          >
                            {imageUrl ? (
                              <>
                                <Image src={imageUrl} alt={`Reference ${index + 1}`} fill className="object-cover rounded-md" />
                                <div 
                                  className="absolute top-1 right-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 z-10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveImage(index);
                                  }}
                                >
                                  <X size={14} />
                                </div>
                              </>
                            ) : (
                              <Plus className="h-8 w-8 text-muted-foreground" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>


                    <div className="space-y-3">
                        <Label>Image Size</Label>
                        <RadioGroup value={imageSize} onValueChange={setImageSize} className="grid grid-cols-3 gap-4">
                            {[
                                {id: 'square', icon: SquareIcon, label: 'Square', dims: '1024x1024', desc: 'Best for FB, IG, LinkedIn'},
                                {id: 'landscape', icon: RectangleHorizontal, label: 'Landscape', dims: '1536x1024', desc: 'Best for Twitter, Banners'},
                                {id: 'portrait', icon: RectangleVertical, label: 'Portrait', dims: '1024x1536', desc: 'Best for Pinterest, Stories'},
                            ].map(size => (
                                <Label key={size.id} htmlFor={`size-${size.id}`} className={cn("rounded-lg border-2 p-3 flex flex-col items-center justify-center cursor-pointer transition-colors", imageSize === size.id ? 'border-primary ring-2 ring-primary' : 'border-muted hover:border-primary/50')}>
                                    <RadioGroupItem value={size.id} id={`size-${size.id}`} className="sr-only" />
                                    <size.icon className="w-8 h-8 mb-2" />
                                    <span className="font-semibold">{size.label}</span>
                                    <span className="text-xs text-muted-foreground">{size.dims}</span>
                                    <span className="text-xs text-center text-muted-foreground/80 mt-1">{size.desc}</span>
                                </Label>
                            ))}
                        </RadioGroup>
                    </div>
                    
                    <Tabs defaultValue="preset">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="preset">Use Saved Preset</TabsTrigger>
                            <TabsTrigger value="custom">Custom Branding</TabsTrigger>
                        </TabsList>
                        <TabsContent value="preset" className="pt-4">
                            <Select value={brand} onValueChange={setBrand}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a brand preset" />
                                </SelectTrigger>
                                <SelectContent>
                                    {brandTones.map((tone) => (
                                    <SelectItem key={tone} value={tone}>
                                        {tone}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </TabsContent>
                        <TabsContent value="custom" className="space-y-4 pt-4">
                          <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="primary-color" className="flex items-center gap-2"><Palette size={16}/> Primary Color</Label>
                                    <Input id="primary-color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="font" className="flex items-center gap-2"><Type size={16}/> Font</Label>
                                    <Select value={font} onValueChange={setFont}>
                                        <SelectTrigger id="font"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Inter">Inter</SelectItem>
                                            <SelectItem value="Roboto">Roboto</SelectItem>
                                            <SelectItem value="Open Sans">Open Sans</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                          </div>
                          <div className="space-y-2">
                                <Label htmlFor="art-style" className="flex items-center gap-2"><Brush size={16}/> Art Style</Label>
                                <Select value={artStyle} onValueChange={setArtStyle}>
                                    <SelectTrigger id="art-style"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Minimalist">Minimalist</SelectItem>
                                        <SelectItem value="Corporate">Corporate</SelectItem>
                                        <SelectItem value="Playful">Playful</SelectItem>
                                        <SelectItem value="Geometric">Geometric</SelectItem>
                                    </SelectContent>
                                </Select>
                          </div>
                        </TabsContent>
                    </Tabs>
                    </div>
                </ScrollArea>
            </CardContent>
            <div className="p-6 pt-0 mt-auto">
              <Button
                size="lg"
                className="w-full"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Infographic'}
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </div>
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
                        <Button variant="ghost" size="icon" onClick={handleGenerate} disabled={isGenerating}>
                            <RefreshCw className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Download className="h-5 w-5" />
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent className="min-h-[400px] flex items-center justify-center p-6">
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
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <ImageIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1 text-foreground">Your infographic will appear here</h3>
                  <p className="max-w-xs mx-auto text-sm">
                    Configure your inputs and click 'Generate Infographic' to begin.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select an Image</DialogTitle>
            <DialogDescription>
              Upload a new image or choose one from your existing archive.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="archive" className="w-full">
            <TabsList>
              <TabsTrigger value="archive">Image Archive</TabsTrigger>
              <TabsTrigger value="upload">Upload New</TabsTrigger>
            </TabsList>
            <TabsContent value="archive" className="mt-4">
                <div className="grid grid-cols-5 gap-4 max-h-[50vh] overflow-y-auto p-1">
                    {archiveImages.map((image) => (
                        <button 
                            key={image.id}
                            className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all group"
                            onClick={() => handleSelectFromArchive(image.imageUrl)}
                         >
                            <Image src={image.imageUrl} alt={image.description} fill className="object-cover" data-ai-hint={image.imageHint} />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-white text-sm font-semibold">Select</span>
                            </div>
                        </button>
                    ))}
                </div>
            </TabsContent>
            <TabsContent value="upload" className="mt-4">
                <ImageUploader />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
