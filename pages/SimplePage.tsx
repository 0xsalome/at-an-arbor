import React from 'react';
import Nav from '../components/Nav';
import FadeIn from '../components/FadeIn';
import { BLOG_POSTS, POEMS } from '../data';
import { Link } from 'react-router-dom';

interface SimplePageProps {
  type: 'profile' | 'blog-list' | 'poem-list';
}

const SimplePage: React.FC<SimplePageProps> = ({ type }) => {
  return (
    <div className="min-h-screen bg-paper-white text-text-main flex flex-col md:flex-row">
      <aside className="w-full md:w-1/6 p-6 md:p-12 border-b md:border-b-0 md:border-r border-gray-200">
        <Nav />
      </aside>
      <main className="w-full md:w-5/6 p-6 md:p-16 lg:p-24 max-w-3xl">
        <FadeIn>
          {type === 'profile' && (
            <>
              <h1 className="text-4xl font-mono font-bold mb-8">Profile</h1>
              <div className="font-serif leading-loose text-lg">
                <p className="mb-6">
                  Webの片隅に静寂を作ることを目的に、この場所を作りました。
                </p>
                <p className="mb-6">
                  日々の雑音から離れ、言葉と向き合うための実験的な空間です。
                  左側は日常の記録、右側は心象の記録。
                </p>
                <p>
                  Contact: <span className="font-mono bg-gray-200 px-1">hello@example.com</span>
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
                      <div className="font-mono text-xs text-gray-500 mb-1">{post.date}</div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {POEMS.map(poem => (
                  <Link to={`/poems/${poem.slug}`} key={poem.slug} className="block p-8 bg-ink-black text-text-inv group hover:scale-[1.02] transition-transform duration-500">
                     <div className="writing-vertical h-48 w-full">
                        <span className="font-mono text-xs text-gray-500 mb-4">{poem.date}</span>
                        <h2 className="text-xl font-serif font-bold border-l border-gray-600 pl-2 group-hover:border-white transition-colors">{poem.title}</h2>
                     </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </FadeIn>
      </main>
    </div>
  );
};

export default SimplePage;