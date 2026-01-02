export type ContentType = 'blog' | 'poem';

export interface BaseContent {
  slug: string;
  title: string;
  date: string;
  type: ContentType;
  excerpt: string;
  content: string; // Markdown-like string
}

export interface BlogPost extends BaseContent {
  type: 'blog';
}

export interface Poem extends BaseContent {
  type: 'poem';
}

export interface SectionPair {
  id: string;
  blog?: BlogPost;
  poem?: Poem;
}