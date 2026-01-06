import React from 'react';
import FadeIn from '../components/FadeIn';

const Underground: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-black text-white flex items-center justify-center">
      <FadeIn>
        <div className="font-pixel text-xs text-gray-500">
          ...404?
        </div>
      </FadeIn>
    </div>
  );
};

export default Underground;
