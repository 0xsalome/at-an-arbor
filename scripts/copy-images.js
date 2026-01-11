import fs from 'fs';
import path from 'path';

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

CONTENT_DIRS.forEach(type => {
  const typeDir = path.join(CONTENT_ROOT, type);
  const targetDir = path.join(TARGET_BASE_DIR, type);

  // Ensure target type directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 1. Copy files from standard location content/{type}/images/
  // This preserves existing behavior
  const sourceImagesDir = path.join(typeDir, 'images');
  if (fs.existsSync(sourceImagesDir)) {
    const files = fs.readdirSync(sourceImagesDir);
    let standardCopyCount = 0;
    files.forEach(file => {
      if (file.startsWith('.')) return;
      
      const srcPath = path.join(sourceImagesDir, file);
      const destPath = path.join(targetDir, file);
      
      // Only copy if it's a file
      if (fs.statSync(srcPath).isFile()) {
        fs.copyFileSync(srcPath, destPath);
        standardCopyCount++;
      }
    });
    if (standardCopyCount > 0) {
       // console.log(`Copied ${standardCopyCount} images from ${type}/images/`);
    }
  }

  // 2. Scan markdown files for referenced images that might be elsewhere
  if (fs.existsSync(typeDir)) {
    const files = fs.readdirSync(typeDir);
    let scannedCopyCount = 0;

    files.forEach(file => {
      if (!file.endsWith('.md')) return;
      
      const content = fs.readFileSync(path.join(typeDir, file), 'utf-8');
      const images = extractImages(content);

      images.forEach(imageName => {
        const destPath = path.join(targetDir, imageName);
        
        // If file already exists in target, we might skip or overwrite.
        // For performance, we could skip. But to ensure updates, we overwrite 
        // if the source is found.
        
        const sourcePath = findImageFile(imageName, type);
        
        if (sourcePath) {
            // Check if it's different or just copy
            try {
                fs.copyFileSync(sourcePath, destPath);
                scannedCopyCount++;
            } catch (e) {
                console.error(`Failed to copy ${imageName}: ${e.message}`);
            }
        }
      });
    });

    if (scannedCopyCount > 0) {
      console.log(`Synced ${scannedCopyCount} referenced images for ${type} (from scan)`);
    }
  }
});