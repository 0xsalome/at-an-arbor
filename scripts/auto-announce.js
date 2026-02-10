import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(PROJECT_ROOT, 'content/blog');
const ANNOUNCEMENTS_PATH = path.join(PROJECT_ROOT, 'public/announcements.json');

// Helper to format date as MM-DD (local time to avoid timezone issues)
const getDisplayDate = (date) => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${month}-${day}`;
};

// Helper to get YYYY-MM-DD string (local time)
const toLocalDateString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

    const dateStr = toLocalDateString(data.date);
    const updatedStr = data.updated ? toLocalDateString(data.updated) : dateStr;
    const isUpdated = updatedStr > dateStr;

    // Use updated date for display if article was updated
    const displayDate = getDisplayDate(isUpdated ? data.updated : data.date);
    const actionText = isUpdated ? '更新' : '公開';
    const announcementText = `${displayDate} ${typeLabel}を${actionText}しました：${data.title}`;

    // Create unique ID based on the relevant date (updated or date)
    const announcementId = `auto-${slug}-${isUpdated ? updatedStr : dateStr}`;

    // Check if this specific version is already announced
    const alreadyAnnounced = announcements.some(a => a.id === announcementId);

    if (!alreadyAnnounced) {
      newAnnouncements.push({
        id: announcementId,
        date: isUpdated ? updatedStr : dateStr,
        text: announcementText,
        path: `/blog/${slug}`
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
