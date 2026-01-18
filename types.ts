export type ContentType = 'blog' | 'poem' | 'moment';

export interface ContentItem {
  slug: string;
  title: string;
  date: string;
  updated: string;
  type: ContentType;
  excerpt: string;
  content: string;       // HTML
  rawContent: string;    // Original Markdown
  images?: string[];
  unlisted?: boolean;
}

// Legacy types for backward compatibility during migration
export interface BlogPost extends Omit<ContentItem, 'rawContent' | 'images'> {
  type: 'blog';
}

export interface Poem extends Omit<ContentItem, 'rawContent' | 'images'> {
  type: 'poem';
}

export interface SectionPair {
  id: string;
  left?: ContentItem;  // blog or moment
  poem?: ContentItem;
}