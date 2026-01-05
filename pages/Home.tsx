import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BLOG_POSTS, MOMENTS, POEMS } from '../lib/content';
import FadeIn from '../components/FadeIn';
import Nav from '../components/Nav';
import type { ContentItem } from '../types';

const DarkModeToggle: React.FC = () => {
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
    <button
      onClick={toggleDarkMode}
      className="text-xl hover:opacity-60 transition-opacity cursor-pointer p-2"
      aria-label="Toggle dark mode"
    >
      {isDark ? '○' : '●'}
    </button>
  );
};

// Create pairs: 2 blogs per screen, paired with poems
function createBlogPairs(blogs: ContentItem[], poems: ContentItem[]) {
  const pairs = [];
  for (let i = 0; i < blogs.length; i += 2) {
    pairs.push({
      id: `blog-${i}`,
      blogs: [blogs[i], blogs[i + 1]].filter(Boolean), // 2件ずつ
      poem: poems[Math.floor(i / 2) + 1], // poems[0] is used in first screen
    });
  }
  return pairs;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const recentMoments = MOMENTS.slice(0, 2); // 最新2件のmoments
  const blogPairs = createBlogPairs(BLOG_POSTS, POEMS);

  return (
    <div className="w-full snap-y snap-mandatory h-screen overflow-y-scroll overflow-x-hidden">
      {/* First Screen: Nav + Moments */}
      <section className="w-full h-screen snap-start grid grid-cols-[2fr_1fr] relative">
        {/* Dark Mode Toggle at division line */}
        <div className="absolute top-6 left-[66.666%] -translate-x-1/2 z-20">
          <DarkModeToggle />
        </div>
        {/* Left Column: Nav + Moments */}
        <div className="bg-paper-white dark:bg-ink-black h-full flex flex-col p-6 md:p-12 lg:p-16 border-r border-gray-200 dark:border-gray-700">
          <div className="flex-none mb-12">
            <Nav />
          </div>

          <div className="flex-grow flex flex-col justify-end pb-8 max-w-2xl">
            <FadeIn>
              <div className="space-y-6">
                {recentMoments.map((moment) => (
                  <article
                    key={moment.slug}
                    className="cursor-pointer group"
                    onClick={() => navigate(`/moments/${moment.slug}`)}
                  >
                    <div className="font-mono text-xs text-gray-400 dark:text-gray-500 mb-1">
                      {moment.updated} <span className="mx-1">/</span> MOMENT
                    </div>
                    <p className="font-serif leading-relaxed text-gray-700 dark:text-gray-300 text-sm md:text-base group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                      {moment.excerpt}
                      {moment.images && moment.images.length > 0 && (
                        <span className="ml-2 text-gray-400 dark:text-gray-500">[photo]</span>
                      )}
                    </p>
                  </article>
                ))}
                {MOMENTS.length > 2 && (
                  <div
                    className="text-xs font-mono text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    onClick={() => navigate('/moments')}
                  >
                    [MORE MOMENTS →]
                  </div>
                )}
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Right Column: First Poem */}
        <div className="bg-ink-black dark:bg-paper-white h-full relative overflow-hidden flex flex-col items-center justify-center py-12 select-none">
          {POEMS[0] && (
            <FadeIn delay={200} className="h-3/4 w-full flex justify-center">
              <article
                className="poem h-full writing-vertical text-text-inv dark:text-text-main cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate(`/poems/${POEMS[0]?.slug}`)}
              >
                <h2 className="text-xl md:text-2xl font-serif font-bold ml-4 md:ml-8 tracking-widest border-b-2 border-text-inv/20 dark:border-text-main/20 pb-4 mb-4">
                  {POEMS[0].title}
                </h2>
                <div className="text-sm md:text-base font-serif leading-loose tracking-wider text-gray-300 dark:text-gray-600 opacity-90 max-h-full whitespace-pre-wrap">
                  {POEMS[0].excerpt}
                </div>
              </article>
            </FadeIn>
          )}
          <div className="absolute bottom-8 text-text-inv/10 dark:text-text-main/10 font-mono text-xs writing-vertical">
            Vol. 1
          </div>
        </div>
      </section>

      {/* Blog Screens */}
      {blogPairs.map((pair, index) => (
        <section
          key={pair.id}
          className="w-full h-screen snap-start grid grid-cols-[2fr_1fr] relative"
        >
          {/* Left Column: Blogs (2 per screen) */}
          <div className="bg-paper-white dark:bg-ink-black h-full flex flex-col p-6 md:p-12 lg:p-16 border-r border-gray-200 dark:border-gray-700">
            <div className="flex-none h-12"></div>

            <div className="flex-grow flex flex-col justify-center max-w-2xl space-y-8">
              {pair.blogs.map((blog) => (
                <FadeIn key={blog.slug}>
                  <article
                    className="blog-entry cursor-pointer group"
                    onClick={() => navigate(`/blog/${blog.slug}`)}
                  >
                    <div className="font-mono text-xs text-gray-400 dark:text-gray-500 mb-1">
                      {blog.updated} <span className="mx-1">/</span> BLOG
                    </div>
                    <h2 className="text-lg md:text-xl font-semibold mb-2 group-hover:underline decoration-1 underline-offset-4 text-text-main dark:text-text-inv" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                      {blog.title}
                    </h2>
                    <p className="font-serif leading-relaxed text-gray-700 dark:text-gray-300 text-sm line-clamp-1">
                      {blog.excerpt}...
                    </p>
                  </article>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* Right Column: Poetry */}
          <div className="bg-ink-black dark:bg-paper-white h-full relative overflow-hidden flex flex-col items-center justify-center py-12 select-none">
            {pair.poem && (
              <FadeIn delay={200} className="h-3/4 w-full flex justify-center">
                <article
                  className="poem h-full writing-vertical text-text-inv dark:text-text-main cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate(`/poems/${pair.poem?.slug}`)}
                >
                  <h2 className="text-xl md:text-2xl font-serif font-bold ml-4 md:ml-8 tracking-widest border-b-2 border-text-inv/20 dark:border-text-main/20 pb-4 mb-4">
                    {pair.poem.title}
                  </h2>
                  <div className="text-sm md:text-base font-serif leading-loose tracking-wider text-gray-300 dark:text-gray-600 opacity-90 max-h-full whitespace-pre-wrap">
                    {pair.poem.excerpt}
                  </div>
                </article>
              </FadeIn>
            )}

            <div className="absolute bottom-8 text-text-inv/10 dark:text-text-main/10 font-mono text-xs writing-vertical">
              Vol. {index + 2}
            </div>
          </div>
        </section>
      ))}

      {/* Footer / End Section */}
      <section className="snap-start h-screen w-full grid grid-cols-[2fr_1fr]">
        <div className="bg-paper-white dark:bg-ink-black flex items-center justify-center flex-col font-mono text-xs text-gray-400 dark:text-gray-500">
          <p className="mb-4">NO MORE CONTENT</p>
          <Nav />
          <p className="mt-8">at an arbor</p>
        </div>
        <div className="bg-ink-black dark:bg-paper-white"></div>
      </section>
    </div>
  );
};

export default Home;