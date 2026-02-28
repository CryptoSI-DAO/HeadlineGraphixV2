import type { GenerateContentDraftsInput } from './schemas';

export function buildModelPrompt(input: GenerateContentDraftsInput) {
  const sections = [
    `Headline: ${input.headline}`,
    input.articleContent
      ? `Article Content (context):\n${input.articleContent}`
      : 'Article Content: (not provided)',
    `Brand Tone: ${input.brandTone}`,
    `User Angle: ${input.userAngle || 'None provided'}`,
  ];

  if (input.referenceImages && input.referenceImages.length > 0) {
    sections.push(
      `Reference image count: ${input.referenceImages.length}.`,
      'Reference images were provided to guide style and mood, but you cannot access binary data. Infer a cohesive visual direction based on the other inputs.'
    );
  }

  if (input.includeBacklinks && input.backlinkUrls && input.backlinkUrls.length > 0) {
    sections.push(
      `Include 2-3 relevant backlinks from this list: ${input.backlinkUrls.join(', ')}.`,
      'Weave backlinks naturally into the blog post using markdown links.',
      'Do not include backlinks in the LinkedIn post unless the user angle calls for it.'
    );
  } else {
    sections.push('Do not include any backlinks.');
  }

  sections.push(
    'Generate a markdown blog post and a markdown LinkedIn post that align with the tone and angle.',
    'The blog post must be fully self-contained. Do not reference the source article, the headline source, or any external post.',
    'If the headline or context implies a numbered list (e.g., Top 10), the blog post must include the complete list with all items.',
    'If the article content is missing list items, infer a plausible full list without referencing the source.',
    'Incorporate the user angle directly in the introduction and the closing call-to-action.',
    'Respond with a strict JSON object (no code fences, no YAML front matter, no explanations) that matches this schema: {"blogPost": string, "linkedInPost": string, "infographic": string}.',
    'Do not include titles, authors, or metadata outside the JSON fields.',
    'Set "infographic" to either a direct https URL for a relevant infographic or leave it as an empty string if you are unsure.'
  );

  return sections.join('\n\n');
}
