import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://0xsalome.github.io/at-an-arbor';
const SITE_TITLE = 'at an arbor';
const SITE_DESCRIPTION = 'digital garden';

// Simple frontmatter parser
function parseFrontmatter(content) {
  const lines = content.split('\n');
  const data = {};
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

// Read markdown files from a directory
function readMarkdownFiles(dir, type) {
  const fullPath = path.join(process.cwd(), 'content', dir);
  if (!fs.existsSync(fullPath)) return [];

  const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.md'));

  return files.map(file => {
    const content = fs.readFileSync(path.join(fullPath, file), 'utf-8');
    const { data, content: body } = parseFrontmatter(content);
    const slug = file.replace('.md', '');

    // Skip unlisted items
    if (data.unlisted === 'true' || data.unlisted === true) {
      return null;
    }

    // Get excerpt
    const firstParagraph = body.trim().split('\n\n')[0] || '';
    const excerpt = firstParagraph.slice(0, 200).replace(/\n/g, ' ');

    // URL mapping based on type
    const urlMap = {
      blog: `${SITE_URL}/blog/${slug}`,
      poem: `${SITE_URL}/poems/${slug}`,
      moment: `${SITE_URL}/moments/${slug}`,
    };

    return {
      title: data.title || slug,
      date: data.updated || data.date || '',
      slug,
      type,
      excerpt,
      url: urlMap[type] || `${SITE_URL}/#/${type}/${slug}`
    };
  }).filter(item => item !== null);
}

// Escape XML special characters
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Generate RSS XML
function generateRss(items) {
  const sortedItems = items.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const itemsXml = sortedItems.slice(0, 20).map(item => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.url}</link>
      <guid>${item.url}</guid>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <description>${escapeXml(item.excerpt)}</description>
      <category>${item.type}</category>
    </item>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ja</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${itemsXml}
  </channel>
</rss>`;
}

// Main
const blogPosts = readMarkdownFiles('blog', 'blog');
const poems = readMarkdownFiles('poem', 'poem');
const moments = readMarkdownFiles('moments', 'moment');
const allItems = [...blogPosts, ...poems, ...moments];

const rss = generateRss(allItems);

// Write to public directory
const outputPath = path.join(process.cwd(), 'public', 'rss.xml');
fs.writeFileSync(outputPath, rss);

console.log(`RSS feed generated: ${outputPath}`);
console.log(`Total items: ${allItems.length}`);
