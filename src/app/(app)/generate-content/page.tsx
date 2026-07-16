'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { CheckCircle } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { useBrandKits } from '@/hooks/use-brand-kits';
import type { ContentModelProvider } from '@/ai/flows/generate-content-drafts';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { brandTones, modelOptions } from './constants';
import { isGoogleNewsUrl } from './utils';
import { GenerateContentLayout } from './components';
import { useArticleContent, useGenerateContent, useReferenceImages } from './hooks';

function GenerateContentPageInner() {
  const { addHistoryItem, preferences, history } = useAppContext();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const prefilledHeadline = searchParams.get('headline');
  const prefilledSummary = searchParams.get('summary');
  const prefilledSource = searchParams.get('source');
  const prefilledUrl = searchParams.get('url');

  const [headline, setHeadline] = useState(
    prefilledHeadline ?? 'AI-Powered Content Generation'
  );
  const [useFullArticle, setUseFullArticle] = useState<'yes' | 'no'>('no');
  const { presets: brandPresets, isLoading: isLoadingBrands } = useBrandKits();
  const [brandTone, setBrandTone] = useState(brandTones[0]);
  const [articleUrlOverride, setArticleUrlOverride] = useState('');
  const [userAngle, setUserAngle] = useState(prefilledSummary ?? '');
  const [includeBacklinks, setIncludeBacklinks] = useState(true);
  const [modelProvider, setModelProvider] = useState<ContentModelProvider>('gemini');
  const [activeTab, setActiveTab] = useState('draft');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  useEffect(() => {
    if (prefilledHeadline) {
      setHeadline(prefilledHeadline);
    }
  }, [prefilledHeadline]);

  useEffect(() => {
    if (prefilledSummary && prefilledSummary.trim().length > 0) {
      setUserAngle(prefilledSummary);
    } else {
      setUserAngle('');
    }
  }, [prefilledSummary]);

  useEffect(() => {
    if (brandPresets.length === 0) {
      return;
    }
    const presetNames = brandPresets.map((preset) => preset.name);
    if (!presetNames.includes(brandTone)) {
      setBrandTone(presetNames[0]);
    }
  }, [brandPresets, brandTone]);

  // Use the selected brand's backlinks (brand-level), falling back to user-level preferences
  const selectedBrand = brandPresets.find(preset => preset.name === brandTone);
  const effectiveBacklinkUrls = (selectedBrand?.backlinkUrls?.length ?? 0) > 0
    ? selectedBrand!.backlinkUrls.filter(Boolean)
    : preferences.backlinkUrls;

  const { articleContent, isFetchingArticle, resolvedArticleUrl } = useArticleContent({
    prefilledSummary,
    prefilledUrl,
    useFullArticle,
    articleUrlOverride,
  });

  const {
    referenceImages,
    selectedImages,
    isLoadingArchiveImages,
    toggleReferenceImage,
    fetchArchiveImages,
  } = useReferenceImages({
    initialReferenceImages: PlaceHolderImages.slice(0, 3),
    toast,
  });

  const {
    drafts,
    setDrafts,
    isGenerating,
    elapsedSeconds,
    estimatedSeconds,
    handleGenerate,
  } = useGenerateContent({
    headline,
    articleContent,
    useFullArticle,
    resolvedArticleUrl,
    includeBacklinks,
    backlinkUrls: effectiveBacklinkUrls,
    brandTone,
    selectedImages,
    userAngle,
    modelProvider,
    toast,
  });

  const activeModelLabel =
    modelOptions.find(option => option.value === modelProvider)?.label ?? 'Model';

  const brandOptions = brandPresets.length > 0 ? brandPresets.map((preset) => preset.name) : brandTones;
  const filledSlots = Array.from({ length: 10 }).map((_, index) => Boolean(history[index]));

  const handleSave = async (slot: number) => {
    if (!drafts) return;
    const saved = await addHistoryItem({
      headline,
      config: { brandTone, referenceImage: selectedImages[0] ?? '', userAngle },
      drafts,
    });
    if (saved) {
      toast({
        title: 'Saved to Content Library',
        description: `Your content pack has been successfully saved to slot #${slot}.`,
        action: <CheckCircle />,
      });
      setIsSaveModalOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Please sign in to save content packs.',
      });
    }
  };

  const handleCopy = () => {
    if (!drafts) return;
    navigator.clipboard.writeText(drafts.blogPost);
    toast({
      title: 'Copied to Clipboard',
      description: 'The blog post content has been copied.',
    });
  };

  return (
    <>
      <Header title="Content Generation Studio" />
      <GenerateContentLayout
        headline={headline}
        setHeadline={setHeadline}
        prefilledSource={prefilledSource}
        prefilledUrl={prefilledUrl}
        resolvedArticleUrl={resolvedArticleUrl}
        articleContent={articleContent}
        isFetchingArticle={isFetchingArticle}
        useFullArticle={useFullArticle}
        setUseFullArticle={setUseFullArticle}
        articleUrlOverride={articleUrlOverride}
        setArticleUrlOverride={setArticleUrlOverride}
        showUrlOverride={Boolean(prefilledUrl && isGoogleNewsUrl(prefilledUrl))}
        brandTone={brandTone}
        setBrandTone={setBrandTone}
        brandOptions={brandOptions}
        isLoadingBrands={isLoadingBrands}
        referenceImages={referenceImages}
        selectedImages={selectedImages}
        toggleReferenceImage={toggleReferenceImage}
        isLoadingArchiveImages={isLoadingArchiveImages}
        fetchArchiveImages={fetchArchiveImages}
        includeBacklinks={includeBacklinks}
        setIncludeBacklinks={setIncludeBacklinks}
        userAngle={userAngle}
        setUserAngle={setUserAngle}
        handleGenerate={handleGenerate}
        isGenerating={isGenerating}
        elapsedSeconds={elapsedSeconds}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeModelLabel={activeModelLabel}
        drafts={drafts}
        setDrafts={setDrafts}
        handleCopy={handleCopy}
        isSaveModalOpen={isSaveModalOpen}
        setIsSaveModalOpen={setIsSaveModalOpen}
        handleSave={handleSave}
        filledSlots={filledSlots}
        modelProvider={modelProvider}
        setModelProvider={setModelProvider}
        estimatedSeconds={estimatedSeconds}
      />
    </>
  );
}

export default function GenerateContentPage() {
  return (
    <Suspense fallback={null}>
      <GenerateContentPageInner />
    </Suspense>
  );
}
