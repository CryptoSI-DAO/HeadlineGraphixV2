import type { ImagePlaceholder } from "./placeholder-images";

export type Headline = {
  id: string;
  slug: string;
  title: string;
  source: string;
  date: string;
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
  drafts: {
    blogPost: string;
    linkedInPost: string;
    infographic: string; // url
  };
};

export type UserPreferences = {
  focusTopics: string[];
  backlinkUrls: string[];
};
