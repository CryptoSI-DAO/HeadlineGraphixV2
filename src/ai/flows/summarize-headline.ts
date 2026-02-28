'use server';

/**
 * @fileOverview An AI agent that summarizes news headlines.
 *
 * - summarizeHeadline - A function that summarizes a news headline.
 * - SummarizeHeadlineInput - The input type for the summarizeHeadline function.
 * - SummarizeHeadlineOutput - The return type for the summarizeHeadline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeHeadlineInputSchema = z.object({
  headline: z.string().describe('The news headline to summarize.'),
  articleContent: z
    .string()
    .describe('The content of the news article associated with the headline.'),
});
export type SummarizeHeadlineInput = z.infer<typeof SummarizeHeadlineInputSchema>;

const SummarizeHeadlineOutputSchema = z.object({
  summary: z.string().describe('A short summary of the news article.'),
});
export type SummarizeHeadlineOutput = z.infer<typeof SummarizeHeadlineOutputSchema>;

export async function summarizeHeadline(input: SummarizeHeadlineInput): Promise<SummarizeHeadlineOutput> {
  return summarizeHeadlineFlow(input);
}

const summarizeHeadlinePrompt = ai.definePrompt({
  name: 'summarizeHeadlinePrompt',
  input: {schema: SummarizeHeadlineInputSchema},
  output: {schema: SummarizeHeadlineOutputSchema},
  prompt: `Summarize the following news article in a concise manner:\n\nHeadline: {{{headline}}}\nArticle Content: {{{articleContent}}}`,
});

const summarizeHeadlineFlow = ai.defineFlow(
  {
    name: 'summarizeHeadlineFlow',
    inputSchema: SummarizeHeadlineInputSchema,
    outputSchema: SummarizeHeadlineOutputSchema,
  },
  async input => {
    const {output} = await summarizeHeadlinePrompt(input);
    return output!;
  }
);
