import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://0xsalome.github.io/at-an-arbor';
const SITE_NAME = 'at an arbor';
const DEFAULT_DESCRIPTION = 'digital garden';
const OGP_IMAGE_URL = `${SITE_URL}/images/ogp.png`;
const DIST_DIR = path.join(process.cwd(), 'dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');

function parseFrontmatter(raw) {
  const lines = raw.split('\n');
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
        data[match[1]] = match[2].trim();
      }
    }
  }

  return { data, body: lines.slice(contentStart).join('\n') };
}

function readContentItems(contentDir, routeBase, typeLabel) {
  const fullPath = path.join(process.cwd(), 'content', contentDir);
  if (!fs.existsSync(fullPath)) return [];

  return fs
    .readdirSync(fullPath)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(fullPath, file), 'utf-8');
      const { data, body } = parseFrontmatter(raw);
      if (data.unlisted === 'true' || data.unlisted === true) {
        return null;
      }

      const slug = file.replace(/\.md$/, '');
      const title = data.title || slug;
      const firstParagraph = (body.trim().split('\n\n')[0] || '')
        .replace(/!\[\[.*?\]\]/g, '')
        .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
      const description = firstParagraph || `${title} | ${SITE_NAME}`;

      return {
        route: `/${routeBase}/${slug}`,
        title: `${title} | ${typeLabel} | ${SITE_NAME}`,
        description,
        ogType: 'article',
      };
    })
    .filter(Boolean);
}

function setOrInsert(html, regex, tag) {
  if (regex.test(html)) {
    return html.replace(regex, tag);
  }
  return html.replace('</head>', `  ${tag}\n</head>`);
}

function escapeAttr(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildHtml(template, page) {
  const pageUrl = page.route === '/' ? `${SITE_URL}/` : `${SITE_URL}${page.route}`;
  const safeTitle = escapeAttr(page.title);
  const safeDescription = escapeAttr(page.description);

  let html = template;
  html = setOrInsert(html, /<title>[^<]*<\/title>/i, `<title>${safeTitle}</title>`);
  html = setOrInsert(html, /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${safeDescription}" />`);
  html = setOrInsert(html, /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${safeTitle}" />`);
  html = setOrInsert(html, /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${safeDescription}" />`);
  html = setOrInsert(html, /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="${page.ogType}" />`);
  html = setOrInsert(html, /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${pageUrl}" />`);
  html = setOrInsert(html, /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${OGP_IMAGE_URL}" />`);
  html = setOrInsert(html, /<meta\s+name="twitter:card"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:card" content="summary_large_image" />`);
  html = setOrInsert(html, /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${safeTitle}" />`);
  html = setOrInsert(html, /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${safeDescription}" />`);
  html = setOrInsert(html, /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${OGP_IMAGE_URL}" />`);
  return html;
}

function writeRoutePage(template, page) {
  const routeDir = page.route === '/' ? DIST_DIR : path.join(DIST_DIR, page.route.replace(/^\/+/, ''));
  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(path.join(routeDir, 'index.html'), buildHtml(template, page), 'utf-8');
}

function main() {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error(`Template not found: ${TEMPLATE_PATH}`);
    process.exit(1);
  }

  const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  const staticPages = [
    { route: '/blog', title: `Blog | ${SITE_NAME}`, description: 'ブログ一覧', ogType: 'website' },
    { route: '/poems', title: `Poems | ${SITE_NAME}`, description: '詩の一覧', ogType: 'website' },
    { route: '/moments', title: `Moments | ${SITE_NAME}`, description: '記録の一覧', ogType: 'website' },
    { route: '/compost', title: `Compost | ${SITE_NAME}`, description: DEFAULT_DESCRIPTION, ogType: 'website' },
    { route: '/underground', title: `Underground | ${SITE_NAME}`, description: DEFAULT_DESCRIPTION, ogType: 'website' },
    { route: '/fieldwork', title: `Fieldwork | ${SITE_NAME}`, description: DEFAULT_DESCRIPTION, ogType: 'website' },
  ];

  const poemPages = readContentItems('poem', 'poems', 'Poem');
  const momentPages = readContentItems('moments', 'moments', 'Moment');
  const allPages = [...staticPages, ...poemPages, ...momentPages];

  allPages.forEach((page) => writeRoutePage(template, page));
  console.log(`Generated SPA OGP pages: ${allPages.length}`);
}

main();
