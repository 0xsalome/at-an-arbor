import React, { useEffect, useState } from 'react';

interface Announcement {
  id: string;
  date: string;
  text: string;
  link?: string;
  path?: string; // Add path support
}

const WhisperBar: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/at-an-arbor/announcements.json')
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a: Announcement, b: Announcement) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setAnnouncements(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load announcements:', err);
        setLoading(false);
      });
  }, []);

  if (loading || announcements.length === 0) return null;

  const latest = announcements[0];
  const history = announcements.slice(1, 8); // Max 7 past items

  const renderAnnouncementText = (item: Announcement) => {
    const targetPath = item.path || item.link;
    if (!targetPath) return <span>{item.text}</span>;

    return (
      <span className="flex items-center gap-2">
        {item.text}
        <a 
          href={`/at-an-arbor${targetPath}`}
          className="text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors ml-1"
          onClick={(e) => e.stopPropagation()} // Prevent history toggle
        >
          [→]
        </a>
      </span>
    );
  };

  return (
    <div 
      className="mb-6 font-mono text-xs select-none"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Latest Item (Trigger) */}
      <div 
        className="cursor-pointer hover:opacity-60 transition-opacity flex items-center gap-2 text-gray-700 dark:text-gray-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>᚛</span>
        {renderAnnouncementText(latest)}
      </div>

      {/* History (Scrollable) */}
      <div 
        className={`overflow-y-auto transition-all duration-500 ease-in-out scrollbar-hide ${isOpen ? 'max-h-24 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
      >
        <ul className="pl-4 space-y-1 border-l border-gray-200 dark:border-gray-800 ml-[5px]">
          {history.map((item) => (
            <li key={item.id} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              {renderAnnouncementText(item)}
            </li>
          ))}
          {history.length === 0 && (
            <li className="text-gray-400 dark:text-gray-500 opacity-30 italic">No history</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default WhisperBar;
