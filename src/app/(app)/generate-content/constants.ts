import type { ContentModelProvider } from '@/ai/flows/generate-content-drafts';

export const brandTones = ['Momentum Inc.'];

export const modelOptions: {
  value: ContentModelProvider;
  label: string;
  description: string;
}[] = [
  {
    value: 'gemini',
    label: 'MiMo V2 Flash (Free)',
    description: 'OpenRouter MiMo V2 Flash · $0',
  },
  {
    value: 'glm',
    label: 'GLM 4.5 Air (Free)',
    description: 'OpenRouter GLM 4.5 Air · $0',
  },
];

export const DEFAULT_ARTICLE_CONTENT =
  "In an era where digital presence is paramount, small and medium-sized businesses (SMBs) are increasingly turning to Artificial Intelligence (AI) to gain a competitive edge. AI-powered marketing tools, once the exclusive domain of large corporations with deep pockets, are now more accessible than ever. These tools offer sophisticated capabilities—from hyper-personalized customer communication and predictive analytics to automated content creation and dynamic ad optimization. By leveraging AI, SMBs can not only streamline their marketing operations but also uncover deep insights into customer behavior, allowing them to craft more effective and targeted campaigns. This technological shift is leveling the playing field, enabling smaller players to compete more effectively and achieve significant growth in a crowded marketplace.";
