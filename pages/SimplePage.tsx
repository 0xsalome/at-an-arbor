import React from 'react';
import Nav from '../components/Nav';
import FadeIn from '../components/FadeIn';
import { BLOG_POSTS, POEMS, MOMENTS } from '../lib/content';
import { Link } from 'react-router-dom';

interface SimplePageProps {
  type: 'compost' | 'blog-list' | 'poem-list' | 'moment-list';
}

const SimplePage: React.FC<SimplePageProps> = ({ type }) => {
  return (
    <div className="min-h-screen bg-paper-white dark:bg-ink-black text-text-main dark:text-text-inv flex flex-col md:flex-row">
      <aside className="w-full md:w-1/6 p-6 md:p-12 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
        <Nav showDarkModeToggle />
      </aside>
      <main className="w-full md:w-5/6 p-6 md:p-16 lg:p-24 max-w-3xl">
        <FadeIn>
          {type === 'compost' && (
            <>
              <h1 className="text-4xl font-mono font-bold mb-8">at an arbor (AI)</h1>
              <div className="font-serif leading-loose text-lg">
                <p className="mb-6">
                  木陰の東屋で、思考の種を蒔く場所。
                </p>
                <p className="mb-6">
                  ここは完成を目指さない庭です。
                  書いては手入れをし、育てては剪定する。
                  左には日々の断片、右には言葉の結晶。
                </p>
                <p className="mb-6">
                  整理されていないことも、矛盾があることも、
                  そのまま残しておく。
                </p>
              </div>
            </>
          )}

          {type === 'blog-list' && (
            <>
              <h1 className="text-4xl font-mono font-bold mb-12">Blog Archive</h1>
              <ul className="space-y-8">
                {BLOG_POSTS.map(post => (
                  <li key={post.slug} className="group">
                    <Link to={`/blog/${post.slug}`} className="block">
                      <div className="font-mono text-xs text-gray-500 mb-1">{post.updated}</div>
                      <h2 className="text-2xl font-serif font-bold group-hover:underline decoration-1 underline-offset-4">{post.title}</h2>
                    </Link>
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
                        <span className="font-mono text-xs text-gray-500 mb-4">{poem.updated}</span>
                        <h2 className="text-xl font-serif font-bold border-l border-gray-600 pl-2 group-hover:border-white transition-colors">{poem.title}</h2>
                     </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {type === 'moment-list' && (
            <>
              <h1 className="text-4xl font-mono font-bold mb-12">Moments</h1>
              <ul className="space-y-8">
                {MOMENTS.map(moment => (
                  <li key={moment.slug} className="group">
                    <Link to={`/moments/${moment.slug}`} className="block">
                      <div className="font-mono text-xs text-gray-500 mb-2">{moment.updated}</div>
                      <p className="font-serif text-gray-700 dark:text-gray-300 group-hover:text-text-main dark:group-hover:text-text-inv transition-colors">{moment.excerpt}</p>
                      {moment.images && moment.images.length > 0 && (
                        <img
                          src={moment.images[0]}
                          alt=""
                          className="mt-3 max-w-xs rounded group-hover:brightness-110 transition-all"
                        />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </FadeIn>
      </main>
    </div>
  );
};

export default SimplePage;