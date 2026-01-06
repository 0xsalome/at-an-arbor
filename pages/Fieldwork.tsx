import React from 'react';
import { Link } from 'react-router-dom';

const Fieldwork: React.FC = () => {
  return (
    <div className="min-h-screen bg-paper-white dark:bg-ink-black relative overflow-hidden">
      {/* Background contour image */}
      <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08] pointer-events-none dark:invert bg-contour-left" />
      <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">
        {/* Back link */}
        <Link
          to="/"
          className="inline-block mb-12 font-mono text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          ← back
        </Link>

        {/* Title */}
        <h1 className="font-serif text-3xl md:text-4xl text-text-main dark:text-text-inv mb-8">
          Fieldwork
        </h1>

        {/* Placeholder content */}
        <p className="font-serif text-gray-500 dark:text-gray-400">
          Coming soon...
        </p>
      </div>
    </div>
  );
};

export default Fieldwork;
