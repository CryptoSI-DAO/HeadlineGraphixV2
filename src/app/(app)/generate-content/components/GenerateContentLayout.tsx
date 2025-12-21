import type { Dispatch, SetStateAction } from 'react';
import type { ContentModelProvider, GenerateContentDraftsOutput } from '@/ai/flows/generate-content-drafts';
import { ModelSelector } from './ModelSelector';
import { SaveDialog } from './SaveDialog';
import { modelOptions } from '../constants';
import { GenerateContentInputs } from './GenerateContentInputs';
import { GenerateContentResults } from './GenerateContentResults';

export const GenerateContentLayout = ({
  headline,
  setHeadline,
  prefilledSource,
  prefilledUrl,
  resolvedArticleUrl,
  articleContent,
  isFetchingArticle,
  useFullArticle,
  setUseFullArticle,
  articleUrlOverride,
  setArticleUrlOverride,
  showUrlOverride,
  brandTone,
  setBrandTone,
  referenceImages,
  selectedImages,
  toggleReferenceImage,
  isLoadingArchiveImages,
  fetchArchiveImages,
  includeBacklinks,
  setIncludeBacklinks,
  userAngle,
  setUserAngle,
  handleGenerate,
  isGenerating,
  elapsedSeconds,
  activeTab,
  setActiveTab,
  activeModelLabel,
  drafts,
  setDrafts,
  handleCopy,
  isSaveModalOpen,
  setIsSaveModalOpen,
  handleSave,
  modelProvider,
  setModelProvider,
  estimatedSeconds,
}: {
  headline: string;
  setHeadline: (value: string) => void;
  prefilledSource: string | null;
  prefilledUrl: string | null;
  resolvedArticleUrl: string;
  articleContent: string;
  isFetchingArticle: boolean;
  useFullArticle: 'yes' | 'no';
  setUseFullArticle: (value: 'yes' | 'no') => void;
  articleUrlOverride: string;
  setArticleUrlOverride: (value: string) => void;
  showUrlOverride: boolean;
  brandTone: string;
  setBrandTone: (value: string) => void;
  referenceImages: { id: string; imageUrl: string; description: string; imageHint: string }[];
  selectedImages: string[];
  toggleReferenceImage: (url: string) => void;
  isLoadingArchiveImages: boolean;
  fetchArchiveImages: () => void;
  includeBacklinks: boolean;
  setIncludeBacklinks: (value: boolean) => void;
  userAngle: string;
  setUserAngle: (value: string) => void;
  handleGenerate: () => void;
  isGenerating: boolean;
  elapsedSeconds: number;
  activeTab: string;
  setActiveTab: (value: string) => void;
  activeModelLabel: string;
  drafts: GenerateContentDraftsOutput | null;
  setDrafts: Dispatch<SetStateAction<GenerateContentDraftsOutput | null>>;
  handleCopy: () => void;
  isSaveModalOpen: boolean;
  setIsSaveModalOpen: (value: boolean) => void;
  handleSave: (slot: number) => void;
  modelProvider: ContentModelProvider;
  setModelProvider: (value: ContentModelProvider) => void;
  estimatedSeconds: number | null;
}) => (
  <main className="flex-1 p-4 md:p-6">
    <ModelSelector modelProvider={modelProvider} options={modelOptions} onChange={setModelProvider} />
    <p className="text-muted-foreground mb-8 max-w-2xl">
      Configure your inputs on the left and review the generated drafts on the right.
    </p>
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <GenerateContentInputs
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
        showUrlOverride={showUrlOverride}
        brandTone={brandTone}
        setBrandTone={setBrandTone}
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
      />

      <GenerateContentResults
        isGenerating={isGenerating}
        drafts={drafts}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeModelLabel={activeModelLabel}
        elapsedSeconds={elapsedSeconds}
        estimatedSeconds={estimatedSeconds}
        setDrafts={setDrafts}
        handleCopy={handleCopy}
        onSaveClick={() => setIsSaveModalOpen(true)}
      />
    </div>

    <SaveDialog isOpen={isSaveModalOpen} onOpenChange={setIsSaveModalOpen} onSave={handleSave} />
  </main>
);
