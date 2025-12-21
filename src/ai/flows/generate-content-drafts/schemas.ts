import { z } from 'genkit';

export const MODEL_PROVIDERS = ['gemini', 'glm'] as const;
export type ContentModelProvider = typeof MODEL_PROVIDERS[number];

export const GenerateContentDraftsInputSchema = z.object({
  headline: z.string().describe('The headline for which content needs to be generated.'),
  articleContent: z
    .string()
    .describe('The full content of the article to be used as context.')
    .optional(),
  articleUrl: z.string().url().describe('The URL of the original article.').optional(),
  includeBacklinks: z.boolean().describe('Whether to include backlinks in the content.').optional(),
  backlinkUrls: z
    .array(z.string().url())
    .describe('A list of backlink URLs to weave into the content.')
    .optional(),
  brandTone: z.string().describe('The brand tone to use for the content.'),
  referenceImages: z
    .array(
      z
        .string()
        .describe(
          'A reference image to guide the content generation, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
        )
    )
    .optional(),
  userAngle: z.string().describe('The user-provided angle or focus for the content.'),
  modelProvider: z.enum(MODEL_PROVIDERS).default('gemini'),
});
export type GenerateContentDraftsInput = z.infer<typeof GenerateContentDraftsInputSchema>;

export const GenerateContentDraftsOutputSchema = z.object({
  blogPost: z.string().describe('The generated blog post content in markdown format.'),
  linkedInPost: z.string().describe('The generated LinkedIn post content in markdown format.'),
  infographic: z.string().describe('The URL of a generated infographic image related to the content.'),
});
export type GenerateContentDraftsOutput = z.infer<typeof GenerateContentDraftsOutputSchema>;
