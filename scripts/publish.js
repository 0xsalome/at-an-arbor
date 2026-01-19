#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const CONTENT_DIR = path.join(process.cwd(), 'content');

function showUsage() {
  console.log(`
Usage: npm run publish <source-file> <type>

Arguments:
  source-file  Path to the markdown file in your draft vault
  type         Content type: blog, poem, or moments

Example:
  npm run publish ~/drafts/my-post.md blog
  npm run publish ~/drafts/haiku.md poem
  npm run publish ~/drafts/today.md moments

This script will:
  1. Copy the markdown file to content/{type}/
  2. Find all ![[image]] wiki-links in the file
  3. Optimize and copy referenced images to content/{type}/images/
     - JPEG/PNG/WebP: Compressed with high quality (85-90%)
     - Large images: Resized to max 1920px width
     - GIF/SVG: Copied without modification
`);
}

function extractWikiLinkImages(content) {
  const regex = /!\[\[(.*?)\]\]/g;
  const images = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    images.push(match[1].trim());
  }
  return images;
}

// Optimized image processing function with compression
async function processImage(srcPath, destPath) {
  try {
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

    let pipeline = sharp(srcPath);
    const metadata = await pipeline.metadata();

    // Resize if width is larger than 1920px (Safe for 4K screens while reducing file size)
    if (metadata.width && metadata.width > 1920) {
      pipeline = pipeline.resize(1920, null, { withoutEnlargement: true });
    }

    // Compression settings - High quality to minimize artifacts
    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: 85, mozjpeg: true });
    } else if (ext === '.png') {
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

async function publish(sourcePath, type) {
  // Validate type
  const validTypes = ['blog', 'poem', 'moments'];
  if (!validTypes.includes(type)) {
    console.error(`Error: Invalid type "${type}". Must be one of: ${validTypes.join(', ')}`);
    process.exit(1);
  }

  // Resolve source path
  const resolvedSource = path.resolve(sourcePath);
  if (!fs.existsSync(resolvedSource)) {
    console.error(`Error: Source file not found: ${resolvedSource}`);
    process.exit(1);
  }

  const sourceDir = path.dirname(resolvedSource);
  const fileName = path.basename(resolvedSource);
  const content = fs.readFileSync(resolvedSource, 'utf-8');

  // Target paths
  const targetDir = path.join(CONTENT_DIR, type);
  const targetImagesDir = path.join(targetDir, 'images');
  const targetFile = path.join(targetDir, fileName);

  // Ensure directories exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  if (!fs.existsSync(targetImagesDir)) {
    fs.mkdirSync(targetImagesDir, { recursive: true });
  }

  // Convert Obsidian image syntax ![[image.png]] to Markdown ![](./images/image.png)
  let convertedContent = content;
  const imageRegex = /!\[\[(.*?)\]\]/g;
  convertedContent = convertedContent.replace(imageRegex, (match, imageName) => {
    return `![](./images/${imageName.trim()})`;
  });

  // Write converted markdown file
  fs.writeFileSync(targetFile, convertedContent, 'utf-8');
  console.log(`✓ Copied and converted: ${fileName} → content/${type}/`);

  // Find and copy images with compression
  const images = extractWikiLinkImages(content);
  let copiedImages = 0;

  for (const imageName of images) {
    // Look for image in the same directory as source file
    const imagePath = path.join(sourceDir, imageName);

    if (fs.existsSync(imagePath)) {
      const targetImagePath = path.join(targetImagesDir, imageName);
      const originalSize = fs.statSync(imagePath).size;

      await processImage(imagePath, targetImagePath);

      const compressedSize = fs.statSync(targetImagePath).size;
      const savedPercent = Math.round((1 - compressedSize / originalSize) * 100);

      console.log(`✓ Optimized: ${imageName} → content/${type}/images/ (${savedPercent}% smaller)`);
      copiedImages++;
    } else {
      console.warn(`⚠ Image not found: ${imageName} (looked in ${sourceDir})`);
    }
  }

  console.log(`\nDone! Copied 1 article and optimized ${copiedImages} image(s).`);

  if (images.length > copiedImages) {
    console.log(`\nNote: ${images.length - copiedImages} image(s) were referenced but not found.`);
    console.log('Make sure images are in the same folder as your markdown file.');
  }
}

// Main
const args = process.argv.slice(2);

if (args.length < 2 || args.includes('--help') || args.includes('-h')) {
  showUsage();
  process.exit(args.includes('--help') || args.includes('-h') ? 0 : 1);
}

const [sourcePath, type] = args;
publish(sourcePath, type).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
