import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const CONTENT_ROOT = path.join(process.cwd(), 'content');
const CONTENT_DIRS = ['moments', 'blog', 'poem'];
const TARGET_BASE_DIR = path.join(process.cwd(), 'public', 'images');
const QUIET_MODE = process.argv.includes('--quiet');

// Ensure target base dir exists
if (!fs.existsSync(TARGET_BASE_DIR)) {
  fs.mkdirSync(TARGET_BASE_DIR, { recursive: true });
}

// Helper to find image file in potential locations
function findImageFile(filename, type) {
  // 1. Look in content/{type}/images/
  const typeDir = path.join(CONTENT_ROOT, type, 'images', filename);
  if (fs.existsSync(typeDir)) return typeDir;

  // 2. Look in content/ root (common if dropped in Obsidian root)
  const rootDir = path.join(CONTENT_ROOT, filename);
  if (fs.existsSync(rootDir)) return rootDir;

  // 3. Look in content/images/ (generic)
  const imagesDir = path.join(CONTENT_ROOT, 'images', filename);
  if (fs.existsSync(imagesDir)) return imagesDir;

  return null;
}

function collectMarkdownFiles(dir) {
  const result = [];
  if (!fs.existsSync(dir)) return result;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      result.push(...collectMarkdownFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      result.push(fullPath);
    }
  }

  return result;
}

// Helper to extract image references from markdown
function extractImages(content) {
  const images = new Set();
  
  // Match Obsidian wiki links: ![[filename]]
  const wikiRegex = /!\[\[(.*?)\]\]/g;
  let match;
  while ((match = wikiRegex.exec(content)) !== null) {
    images.add(match[1].trim());
  }

  // Match Markdown links: ![](filename) or ![](./filename)
  // We ignore absolute paths (starting with / or http)
  const mdRegex = /!\[.*?\]\((.*?)\)/g;
  while ((match = mdRegex.exec(content)) !== null) {
    const src = match[1];
    if (!src.startsWith('http') && !src.startsWith('/')) {
        // Extract filename from relative path
        images.add(path.basename(src));
    }
  }

  return Array.from(images);
}

// Optimized image processing function
async function processImage(srcPath, destPath) {
  try {
    // Check if destination exists
    if (fs.existsSync(destPath)) {
      const srcStat = fs.statSync(srcPath);
      const destStat = fs.statSync(destPath);
      // Skip if source hasn't changed (based on mtime)
      if (srcStat.mtime <= destStat.mtime) {
        return false; // Skipped
      }
    }

    const ext = path.extname(srcPath).toLowerCase();

    // Process only supported image formats (GIF and SVG are copied as-is)
    if (!['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) {
       fs.copyFileSync(srcPath, destPath);
       return true;
    }

    // Copy GIF and SVG without optimization
    if (['.gif', '.svg'].includes(ext)) {
       fs.copyFileSync(srcPath, destPath);
       return true;
    }

    // Apply EXIF orientation before resize/compress so portrait photos stay portrait.
    let pipeline = sharp(srcPath).rotate();
    const metadata = await pipeline.metadata();

    // Resize if width is larger than 1920px (Safe for 4K screens while reducing file size)
    if (metadata.width && metadata.width > 1920) {
      pipeline = pipeline.resize(1920, null, { withoutEnlargement: true });
    }

    // Compression settings - High quality to minimize artifacts
    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: 85, mozjpeg: true });
    } else if (ext === '.png') {
      // PNG optimization is slow, so we use slightly faster settings but still compress
      pipeline = pipeline.png({ quality: 90, compressionLevel: 7 }); 
    } else if (ext === '.webp') {
      pipeline = pipeline.webp({ quality: 85 });
    }

    await pipeline.toFile(destPath);
    return true; // Processed
  } catch (error) {
    console.error(`Error processing ${path.basename(srcPath)}:`, error);
    // Fallback to simple copy on error
    fs.copyFileSync(srcPath, destPath);
    return true;
  }
}

async function main() {
  for (const type of CONTENT_DIRS) {
    const typeDir = path.join(CONTENT_ROOT, type);
    const targetDir = path.join(TARGET_BASE_DIR, type);

    // Ensure target type directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    let processedCount = 0;

    // 1. Copy files from standard location content/{type}/images/
    const sourceImagesDir = path.join(typeDir, 'images');
    if (fs.existsSync(sourceImagesDir)) {
      const files = fs.readdirSync(sourceImagesDir);
      
      for (const file of files) {
        if (file.startsWith('.')) continue;
        
        const srcPath = path.join(sourceImagesDir, file);
        const destPath = path.join(targetDir, file);
        
        // Only copy if it's a file
        if (fs.statSync(srcPath).isFile()) {
          const processed = await processImage(srcPath, destPath);
          if (processed) processedCount++;
        }
      }
    }

    // 2. Scan markdown files for referenced images that might be elsewhere
    if (fs.existsSync(typeDir)) {
      const markdownFiles = collectMarkdownFiles(typeDir);

      for (const mdPath of markdownFiles) {
        const content = fs.readFileSync(mdPath, 'utf-8');
        const images = extractImages(content);

        for (const imageName of images) {
          const destPath = path.join(targetDir, imageName);
          const sourcePath = findImageFile(imageName, type);
          
          if (sourcePath) {
             const processed = await processImage(sourcePath, destPath);
             if (processed) processedCount++;
          }
        }
      }
    }
    
    if (!QUIET_MODE || processedCount > 0) {
      console.log(`Processed ${processedCount} image(s) for ${type}`);
    }
  }
}

function shouldTriggerCopy(filename = '') {
  if (!filename) return true;
  if (filename.endsWith('.md')) return true;
  return /\.(jpe?g|png|webp|gif|svg|heic|avif|mp4|mov|webm|m4v|ogg)$/i.test(filename);
}

function watchAndCopy() {
  const POLL_INTERVAL_MS = 2000;
  let running = false;
  let queued = false;
  let intervalId = null;

  const runCopy = async () => {
    if (running) {
      queued = true;
      return;
    }

    running = true;
    try {
      await main();
    } catch (error) {
      console.error(error);
    } finally {
      running = false;
      if (queued) {
        queued = false;
        void runCopy();
      }
    }
  };

  process.on('SIGINT', () => {
    if (intervalId) clearInterval(intervalId);
    process.exit(0);
  });

  console.log(`[watch] Image sync polling is active (${POLL_INTERVAL_MS}ms interval)`);
  void runCopy();
  intervalId = setInterval(() => {
    void runCopy();
  }, POLL_INTERVAL_MS);
}

if (process.argv.includes('--watch')) {
  watchAndCopy();
} else {
  main().catch(console.error);
}
