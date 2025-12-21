import type { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import type { GenerateContentDraftsOutput } from '@/ai/flows/generate-content-drafts';
import { DraftsPanel } from './DraftsPanel';

export const GenerateContentResults = ({
  isGenerating,
  drafts,
  activeTab,
  setActiveTab,
  activeModelLabel,
  elapsedSeconds,
  estimatedSeconds,
  setDrafts,
  handleCopy,
  onSaveClick,
}: {
  isGenerating: boolean;
  drafts: GenerateContentDraftsOutput | null;
  activeTab: string;
  setActiveTab: (value: string) => void;
  activeModelLabel: string;
  elapsedSeconds: number;
  estimatedSeconds: number | null;
  setDrafts: Dispatch<SetStateAction<GenerateContentDraftsOutput | null>>;
  handleCopy: () => void;
  onSaveClick: () => void;
}) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold">2. Review Your Drafts</h2>
    <DraftsPanel
      isGenerating={isGenerating}
      drafts={drafts}
      activeTab={activeTab}
      onActiveTabChange={setActiveTab}
      activeModelLabel={activeModelLabel}
      elapsedSeconds={elapsedSeconds}
      estimatedSeconds={estimatedSeconds}
      onCopy={handleCopy}
      onDraftChange={value =>
        setDrafts(prev => (prev ? { ...prev, blogPost: value } : prev))
      }
    />
    {drafts && (
      <Button onClick={onSaveClick} size="lg" className="w-full">
        <CheckCircle /> Save to Library
      </Button>
    )}
  </div>
);
