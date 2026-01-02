import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Nav: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="flex flex-col gap-6 text-xl md:text-2xl font-serif text-text-main select-none">
      <Link to="/profile" className="hover:opacity-60 transition-opacity cursor-pointer p-2" aria-label="Profile">
        ∴
      </Link>
      <Link to="/blog" className="hover:opacity-60 transition-opacity cursor-pointer p-2" aria-label="Blog">
        ∵
      </Link>
      <Link to="/moments" className="hover:opacity-60 transition-opacity cursor-pointer p-2" aria-label="Moments">
        ⁂
      </Link>
      <Link to="/poems" className="hover:opacity-60 transition-opacity cursor-pointer p-2" aria-label="Poems">
        ∴
      </Link>
      {!isHome && (
         <Link to="/" className="mt-8 text-sm font-mono hover:underline" aria-label="Home">
           [HOME]
         </Link>
      )}
    </nav>
  );
};

export default Nav;