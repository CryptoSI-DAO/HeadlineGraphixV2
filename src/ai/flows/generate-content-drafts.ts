'use server';

/**
 * @fileOverview A content draft generation AI agent.
 *
 * - generateContentDrafts - A function that handles the content draft generation process.
 * - GenerateContentDraftsInput - The input type for the generateContentDrafts function.
 * - GenerateContentDraftsOutput - The return type for the generateContentDrafts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContentDraftsInputSchema = z.object({
  headline: z.string().describe('The headline for which content needs to be generated.'),
  articleContent: z.string().describe('The full content of the article to be used as context.').optional(),
  brandTone: z.string().describe('The brand tone to use for the content.'),
  referenceImage: z
    .string()
    .describe(
      'A reference image to guide the content generation, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ).optional(),
  userAngle: z.string().describe('The user-provided angle or focus for the content.'),
});
export type GenerateContentDraftsInput = z.infer<typeof GenerateContentDraftsInputSchema>;

const GenerateContentDraftsOutputSchema = z.object({
  blogPost: z.string().describe('The generated blog post content in markdown format.'),
  linkedInPost: z.string().describe('The generated LinkedIn post content in markdown format.'),
  infographic: z.string().describe('The URL of a generated infographic image related to the content.'),
});
export type GenerateContentDraftsOutput = z.infer<typeof GenerateContentDraftsOutputSchema>;

export async function generateContentDrafts(input: GenerateContentDraftsInput): Promise<GenerateContentDraftsOutput> {
  return generateContentDraftsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateContentDraftsPrompt',
  input: {schema: GenerateContentDraftsInputSchema},
  output: {schema: GenerateContentDraftsOutputSchema},
  prompt: `You are a content creation expert. Generate a blog post and a LinkedIn post based on the following information for the headline: {{{headline}}}.

  {{#if articleContent}}
  Use the following article as the primary source of information:
  {{{articleContent}}}
  {{/if}}

  Incorporate the following brand tone: {{{brandTone}}}.
  Incorporate the following angle provided by the user: {{{userAngle}}}.

  {{#if referenceImage}}
  Consider the following reference image: {{media url=referenceImage}}
  {{/if}}

  The blog post should be in markdown format.
  The LinkedIn post should be shorter and also in markdown format.
  Also generate a URL for a infographic image related to the content.
  Output the infographic image as a URL.
`,
});

const generateContentDraftsFlow = ai.defineFlow(
  {
    name: 'generateContentDraftsFlow',
    inputSchema: GenerateContentDraftsInputSchema,
    outputSchema: GenerateContentDraftsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The model did not return a response. Please try again.");
    }

    // Replace placeholder image URL with a real one
    if (!output.infographic || !output.infographic.startsWith('http')) {
        const imageResponse = await ai.generate({
            model: 'googleai/imagen-4.0-fast-generate-001',
            prompt: `An infographic about: ${input.headline}. Style: Clean, modern, professional.`,
        });
        const media = await imageResponse.media();
        output.infographic = media.url;
    }
    
    return output;
  }
);
