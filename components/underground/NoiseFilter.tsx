import React from 'react';

export const NoiseFilter = () => {
  return (
    <svg className="hidden">
      <defs>
        <filter id="noiseFilter">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.85" 
            numOctaves="3" 
            stitchTiles="stitch" 
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        
        <filter id="displacementFilter">
          <feTurbulence 
            type="turbulence" 
            baseFrequency="0.01 0.05" 
            numOctaves="2" 
            result="turbulence" 
          />
          <feDisplacementMap 
            in2="turbulence" 
            in="SourceGraphic" 
            scale="20" 
            xChannelSelector="R" 
            yChannelSelector="G" 
          />
        </filter>

        <linearGradient id="magma" x1="0%" y1="0%" x2="100%" y2="0%">
           <stop offset="0%" stopColor="#4338ca" />   {/* Indigo */}
           <stop offset="50%" stopColor="#dc2626" />   {/* Red */}
           <stop offset="100%" stopColor="#f59e0b" />  {/* Amber */}
        </linearGradient>

        <linearGradient id="void" x1="0%" y1="0%" x2="100%" y2="0%">
           <stop offset="0%" stopColor="#0f172a" />
           <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>
    </svg>
  );
};