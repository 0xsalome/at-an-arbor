import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BLOG_POSTS } from '../data';
import Nav from '../components/Nav';
import FadeIn from '../components/FadeIn';

const BlogDetail: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = BLOG_POSTS.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-paper-white flex items-center justify-center font-mono">
        <div className="text-center">
          <h1 className="text-4xl mb-4">404</h1>
          <p className="mb-8">Post not found.</p>
          <button onClick={() => navigate('/')} className="underline">[RETURN]</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper-white text-text-main flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-1/6 p-6 md:p-12 border-b md:border-b-0 md:border-r border-gray-200">
        <Nav />
      </aside>

      {/* Main Content */}
      <main className="w-full md:w-5/6 p-6 md:p-16 lg:p-24 max-w-4xl mx-auto">
        <FadeIn>
          <header className="mb-12 border-b border-gray-900 pb-8">
            <div className="font-mono text-sm text-gray-500 mb-4">{post.date}</div>
            <h1 className="text-3xl md:text-5xl font-mono font-bold leading-tight">{post.title}</h1>
          </header>

          <article className="prose prose-stone prose-lg font-serif leading-loose text-gray-800 whitespace-pre-line">
            {post.content}
          </article>

          <footer className="mt-16 pt-8 border-t border-gray-200 flex justify-between font-mono text-sm">
            <button onClick={() => navigate(-1)} className="hover:underline">← BACK</button>
            <span>END OF RECORD</span>
          </footer>
        </FadeIn>
      </main>
    </div>
  );
};

export default BlogDetail;