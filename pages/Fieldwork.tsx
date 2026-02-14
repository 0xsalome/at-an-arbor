import React from 'react';
import { Link } from 'react-router-dom';

const Fieldwork: React.FC = () => {
  return (
    <div className="h-screen w-full flex flex-col bg-paper-white dark:bg-ink-black">
      {/* Header with back link */}
      <div className="flex-none px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <Link
          to="/"
          className="font-mono text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          ← back
        </Link>
      </div>

      {/* Embedded content */}
      <iframe
        src="https://ohanami-sable.vercel.app/"
        className="flex-grow w-full border-none"
        title="Fieldwork"
        allow="fullscreen"
      />
    </div>
  );
};

export default Fieldwork;
