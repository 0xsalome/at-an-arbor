import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const CONTENT_ROOT = path.join(process.cwd(), 'content');
const CONTENT_DIRS = ['moments', 'blog', 'poem'];
const TARGET_BASE_DIR = path.join(process.cwd(), 'public', 'images');

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
      const files = fs.readdirSync(typeDir);
      
      for (const file of files) {
        if (!file.endsWith('.md')) continue;
        
        const content = fs.readFileSync(path.join(typeDir, file), 'utf-8');
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
    
    console.log(`Processed ${processedCount} image(s) for ${type}`);
  }
}

function shouldTriggerCopy(filename = '') {
  if (!filename) return true;
  if (filename.endsWith('.md')) return true;
  return /\.(jpe?g|png|webp|gif|svg|heic|avif)$/i.test(filename);
}

function watchAndCopy() {
  const watchTargets = [
    path.join(CONTENT_ROOT, 'blog'),
    path.join(CONTENT_ROOT, 'moments'),
    path.join(CONTENT_ROOT, 'poem'),
    path.join(CONTENT_ROOT, 'images'),
  ];

  const watchers = [];
  let timer = null;
  let running = false;
  let queued = false;

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

  const onChange = (filename) => {
    if (!shouldTriggerCopy(filename)) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      console.log(`[watch] Change detected: ${filename || '(unknown file)'}`);
      void runCopy();
    }, 200);
  };

  for (const target of watchTargets) {
    if (!fs.existsSync(target)) continue;

    try {
      watchers.push(fs.watch(target, { recursive: true }, (_eventType, filename) => onChange(filename)));
      console.log(`[watch] Watching ${target} (recursive)`);
    } catch {
      watchers.push(fs.watch(target, (_eventType, filename) => onChange(filename)));
      console.log(`[watch] Watching ${target}`);
    }
  }

  process.on('SIGINT', () => {
    watchers.forEach((watcher) => watcher.close());
    process.exit(0);
  });

  console.log('[watch] Image sync is active');
  void runCopy();
}

if (process.argv.includes('--watch')) {
  watchAndCopy();
} else {
  main().catch(console.error);
}
