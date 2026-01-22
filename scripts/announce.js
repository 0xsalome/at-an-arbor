const fs = require('fs');
const path = require('path');

// Get message from command line arguments
const message = process.argv[2];

if (!message) {
  console.error('Error: Please provide a message.');
  console.error('Usage: npm run announce "Your announcement message"');
  process.exit(1);
}

const announcementsPath = path.join(__dirname, '../public/announcements.json');

// Helper to format date as YYYY-MM-DD
const getFormattedDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Helper to format date as MM-DD for display
const getDisplayDate = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
};

try {
  // Read existing file
  let announcements = [];
  if (fs.existsSync(announcementsPath)) {
    const fileContent = fs.readFileSync(announcementsPath, 'utf-8');
    announcements = JSON.parse(fileContent);
  }

  const now = new Date();
  const dateStr = getFormattedDate(now);
  const displayDate = getDisplayDate(now);
  
  // Create new announcement
  const newAnnouncement = {
    id: `${dateStr.replace(/-/g, '')}-${Date.now()}`, // Unique ID
    date: dateStr,
    text: `${displayDate} ${message}` // Automatically prepend MM-DD
  };

  // Add to beginning of array
  announcements.unshift(newAnnouncement);

  // Limit history (optional, keep last 50 items to be safe, UI only shows 7)
  if (announcements.length > 50) {
    announcements = announcements.slice(0, 50);
  }

  // Write back to file
  fs.writeFileSync(announcementsPath, JSON.stringify(announcements, null, 2));

  console.log(`✅ Announcement added: "${newAnnouncement.text}"`);

} catch (error) {
  console.error('Failed to update announcements:', error);
  process.exit(1);
}
