import fs from 'fs';
import path from 'path';

const CONTENT_DIRS = ['moments', 'blog', 'poem'];
const TARGET_BASE_DIR = path.join(process.cwd(), 'public', 'images');

if (!fs.existsSync(TARGET_BASE_DIR)) {
  fs.mkdirSync(TARGET_BASE_DIR, { recursive: true });
}

CONTENT_DIRS.forEach(type => {
  const sourceDir = path.join(process.cwd(), 'content', type, 'images');
  const targetDir = path.join(TARGET_BASE_DIR, type);

  if (!fs.existsSync(sourceDir)) return;

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const files = fs.readdirSync(sourceDir);
  let copyCount = 0;
  
  files.forEach(file => {
    if (file.startsWith('.')) return;

    const srcPath = path.join(sourceDir, file);
    const destPath = path.join(targetDir, file);

    fs.copyFileSync(srcPath, destPath);
    copyCount++;
  });

  if (copyCount > 0) {
    console.log(`Copied ${copyCount} images for ${type}`);
  }
});
