import type { ImagePlaceholder } from "./placeholder-images";
import type { GenerateContentDraftsOutput } from "@/ai/flows/generate-content-drafts";

export type Headline = {
  id: string;
  slug: string;
  title: string;
  source: string;
  date: string;
  content?: string;
};

export type GeneratedContent = {
  id: string;
  date: Date;
  headline: string;
  type: 'Content Pack';
  config: {
    brandTone: string;
    referenceImage: string; // url
    userAngle: string;
  };
  drafts: GenerateContentDraftsOutput;
};

export type UserPreferences = {
  focusTopics: string[];
  backlinkUrls: string[];
};
