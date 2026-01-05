import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getContentBySlug } from '../lib/content';
import Nav from '../components/Nav';
import FadeIn from '../components/FadeIn';
import type { ContentType } from '../types';

interface ContentDetailProps {
  type: ContentType;
}

const ContentDetail: React.FC<ContentDetailProps> = ({ type }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const item = slug ? getContentBySlug(slug, type) : undefined;

  if (!item) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-mono ${
        type === 'poem' ? 'bg-ink-black text-white' : 'bg-paper-white'
      }`}>
        <div className="text-center">
          <h1 className="text-4xl mb-4">404</h1>
          <p className="mb-8">Not found.</p>
          <button onClick={() => navigate('/')} className="underline">[RETURN]</button>
        </div>
      </div>
    );
  }

  // Poem layout (dark, vertical writing)
  if (type === 'poem') {
    return (
      <div className="h-screen w-full bg-ink-black text-text-inv overflow-hidden relative flex">
        <div className="absolute top-0 left-0 p-6 md:p-12 z-10 opacity-50 hover:opacity-100 transition-opacity">
          <div className="invert filter">
            <Nav showDarkModeToggle />
          </div>
        </div>

        <main className="w-full h-full flex items-center justify-center p-8 md:p-16">
          <FadeIn className="h-full max-h-[80vh] w-full max-w-4xl flex justify-center">
            <div className="writing-vertical h-full text-right select-none">
              <div className="ml-8 md:ml-16 flex flex-col gap-4 text-xs font-mono text-gray-500 tracking-widest border-l border-gray-700 pl-2">
                <span>{item.updated}</span>
                <span>POEM</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-serif font-bold ml-12 md:ml-24 leading-normal">
                {item.title}
              </h1>
              <div
                className="text-lg md:text-xl font-serif leading-loose tracking-widest ml-4 text-gray-300"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
            </div>
          </FadeIn>
        </main>

        <button
          onClick={() => navigate('/')}
          className="absolute bottom-8 right-8 text-xs font-mono text-gray-600 hover:text-white transition-colors"
        >
          [CLOSE]
        </button>
      </div>
    );
  }

  // Blog and Moment layout (light, horizontal)
  return (
    <div className="min-h-screen bg-paper-white dark:bg-ink-black text-text-main dark:text-text-inv flex flex-col md:flex-row">
      <aside className="w-full md:w-1/6 p-6 md:p-12 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
        <Nav showDarkModeToggle />
      </aside>

      <main className="w-full md:w-5/6 p-6 md:p-16 lg:p-24 max-w-4xl mx-auto">
        <FadeIn>
          <header className={`mb-12 ${type !== 'moment' ? 'border-b border-gray-900 dark:border-gray-600 pb-8' : ''}`}>
            <div className="font-mono text-sm text-gray-500 mb-4">
              {item.updated}
              <span className="mx-2">/</span>
              {type === 'moment' ? 'MOMENT' : 'BLOG'}
            </div>
            {type !== 'moment' && (
              <h1 className="text-3xl md:text-5xl font-serif font-bold leading-tight">{item.title}</h1>
            )}
          </header>

          <article
            className="prose prose-stone dark:prose-invert prose-lg font-serif leading-loose text-gray-800 dark:text-gray-200"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />

          <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 flex justify-between font-mono text-sm">
            <button onClick={() => navigate(-1)} className="hover:underline">← BACK</button>
            <span>END OF RECORD</span>
          </footer>
        </FadeIn>
      </main>
    </div>
  );
};

export default ContentDetail;
