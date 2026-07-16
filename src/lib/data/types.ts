export type BrandPreset = {
  id: string;
  name: string;
  tone: string;
  palette?: string[];
  logoUrl?: string;
};

export type BrandKit = {
  id: string;
  userId: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  trimColor: string;
  font: string;
  artStyle: string;
  logoStoragePath?: string;
  logoUrl?: string;
  logoAlt?: string;
  focusTopics: string[];
  backlinkUrls: string[];
  createdAt: string;
  updatedAt: string;
};

export type ReferenceImageMeta = {
  id: string;
  storagePath: string;
  imageUrl: string;
  description?: string;
  aiHint?: string;
  createdAt: string;
};

export type AIPreferences = {
  defaultTone?: string;
  fallbackTone?: string;
  defaultReferenceImageId?: string;
  defaultLinkedInCallToAction?: string;
  temperature?: number;
  maxDraftsPerRequest?: number;
};

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  focusTopics: string[];
  backlinkUrls: string[];
  brandPresets: BrandPreset[];
  creditBalance: number;
  referenceImages: ReferenceImageMeta[];
  contentHistory: string[];
  aiPreferences: AIPreferences;
  createdAt: string;
  updatedAt: string;
};

export type UpdateUserPreferencesInput = Partial<
  Pick<
    UserProfile,
    | 'focusTopics'
    | 'backlinkUrls'
    | 'brandPresets'
    | 'creditBalance'
    | 'referenceImages'
    | 'contentHistory'
    | 'aiPreferences'
  >
>;

export type ContentPackConfig = {
  brandTone: string;
  referenceImage?: string;
  userAngle?: string;
  backlinks?: string[];
};

export type ContentPackDrafts = {
  blogPost: string;
  linkedInPost: string;
  infographic: string;
};

export type SaveContentPackInput = {
  headlineId?: string;
  headline: string;
  config: ContentPackConfig;
  drafts: ContentPackDrafts;
};
