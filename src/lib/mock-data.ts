
import type { Headline, GeneratedContent } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const MOCK_HEADLINES: Headline[] = [
  {
    id: '1',
    slug: 'tech-trends-2025',
    title: 'Tech Trends 2025: What to Expect in AI, VR, and Quantum Computing',
    source: 'TechCrunch',
    date: '2024-07-20',
  },
  {
    id: '2',
    slug: 'crypto-market-update',
    title: 'Crypto Market Update: Bitcoin Halving Aftermath and Altcoin Season',
    source: 'CoinDesk',
    date: '2024-07-19',
  },
  {
    id: '3',
    slug: 'remote-work-productivity',
    title: 'The Future of Work: Boosting Productivity in Remote Teams',
    source: 'Harvard Business Review',
    date: '2024-07-18',
  },
  {
    id: '4',
    slug: 'sustainable-investing-growth',
    title: 'Sustainable Investing: A New Era of Financial Growth',
    source: 'Financial Times',
    date: '2024-07-17',
  },
  {
    id: '5',
    slug: '5g-revolution',
    title: 'The 5G Revolution: How It Will Change Your Life',
    source: 'Wired',
    date: '2024-07-16',
  },
  {
    id: '6',
    slug: 'space-tourism-takes-off',
    title: 'Space Tourism: The Final Frontier for Luxury Travel?',
    source: 'Bloomberg',
    date: '2024-07-15',
  },
  {
    id: '7',
    slug: 'data-privacy-concerns',
    title: 'Data Privacy in the Digital Age: Are We Losing Control?',
    source: 'The Verge',
    date: '2024-07-14',
  },
  {
    id: '8',
    slug: 'ecommerce-personalization',
    title: 'The Power of Personalization in E-commerce',
    source: 'Shopify Blog',
    date: '2024-07-13',
  },
  {
    id: '9',
    slug: 'mental-health-in-workplace',
    title: 'Prioritizing Mental Health in the Modern Workplace',
    source: 'Forbes',
    date: '2024-07-12',
  },
  {
    id: '10',
    slug: 'rise-of-creator-economy',
    title: 'The Creator Economy: How Influencers Are Building Empires',
    source: 'The New York Times',
    date: '2024-07-11',
  },
];

export const MOCK_DRAFTS = {
  blogPost: `
# Unpacking the Future: Tech Trends for 2025

The technology landscape is in a constant state of flux. As we look towards 2025, several key trends are poised to redefine industries and our daily lives. From the rapid advancements in Artificial Intelligence to the immersive worlds of Virtual Reality and the mind-bending potential of Quantum Computing, the next few years promise to be transformative.

## The AI Revolution Continues

AI is no longer a futuristic concept; it's a present-day reality. In 2025, expect to see:

-   **Hyper-Personalization**: AI algorithms will deliver experiences tailored to individual users with unprecedented accuracy.
-   **Generative AI in Business**: Beyond chatbots, generative AI will automate complex creative and analytical tasks.
-   **Ethical AI Frameworks**: A growing focus on developing and deploying AI responsibly.

## Virtual and Augmented Reality: A New Dimension

The metaverse is taking shape. VR and AR are set to become more mainstream, with applications beyond gaming:

-   **Collaborative Workspaces**: Virtual meeting rooms that are as interactive as physical ones.
-   **Enhanced Retail Experiences**: Try before you buy in augmented reality.
-   **Immersive Education**: Students can take virtual field trips to historical sites or distant planets.
    `,
  linkedInPost: `
🚀 Get ready for 2025! The tech world is accelerating with major shifts in AI, VR, and Quantum Computing.

Key takeaways:
- AI-driven hyper-personalization is the new standard.
- VR is moving from gaming to mainstream business collaboration.
- Quantum computing is on the brink of solving currently unsolvable problems.

What trend are you most excited about? #TechTrends #AI #FutureOfWork #Innovation #VR #QuantumComputing
    `,
  infographic: `https://picsum.photos/seed/infographic1/800/1200`,
};

export const MOCK_GENERATED_CONTENT: GeneratedContent[] = [
  {
    id: 'gen-1',
    date: new Date('2024-07-15T10:30:00Z'),
    headline: 'Crypto Market Update: Bitcoin Halving Aftermath and Altcoin Season',
    type: 'Content Pack',
    config: {
      brandTone: 'Professional',
      referenceImage: PlaceHolderImages.find(p => p.id === 'ref-2')?.imageUrl || PlaceHolderImages[0].imageUrl,
      userAngle: 'Focus on the impact for long-term investors.',
    },
    drafts: MOCK_DRAFTS,
  },
];
