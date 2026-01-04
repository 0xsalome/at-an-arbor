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
    <nav className="flex flex-col gap-6 text-xl md:text-2xl font-serif text-text-main dark:text-text-inv select-none">
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