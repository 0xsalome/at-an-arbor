import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface NavProps {
  showDarkModeToggle?: boolean;
}

const Nav: React.FC<NavProps> = ({ showDarkModeToggle = false }) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored === 'true') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    if (newValue) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  return (
    <nav className="flex flex-col gap-6 text-xl md:text-2xl font-serif text-text-main dark:text-text-inv select-none relative">
      {/* Hamburger Menu */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="hover:opacity-60 transition-opacity cursor-pointer p-2"
          aria-label="Menu"
        >
          ☰
        </button>
        {menuOpen && (
          <div className="absolute left-0 top-full mt-2 bg-paper-white dark:bg-ink-black border border-gray-200 dark:border-gray-700 shadow-lg z-50 min-w-48">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-mono text-sm"
            >
              ⁂ Home
            </Link>
            <Link
              to="/moments"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-mono text-sm"
            >
              ∵ Moments
            </Link>
            <Link
              to="/blog"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-mono text-sm"
            >
              ∴ Blog
            </Link>
            <Link
              to="/poems"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-mono text-sm"
            >
              ∵ Poems
            </Link>
            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-mono text-sm"
            >
              ○ Profile
            </Link>
          </div>
        )}
      </div>
      <Link to="/" className="hover:opacity-60 transition-opacity cursor-pointer p-2" aria-label="Home">
        ⁂
      </Link>
      <Link to="/moments" className="hover:opacity-60 transition-opacity cursor-pointer p-2" aria-label="Moments">
        ∵
      </Link>
      <Link to="/blog" className="hover:opacity-60 transition-opacity cursor-pointer p-2" aria-label="Blog">
        ∴
      </Link>
      <Link to="/poems" className="hover:opacity-60 transition-opacity cursor-pointer p-2" aria-label="Poems">
        ∵
      </Link>
      {showDarkModeToggle && (
        <button
          onClick={toggleDarkMode}
          className="hover:opacity-60 transition-opacity cursor-pointer p-2"
          aria-label="Toggle dark mode"
        >
          {isDark ? '○' : '●'}
        </button>
      )}
    </nav>
  );
};

export default Nav;