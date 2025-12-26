'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { MOCK_HEADLINES } from '@/lib/mock-data';
import type { Headline } from '@/lib/types';
import type { GenerateContentDraftsOutput } from '@/ai/flows/generate-content-drafts';
import { generateContentDrafts } from '@/ai/flows/generate-content-drafts';
import { CheckCircle } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { StudioConfigPanel, StudioResultsPanel } from './components';
import { getBase64FromUrl } from './utils';
import { brandTones } from './constants';

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

  const handleSave = async () => {
    if (!drafts || !headline) return;
    const saved = await addHistoryItem({
      headline: headline.title,
      config: { brandTone, referenceImage: selectedImage, userAngle },
      drafts,
    });
    if (saved) {
      toast({
        title: 'Saved to History',
        description: 'Your content pack has been successfully saved.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Please sign in to save content packs.',
      });
    }
  };

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
        {drafts && (
          <Button onClick={handleSave}>
            <CheckCircle /> Save to History
          </Button>
        )}
      </Header>
      <main className="flex-1 grid md:grid-cols-2 gap-6 p-4 md:p-6">
        <StudioConfigPanel
          headlineTitle={headline.title}
          brandTone={brandTone}
          onBrandToneChange={setBrandTone}
          selectedImage={selectedImage}
          onSelectImage={setSelectedImage}
          userAngle={userAngle}
          onUserAngleChange={setUserAngle}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />

        <div>
          <StudioResultsPanel
            isGenerating={isGenerating}
            drafts={drafts}
            onDraftChange={next => setDrafts(prev => (prev ? { ...prev, ...next } : prev))}
          />
        </div>
      </main>
    </>
  );
}
