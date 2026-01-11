import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://0xsalome.github.io/at-an-arbor';

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

  return { data };
}

// Read markdown files from a directory
function readMarkdownFiles(dir, type) {
  const fullPath = path.join(process.cwd(), 'content', dir);
  if (!fs.existsSync(fullPath)) return [];

  const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.md'));

  return files.map(file => {
    const content = fs.readFileSync(path.join(fullPath, file), 'utf-8');
    const { data } = parseFrontmatter(content);
    const slug = file.replace('.md', '');
    const lastmod = data.updated || data.date || '';

    // URL mapping based on type
    const urlMap = {
      blog: `${SITE_URL}/#/blog/${slug}`,
      poem: `${SITE_URL}/#/poems/${slug}`,
      moment: `${SITE_URL}/#/moments/${slug}`,
    };

    return {
      url: urlMap[type],
      lastmod,
    };
  });
}

// Generate sitemap XML
function generateSitemap(items) {
  const urlsXml = items
    .filter(item => item.lastmod) // Only include items with dates
    .map(item => `
  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
  </url>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
  </url>
  <url>
    <loc>${SITE_URL}/#/blog</loc>
  </url>
  <url>
    <loc>${SITE_URL}/#/poems</loc>
  </url>
  <url>
    <loc>${SITE_URL}/#/moments</loc>
  </url>
  <url>
    <loc>${SITE_URL}/#/compost</loc>
  </url>${urlsXml}
</urlset>`;
}

// Main
const blogPosts = readMarkdownFiles('blog', 'blog');
const poems = readMarkdownFiles('poem', 'poem');
const moments = readMarkdownFiles('moments', 'moment');
const allItems = [...blogPosts, ...poems, ...moments];

const sitemap = generateSitemap(allItems);

// Write to public directory
const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
fs.writeFileSync(outputPath, sitemap);

console.log(`Sitemap generated: ${outputPath}`);
console.log(`Total URLs: ${allItems.length + 5}`); // +5 for static pages
