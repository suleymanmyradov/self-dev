export type ArticleCategory = 'philosophy' | 'habits' | 'relationships' | 'productivity';

export type Article = {
  id: string;
  title: string;
  excerpt: string;
  content: string; // full article body
  image?: string;
  category: ArticleCategory;
  postedAt: string; // e.g., "2025-09-24" or relative like "11h"
  likes: number;
  shares: number;
  saves: number;
};

export const articles: ReadonlyArray<Article> = [
  {
    id: '1',
    title: 'An update on the 2015 AI graph',
    excerpt:
      'Seems like a good time for an update on a graph from my 2015 post on AI.',
    content:
      'Seems like a good time for an update on a graph from my 2015 post on AI. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer id sem quis mi consequat efficitur. Sed vitae lectus ac nibh luctus posuere. Vivamus porttitor, augue a tempor posuere, neque mi posuere turpis, nec imperdiet sem ante nec arcu.\n\nCurabitur nec libero a erat pretium pharetra. Cras quis laoreet lorem. Duis placerat libero id purus volutpat, vel iaculis arcu vehicula.',
    image: '/placeholder.svg?height=300&width=500',
    category: 'philosophy',
    postedAt: '11h',
    likes: 245,
    shares: 78,
    saves: 12,
  },
  {
    id: '2',
    title: 'Fixed vs Growth: Approaching challenges',
    excerpt:
      'The difference between a fixed mindset and a growth mindset is how you approach challenges and view failure. Embrace the journey!',
    content:
      'The difference between a fixed mindset and a growth mindset is how you approach challenges and view failure. Embrace the journey! Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.\n\nSuspendisse potenti. Morbi tristique elementum metus, ut pharetra justo posuere a. Integer fermentum maximus purus, in mollis mi egestas id.',
    image: '/placeholder.svg?height=800 0&width=500',
    category: 'habits',
    postedAt: '3h',
    likes: 189,
    shares: 56,
    saves: 7,
  },
  {
    id: '3',
    title: 'Compounding habits: 1% better each day',
    excerpt:
      "Small habits compound over time. 1% better every day means you'll be 37 times better by the end of the year.",
    content:
      "Small habits compound over time. 1% better every day means you'll be 37 times better by the end of the year. Aliquam erat volutpat. Donec vel diam eget velit hendrerit dictum at a arcu.",
    category: 'productivity',
    postedAt: '5h',
    likes: 312,
    shares: 98,
    saves: 21,
  },
  {
    id: '4',
    title: 'Assume positive intent first',
    excerpt:
      'Assume positive intent first. Most conflicts are miscommunications, not malice.',
    content:
      'Assume positive intent first. Most conflicts are miscommunications, not malice. Quisque ullamcorper, enim in laoreet posuere, libero arcu interdum tellus, sed condimentum arcu lorem et tortor.',
    category: 'relationships',
    postedAt: '8h',
    likes: 98,
    shares: 21,
    saves: 3,
  },
];

export function getArticleById(id: string): Article | undefined {
  return articles.find((a) => a.id === id);
}
