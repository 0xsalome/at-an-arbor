import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import FadeIn from '../components/FadeIn';
import { BLOG_POSTS } from '../lib/content';

type TabType = 'all' | 'blog' | 'essay';

const BlogList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const navigate = useNavigate();

  // lib/content.ts から直接データを使用（ビルド時に解決）
  const blogPosts = BLOG_POSTS;

  // タブによるフィルタリング
  const filteredPosts = blogPosts.filter(post => {
    if (activeTab === 'all') return true;
    return post.tags?.includes(activeTab);
  });

  return (
    <div className="min-h-screen bg-paper-white dark:bg-ink-black text-text-main dark:text-text-inv flex flex-col md:flex-row">
      {/* 左サイドバー */}
      <aside className="w-full md:w-1/6 p-6 md:p-12 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
        <Nav showDarkModeToggle />
      </aside>

      {/* メインコンテンツ */}
      <main className="w-full md:w-5/6 p-6 md:p-16 lg:p-24 max-w-3xl">
        <FadeIn>
            <h1 className="text-4xl font-mono font-bold mb-12">Blog Archive</h1>
            
            {/* タブUI */}
            <div className="flex gap-6 mb-12 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('all')}
                className={`pb-2 text-sm font-mono transition-colors ${
                  activeTab === 'all'
                    ? 'border-b-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('blog')}
                className={`pb-2 text-sm font-mono transition-colors ${
                  activeTab === 'blog'
                    ? 'border-b-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Blog
              </button>
              <button
                onClick={() => setActiveTab('essay')}
                className={`pb-2 text-sm font-mono transition-colors ${
                  activeTab === 'essay'
                    ? 'border-b-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Essay
              </button>
            </div>

            {/* 記事一覧 */}
            <div className="space-y-8">
              {filteredPosts.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 font-mono text-sm">
                  No posts found.
                </p>
              ) : (
                filteredPosts.map(post => (
                  <div
                    key={post.slug}
                    className="group"
                  >
                    <a href={`${import.meta.env.BASE_URL}blog/${post.slug}/`} className="block">
                        <div className="font-mono text-xs text-gray-500 mb-1">
                        {(post.updated || post.date).slice(0, 10)} / {post.tags && post.tags[0] ? post.tags[0].toUpperCase() : 'BLOG'}
                        {post.updated && post.updated.slice(0, 10) > post.date.slice(0, 10) && (
                            <span> / ᚛ Regrown</span>
                        )}
                        </div>
                        <h2 className="text-2xl font-serif font-bold group-hover:underline decoration-1 underline-offset-4">{post.title}</h2>
                    </a>
                  </div>
                ))
              )}
            </div>
        </FadeIn>
      </main>
    </div>
  );
};

export default BlogList;
