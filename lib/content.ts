import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { ContentItem, ContentType } from '../types';

// Simple frontmatter parser (no Node.js dependencies)
function parseFrontmatter(raw: string): { data: Record<string, string>; content: string } {
  const lines = raw.split('\n');
  const data: Record<string, string> = {};
  let contentStart = 0;

  if (lines[0]?.trim() === '---') {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i]?.trim() === '---') {
        contentStart = i + 1;
        break;
      }
      const match = lines[i]?.match(/^(\w+):\s*"?([^"]*)"?$/);
      if (match) {
        data[match[1]] = match[2];
      }
    }
  }

  return { data, content: lines.slice(contentStart).join('\n') };
}

// Import all markdown files at build time
const blogFiles = import.meta.glob('../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const poemFiles = import.meta.glob('../content/poem/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const momentFiles = import.meta.glob('../content/moments/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

// Configure marked renderer for lazy loading
const renderer = new marked.Renderer();
renderer.image = ({ href, title, text }) => {
  return `<img src="${href}" alt="${text || ''}" title="${title || ''}" class="lazy-load" loading="lazy" decoding="async" />`;
};

function parseMarkdownFile(
  filePath: string,
  rawContent: string,
  type: ContentType
): ContentItem {
  const { data, content: rawBody } = parseFrontmatter(rawContent);
  let content = rawBody;
  const slug = filePath.split('/').pop()?.replace('.md', '') || '';

  // Extract excerpt based on type
  let excerpt: string;
  if (type === 'poem') {
    // For poems: first 2 non-empty lines + "："
    const lines = content.trim().split('\n').filter(l => l.trim());
    const firstTwoLines = lines.slice(0, 2).join('\n');
    excerpt = firstTwoLines + (lines.length > 2 ? '：' : '');
  } else {
    // For blog/moments: first paragraph
    const firstParagraph = content.trim().split('\n\n')[0] || '';
    excerpt = firstParagraph.slice(0, 100) + (firstParagraph.length > 100 ? '...' : '');
  }

  // Convert Obsidian wiki links to standard markdown images
  const wikiLinkRegex = /!\[\[(.*?)\]\]/g;
  content = content.replace(wikiLinkRegex, (match, filename) => {
    const name = filename.trim();
    const folderName = type === 'moment' ? 'moments' : type;
    // URL encode the filename to handle spaces and other special characters
    const encodedName = encodeURIComponent(name);
    // Use empty alt text to avoid displaying the filename as text
    return `![](/at-an-arbor/images/${folderName}/${encodedName})`;
  });

  // Extract images from markdown
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  const images: string[] = [];
  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    images.push(match[1]);
  }

  return {
    slug,
    title: data.title || slug,
    date: data.date || '',
    updated: data.updated || data.date || '',
    type,
    excerpt,
    content: DOMPurify.sanitize(marked.parse(content, { renderer, breaks: true }) as string, {
      ADD_ATTR: ['loading', 'decoding', 'class'],
    }),
    rawContent: content,
    images: images.length > 0 ? images : undefined,
  };
}

function parseFiles(
  files: Record<string, string>,
  type: ContentType
): ContentItem[] {
  return Object.entries(files).map(([path, content]) =>
    parseMarkdownFile(path, content, type)
  );
}

// Parse all content
const allBlogPosts = parseFiles(blogFiles, 'blog');
const allPoems = parseFiles(poemFiles, 'poem');
const allMoments = parseFiles(momentFiles, 'moment');

// Sort by updated date (newest first)
function sortByUpdated(items: ContentItem[]): ContentItem[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.updated).getTime();
    const dateB = new Date(b.updated).getTime();
    return dateB - dateA;
  });
}

// Export sorted content
export const BLOG_POSTS = sortByUpdated(allBlogPosts);
export const POEMS = sortByUpdated(allPoems);
export const MOMENTS = sortByUpdated(allMoments);

// Combined blog + moments for left column (sorted by updated)
export const LEFT_COLUMN_CONTENT = sortByUpdated([...allBlogPosts, ...allMoments]);

// Get single item by slug and type
export function getContentBySlug(
  slug: string,
  type: ContentType
): ContentItem | undefined {
  const sources = {
    blog: allBlogPosts,
    poem: allPoems,
    moment: allMoments,
  };
  return sources[type].find(item => item.slug === slug);
}

// Get all content of a specific type
export function getContentByType(type: ContentType): ContentItem[] {
  const sources = {
    blog: BLOG_POSTS,
    poem: POEMS,
    moment: MOMENTS,
  };
  return sources[type];
}
