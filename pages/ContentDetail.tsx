import React, { useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getContentBySlug, POEMS } from '../lib/content';
import Nav from '../components/Nav';
import FadeIn from '../components/FadeIn';
import type { ContentType, ContentItem } from '../types';

interface ContentDetailProps {
  type: ContentType;
}

// 詩の単独セクションコンポーネント
const PoemSection: React.FC<{ poem: ContentItem; onScrollReady?: (el: HTMLElement) => void }> = ({ poem, onScrollReady }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // スマホ用：横スクロールを右端に
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
    if (onScrollReady && sectionRef.current) {
      onScrollReady(sectionRef.current);
    }
  }, [onScrollReady]);

  return (
    <section ref={sectionRef} className="h-screen w-full snap-start flex flex-col relative">
      <main ref={scrollContainerRef} className="flex-1 w-full overflow-x-auto overflow-y-hidden md:overflow-hidden md:flex md:items-center md:justify-center p-8 pt-20 md:p-16">
        <FadeIn className="h-[78%] md:h-full md:max-h-[80vh] w-max md:w-full md:max-w-4xl flex justify-start md:justify-center">
          <div className="writing-vertical h-full text-right select-none pr-8 md:pr-0">
            <div className="ml-8 md:ml-16 flex flex-col gap-4 text-xs font-mono text-gray-500 tracking-widest border-l border-gray-700 pl-2">
              <span>{poem.updated}</span>
              {poem.date && <span>{poem.date}</span>}
              <span>POEM</span>
            </div>
            <h1 className="text-3xl md:text-6xl font-serif font-bold ml-8 md:ml-24 leading-normal">
              {poem.title}
            </h1>
            <div
              className="text-base md:text-xl font-serif leading-loose md:leading-[2.5] tracking-widest ml-4 text-gray-300"
              dangerouslySetInnerHTML={{ __html: poem.content }}
            />
          </div>
        </FadeIn>
      </main>
    </section>
  );
};

const ContentDetail: React.FC<ContentDetailProps> = ({ type }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const item = slug ? getContentBySlug(slug, type) : undefined;
  const containerRef = useRef<HTMLDivElement>(null);
  const currentPoemIndex = POEMS.findIndex(p => p.slug === slug);

  // 詩ページで選択された詩にスクロール
  useEffect(() => {
    if (type === 'poem' && containerRef.current && currentPoemIndex >= 0) {
      const targetSection = containerRef.current.children[currentPoemIndex] as HTMLElement;
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'auto' });
      }
    }
  }, [type, currentPoemIndex]);

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

  // Poem layout (dark, vertical writing) - 全詩を縦スクロールで表示
  if (type === 'poem') {
    return (
      <div className="h-screen w-full bg-ink-black text-text-inv overflow-hidden relative">
        <div className="absolute top-0 left-0 p-6 md:p-12 z-10 opacity-50 hover:opacity-100 transition-opacity">
          <div className="invert filter">
            <Nav showDarkModeToggle />
          </div>
        </div>

        <div
          ref={containerRef}
          className="h-full w-full overflow-y-scroll snap-y snap-mandatory"
        >
          {POEMS.map((poem) => (
            <PoemSection key={poem.slug} poem={poem} />
          ))}
        </div>

        <button
          onClick={() => navigate('/')}
          className="absolute bottom-8 right-8 text-xs font-mono text-gray-600 hover:text-white transition-colors z-10"
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
