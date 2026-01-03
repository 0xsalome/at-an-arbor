import React from 'react';
import { Link } from 'react-router-dom';

const Nav: React.FC = () => {

  return (
    <nav className="flex flex-col gap-6 text-xl md:text-2xl font-serif text-text-main select-none">
      <Link to="/" className="hover:opacity-60 transition-opacity cursor-pointer p-2" aria-label="at an arbor">
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
    </nav>
  );
};

export default Nav;