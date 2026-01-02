import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LEFT_COLUMN_CONTENT, POEMS } from '../lib/content';
import FadeIn from '../components/FadeIn';
import Nav from '../components/Nav';
import type { ContentItem } from '../types';

// Create pairs: left column content paired with poems
function createPairs(leftItems: ContentItem[], poems: ContentItem[]) {
  const maxLength = Math.max(leftItems.length, poems.length);
  const pairs = [];
  for (let i = 0; i < maxLength; i++) {
    pairs.push({
      id: `pair-${i}`,
      left: leftItems[i],
      poem: poems[i],
    });
  }
  return pairs;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const pairs = createPairs(LEFT_COLUMN_CONTENT, POEMS);

  const getRoute = (item: ContentItem) => {
    if (item.type === 'blog') return `/blog/${item.slug}`;
    if (item.type === 'moment') return `/moments/${item.slug}`;
    return `/poems/${item.slug}`;
  };

  return (
    <div className="w-full snap-y snap-mandatory h-screen overflow-y-scroll overflow-x-hidden">
      {pairs.map((pair, index) => (
        <section
          key={pair.id}
          className="pair w-full h-screen snap-start grid grid-cols-[2fr_1fr] relative"
        >
          {/* Left Column: Blog & Moments */}
          <div className="bg-paper-white h-full flex flex-col p-6 md:p-12 lg:p-16 border-r border-gray-200">
            <div className="flex-none mb-12">
              {index === 0 && <Nav />}
              {index !== 0 && <div className="h-24"></div>}
            </div>

            {pair.left && (
              <div className="flex-grow flex flex-col justify-center max-w-2xl">
                <FadeIn>
                  <article
                    className="blog-entry cursor-pointer group"
                    onClick={() => navigate(getRoute(pair.left!))}
                  >
                    <div className="font-mono text-sm text-gray-500 mb-2">
                      {pair.left.updated} <span className="mx-2">/</span>
                      {pair.left.type === 'moment' ? 'MOMENT' : 'BLOG'}
                    </div>
                    {pair.left.type !== 'moment' && (
                      <h2 className="text-2xl md:text-3xl font-bold mb-6 group-hover:underline decoration-1 underline-offset-4" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                        {pair.left.title}
                      </h2>
                    )}
                    <p className="font-serif leading-relaxed text-gray-700 text-sm md:text-base line-clamp-4 md:line-clamp-6">
                      {pair.left.excerpt}
                    </p>
                    <div className="mt-4 text-xs font-mono text-gray-400 group-hover:text-text-main transition-colors">
                      [READ MORE]
                    </div>
                  </article>
                </FadeIn>
              </div>
            )}
          </div>

          {/* Right Column: Poetry */}
          <div className="bg-ink-black h-full relative overflow-hidden flex flex-col items-center justify-center py-12 select-none">
            {pair.poem && (
              <FadeIn delay={200} className="h-3/4 w-full flex justify-center">
                <article
                  className="poem h-full writing-vertical text-text-inv cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate(`/poems/${pair.poem?.slug}`)}
                >
                  <h2 className="text-xl md:text-2xl font-serif font-bold ml-4 md:ml-8 tracking-widest border-b-2 border-text-inv/20 pb-4 mb-4">
                    {pair.poem.title}
                  </h2>
                  <div className="text-sm md:text-base font-serif leading-loose tracking-wider text-gray-300 opacity-90 max-h-full whitespace-pre-wrap">
                    {pair.poem.excerpt}
                  </div>
                </article>
              </FadeIn>
            )}

            <div className="absolute bottom-8 text-text-inv/10 font-mono text-xs writing-vertical">
              Vol. {index + 1}
            </div>
          </div>
        </section>
      ))}

      {/* Footer / End Section */}
      <section className="snap-start h-screen w-full grid grid-cols-[2fr_1fr]">
        <div className="bg-paper-white flex items-center justify-center flex-col font-mono text-xs text-gray-400">
          <p className="mb-4">NO MORE CONTENT</p>
          <Nav />
          <p className="mt-8">at an arbor</p>
        </div>
        <div className="bg-ink-black"></div>
      </section>
    </div>
  );
};

export default Home;