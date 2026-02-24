import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { ContentItem, ContentType } from '../types';

// Simple frontmatter parser (no Node.js dependencies)
function parseFrontmatter(raw: string): { data: Record<string, any>; content: string } {
  const lines = raw.split('\n');
  const data: Record<string, any> = {};
  let contentStart = 0;
  let inTagsArray = false;
  const tagsArray: string[] = [];

  if (lines[0]?.trim() === '---') {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i]?.trim() === '---') {
        contentStart = i + 1;
        break;
      }
      const line = lines[i];
      const trimmedLine = line?.trim();

      // Handle YAML array items (  - value)
      if (inTagsArray) {
        const arrayItemMatch = trimmedLine?.match(/^-\s*(.+)$/);
        if (arrayItemMatch && line?.startsWith('  ')) {
          tagsArray.push(arrayItemMatch[1].replace(/['"]/g, '').trim());
          continue;
        } else {
          // End of tags array
          inTagsArray = false;
          data['tags'] = tagsArray;
        }
      }

      // Handle tags array start: tags:
      if (trimmedLine === 'tags:') {
        inTagsArray = true;
        continue;
      }

      // Handle inline tags array: tags: [blog, essay]
      const tagsMatch = trimmedLine?.match(/^tags:\s*\[(.*?)\]/);
      if (tagsMatch) {
        data['tags'] = tagsMatch[1].split(',').map(t => t.trim().replace(/['"]/g, ''));
        continue;
      }

      // Handle standard key-value
      const match = trimmedLine?.match(/^(\w+):\s*"?([^"]*)"?$/);
      if (match) {
        data[match[1]] = match[2].trim();
      }
    }

    // Handle case where tags array is at the end of frontmatter
    if (inTagsArray && tagsArray.length > 0) {
      data['tags'] = tagsArray;
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

const momentFiles = import.meta.glob('../content/moments/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

// Configure marked renderer for lazy loading
const renderer = new marked.Renderer();
const VIDEO_EXT_REGEX = /\.(mp4|mov|webm|m4v|ogg)(\?.*)?$/i;

function isVideoPath(href: string): boolean {
  return VIDEO_EXT_REGEX.test(href);
}

renderer.image = ({ href, title, text }) => {
  if (isVideoPath(href)) {
    const safeTitle = title || '';
    const safeLabel = text || '';
    return `<video src="${href}" title="${safeTitle}" aria-label="${safeLabel}" class="lazy-load" controls playsinline preload="metadata"></video>`;
  }
  return `<img src="${href}" alt="${text || ''}" title="${title || ''}" class="lazy-load" loading="lazy" decoding="async" />`;
};
renderer.link = ({ href, title, text }) => {
  const isExternal = href.startsWith('http') && !href.includes('0xsalome.github.io/at-an-arbor');
  const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a href="${href}" title="${title || ''}"${targetAttr}>${text}</a>`;
};

// Helper to safely format date
function safeFormatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  // Return original string to preserve local time (avoid UTC conversion)
  return dateStr;
}

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
  } else if (type === 'moment') {
    // For moments: first paragraph converted to HTML (inline) to preserve links
    const firstParagraph = content.trim().split('\n\n')[0] || '';
    // Remove Obsidian wiki-link images from excerpt
    const textWithoutImages = firstParagraph.replace(/!\[\[.*?\]\]/g, '').trim();
    // Parse inline to avoid wrapping in <p> tags, allowing usage inside <p> in Home.tsx
    excerpt = DOMPurify.sanitize(marked.parseInline(textWithoutImages, { renderer, breaks: true }) as string, {
        ADD_ATTR: ['target', 'rel'], // Allow target and rel attributes for links
    });
  } else {
    // For blog: first paragraph (remove image references) - Plain Text
    const firstParagraph = content.trim().split('\n\n')[0] || '';
    // Remove Obsidian wiki-link images from excerpt
    const excerptWithoutImages = firstParagraph.replace(/!\[\[.*?\]\]/g, '').trim();
    excerpt = excerptWithoutImages.slice(0, 100) + (excerptWithoutImages.length > 100 ? '...' : '');
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

  // Convert [[slug]] to internal links (blog only)
  if (type === 'blog') {
    const articleLinkRegex = /(?<!!)(\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\])/g;
    content = content.replace(articleLinkRegex, (match, fullMatch, slug, displayText) => {
      const text = displayText || slug;
      return `[${text}](/at-an-arbor/blog/${slug})`;
    });
  }

  // Extract images from markdown
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  const images: string[] = [];
  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    images.push(match[1]);
  }

  const renderedContent = type === 'poem'
    // Preserve original line breaks by rendering line-by-line.
    ? content.split('\n').map(line => marked.parseInline(line, { renderer }) as string).join('<br>')
    : marked.parse(content, { renderer, breaks: true }) as string;

  return {
    slug,
    title: data.title || slug,
    date: safeFormatDate(data.date),
    updated: safeFormatDate(data.updated) || safeFormatDate(data.date),
    type,
    excerpt,
    content: DOMPurify.sanitize(renderedContent, {
      ADD_TAGS: ['video'],
      ADD_ATTR: ['loading', 'decoding', 'class', 'target', 'rel', 'controls', 'playsinline', 'preload', 'aria-label'],
    }),
    rawContent: content,
    images: images.length > 0 ? images : undefined,
    unlisted: data.unlisted === 'true' || data.unlisted === true,
    tags: data.tags,
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
    if (a.updated > b.updated) return -1;
    if (a.updated < b.updated) return 1;
    return 0;
  });
}

// Export sorted content
export const BLOG_POSTS = sortByUpdated(allBlogPosts).filter(item => !item.unlisted);
export const POEMS = sortByUpdated(allPoems);
export const MOMENTS = sortByUpdated(allMoments);

// Combined blog + moments for left column (sorted by updated)
export const LEFT_COLUMN_CONTENT = sortByUpdated([...allBlogPosts, ...allMoments])
  .filter(item => !item.unlisted);

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
