import React from 'react';
import Nav from '../components/Nav';
import FadeIn from '../components/FadeIn';
import { BLOG_POSTS, POEMS, MOMENTS } from '../lib/content';
import { Link } from 'react-router-dom';
import CompostCanvas from '../components/CompostCanvas';
import { useImageLoader } from '../hooks/useImageLoader';

interface SimplePageProps {
  type: 'compost' | 'blog-list' | 'poem-list' | 'moment-list';
}

const SimplePage: React.FC<SimplePageProps> = ({ type }) => {
  useImageLoader([type]); // Re-run when page type changes

  const mainClasses = type === 'compost' 
    ? "w-full md:w-5/6 p-6 md:p-16 lg:p-24" // Compost: フル幅（制限なし）、パディングあり
    : type === 'moment-list'
      ? "w-full md:w-5/6 px-4 py-6 md:px-8 md:py-10 lg:px-10 lg:py-12 max-w-2xl"
      : "w-full md:w-5/6 p-6 md:p-16 lg:p-24 max-w-3xl"; // 通常: 幅制限あり

  return (
    <div className="min-h-screen bg-paper-white dark:bg-ink-black text-text-main dark:text-text-inv flex flex-col md:flex-row">
      <aside className="w-full md:w-1/6 p-6 md:p-12 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
        <Nav showDarkModeToggle />
      </aside>
      <main className={mainClasses}>
        <div className={type === 'compost' ? 'h-full' : ''}>
          {type === 'compost' && (
            <CompostCanvas />
          )}

          {type === 'blog-list' && (
            <>
              <h1 className="text-4xl font-mono font-bold mb-12">Blog Archive</h1>
              <ul className="space-y-8">
                {BLOG_POSTS.map(post => (
                  <li key={post.slug} className="group">
                    <a href={`/at-an-arbor/blog/${post.slug}`} className="block">
                      <div className="font-mono text-xs text-gray-500 mb-1">
                        {post.updated.slice(0, 10)}
                        {post.updated.slice(0, 10) !== post.date.slice(0, 10) && (
                          <span> / BLOG / ᚛ Regrown</span>
                        )}
                        {post.updated.slice(0, 10) === post.date.slice(0, 10) && (
                          <span> / BLOG</span>
                        )}
                      </div>
                      <h2 className="text-2xl font-serif font-bold group-hover:underline decoration-1 underline-offset-4">{post.title}</h2>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}

          {type === 'poem-list' && (
            <>
              <h1 className="text-4xl font-mono font-bold mb-12">Poetry Collection</h1>
              <div className="flex overflow-x-auto gap-4 pb-4 md:grid md:grid-cols-2 md:gap-8 md:overflow-visible snap-x snap-mandatory">
                {POEMS.map(poem => (
                  <Link to={`/poems/${poem.slug}`} key={poem.slug} className="flex-shrink-0 w-48 md:w-auto block p-8 bg-ink-black text-text-inv group hover:scale-[1.02] transition-transform duration-500 snap-start">
                     <div className="writing-vertical h-48 w-full">
                        <span className="font-mono text-xs text-gray-500 mb-4">{poem.updated.slice(0, 10)}</span>
                        <h2 className="text-xl font-serif font-bold border-l border-gray-600 pl-2 group-hover:border-white transition-colors">{poem.title}</h2>
                     </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {type === 'moment-list' && (
            <>
              <h1 className="text-4xl font-mono font-bold mb-6">Moments</h1>
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {MOMENTS.map(moment => (
                  <li key={moment.slug} className="group py-6 first:pt-0">
                    <div className="font-mono text-xs text-gray-400 mb-3 tracking-wide">
                      {moment.updated.slice(0, 16).replace('T', ' ')}
                      {moment.images && moment.images.length > 0 && (
                        <span className="ml-2">/ {moment.images.length}Photo</span>
                      )}
                    </div>
                    <div 
                      className="prose prose-sm md:prose-base prose-stone dark:prose-invert max-w-none font-serif leading-relaxed text-gray-800 dark:text-gray-200"
                      dangerouslySetInnerHTML={{ __html: moment.content }}
                    />
                    <div className="mt-4">
                      <Link to={`/moments/${moment.slug}`} className="text-[11px] font-mono text-gray-400 hover:text-text-main dark:hover:text-text-inv transition-colors tracking-wide">
                        [PERMALINK]
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
          
          {/* Debug/Fallback */}
          {!['compost', 'blog-list', 'poem-list', 'moment-list'].includes(type) && (
             <div className="text-red-500 font-mono p-4 border border-red-500">
               Unknown page type: {type}
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SimplePage;
