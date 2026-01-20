import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogDir = path.join(process.cwd(), 'content/blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));

console.log('Processing files in:', blogDir);

files.forEach(file => {
  const filepath = path.join(blogDir, file);
  const content = fs.readFileSync(filepath, 'utf-8');
  const parsed = matter(content);
  
  // タグが未設定の場合のみ追加
  if (!parsed.data.tags || parsed.data.tags.length === 0) {
    parsed.data.tags = ['blog']; // デフォルトはblog
    
    // matter.stringifyで書き戻すが、改行などを保持するために最低限の変更にする
    const updatedContent = matter.stringify(parsed.content, parsed.data);
    fs.writeFileSync(filepath, updatedContent, 'utf-8');
    console.log(`✅ ${file}: tags added`);
  } else {
    console.log(`⏭️  ${file}: tags already set`);
  }
});
