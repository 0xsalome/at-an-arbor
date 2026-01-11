#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

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
  3. Copy referenced images to content/{type}/images/
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

function publish(sourcePath, type) {
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

  // Copy markdown file
  fs.copyFileSync(resolvedSource, targetFile);
  console.log(`✓ Copied: ${fileName} → content/${type}/`);

  // Find and copy images
  const images = extractWikiLinkImages(content);
  let copiedImages = 0;

  for (const imageName of images) {
    // Look for image in the same directory as source file
    const imagePath = path.join(sourceDir, imageName);
    
    if (fs.existsSync(imagePath)) {
      const targetImagePath = path.join(targetImagesDir, imageName);
      fs.copyFileSync(imagePath, targetImagePath);
      console.log(`✓ Copied: ${imageName} → content/${type}/images/`);
      copiedImages++;
    } else {
      console.warn(`⚠ Image not found: ${imageName} (looked in ${sourceDir})`);
    }
  }

  console.log(`\nDone! Copied 1 article and ${copiedImages} image(s).`);
  
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
publish(sourcePath, type);
