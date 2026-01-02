import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { POEMS } from '../data';
import Nav from '../components/Nav';
import FadeIn from '../components/FadeIn';

const PoemDetail: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const poem = POEMS.find(p => p.slug === slug);

  if (!poem) {
    return <div className="h-screen bg-ink-black text-white flex items-center justify-center">404</div>;
  }

  return (
    <div className="h-screen w-full bg-ink-black text-text-inv overflow-hidden relative flex">
      
      {/* Navigation (Light overlay on dark) */}
      <div className="absolute top-0 left-0 p-6 md:p-12 z-10 opacity-50 hover:opacity-100 transition-opacity">
        <div className="invert filter">
           <Nav />
        </div>
      </div>

      {/* Main Paper Area */}
      <main className="w-full h-full flex items-center justify-center p-8 md:p-16">
        <FadeIn className="h-full max-h-[80vh] w-full max-w-4xl flex justify-center">
            {/* The Poem Paper */}
            <div className="writing-vertical h-full text-right select-none">
              
              {/* Header Info (rotated to fit vertical flow naturally or just smaller text at top/right) */}
              <div className="ml-8 md:ml-16 flex flex-col gap-4 text-xs font-mono text-gray-500 tracking-widest border-l border-gray-700 pl-2">
                 <span>{poem.date}</span>
                 <span>POEM #{slug?.toUpperCase().slice(0,3)}</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-serif font-bold ml-12 md:ml-24 leading-normal">
                {poem.title}
              </h1>

              {/* Body */}
              <div className="text-lg md:text-xl font-serif leading-loose tracking-widest whitespace-pre-wrap ml-4 text-gray-300">
                {poem.content}
              </div>

            </div>
        </FadeIn>
      </main>

      {/* Exit Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute bottom-8 right-8 text-xs font-mono text-gray-600 hover:text-white transition-colors"
      >
        [CLOSE]
      </button>
    </div>
  );
};

export default PoemDetail;