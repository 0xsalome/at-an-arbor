import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(PROJECT_ROOT, 'content/blog');
const ANNOUNCEMENTS_PATH = path.join(PROJECT_ROOT, 'public/announcements.json');

// Helper to format date as MM-DD
const getDisplayDate = (date) => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${month}-${day}`;
};

try {
  // 1. Read existing announcements
  let announcements = [];
  if (fs.existsSync(ANNOUNCEMENTS_PATH)) {
    announcements = JSON.parse(fs.readFileSync(ANNOUNCEMENTS_PATH, 'utf-8'));
  }

  // 2. Read all blog posts
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
  const newAnnouncements = [];

  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContent);
    
    if (!data.date || data.unlisted === true) continue;

    const slug = file.replace('.md', '');
    const isEssay = data.tags && data.tags.includes('essay');
    const typeLabel = isEssay ? 'エッセイ' : 'ブログ';
    
    // Create a unique marker for this article announcement
    // Format: "MM-DD [Type] Title"
    const displayDate = getDisplayDate(data.date);
    const announcementText = `${displayDate} ${typeLabel}を更新しました：${data.title}`;
    
    // Check if this article is already announced
    // We search the entire announcement history for the article title
    const alreadyAnnounced = announcements.some(a => a.text.includes(data.title));

    if (!alreadyAnnounced) {
      newAnnouncements.push({
        id: `auto-${slug}-${data.date}`,
        date: new Date(data.date).toISOString().split('T')[0],
        text: announcementText,
        path: `/blog/${slug}` // Add link path
      });
    }
  }

  // 3. If there are new posts, add them to announcements
  if (newAnnouncements.length > 0) {
    // Sort new ones by date descending
    newAnnouncements.sort((a, b) => b.date.localeCompare(a.date));
    
    // Add to the top
    const updatedAnnouncements = [...newAnnouncements, ...announcements].slice(0, 50);
    fs.writeFileSync(ANNOUNCEMENTS_PATH, JSON.stringify(updatedAnnouncements, null, 2));
    
    newAnnouncements.forEach(a => {
      console.log(`✨ Auto-announced: ${a.text}`);
    });
  }

} catch (error) {
  console.error('Failed to auto-announce:', error);
}
