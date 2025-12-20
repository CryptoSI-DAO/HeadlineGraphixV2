'use server';

/**
 * @fileOverview An image generation AI agent.
 *
 * - generateImage - A function that handles the image generation process.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
  brand: z.string().describe('The brand style to apply.'),
  referenceImages: z.array(z.string()).optional().describe('An array of reference image URLs.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the generated image.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async input => {
    // Note: The flow currently doesn't use the reference images.
    // This is a placeholder for future implementation.
    const response = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Generate an image for the following story: ${input.prompt}. Apply the following brand style: ${input.brand}.`,
    });
    const responseMedia = response.media;
    const mediaPart = Array.isArray(responseMedia) ? responseMedia[0] : responseMedia;
    if (!mediaPart?.url) {
      throw new Error('Imagen did not return a media URL.');
    }
    
    return {
      imageUrl: mediaPart.url,
    };
  }
);
