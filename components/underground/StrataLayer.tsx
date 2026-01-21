import React, { useMemo } from 'react';
import { ContributionWeek, ContributionLevel } from '../lib/strata-types';

interface StrataLayerProps {
  week: ContributionWeek;
  index: number;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const StrataLayer: React.FC<StrataLayerProps> = ({ week, index, isActive, onMouseEnter, onMouseLeave }) => {
  // Generate a random path based on contribution data to look like a rock layer
  const pathData = useMemo(() => {
    const width = 1000;
    const height = 150; // Base height of a layer
    const points: [number, number][] = [];

    // Start point
    points.push([0, height]);

    // Map the 7 days to points across the width
    week.days.forEach((day, i) => {
      const x = (width / 7) * (i + 0.5);
      // More contributions = higher peak (smaller y)
      // Add some randomness based on the index to ensure layers don't look identical
      const noise = Math.sin(index * 0.5 + i) * 10; 
      const amplitude = day.count * 8; 
      const y = height - (amplitude + 20) + noise; 
      points.push([x, y]);
    });

    // End point
    points.push([width, height]);
    points.push([0, height]); // Close loop

    // Create a smooth curve command (Catmull-Rom or Bezier approx)
    let d = `M ${points[0][0]},${points[0][1]} `;
    
    // Simple Lineto for now, but smoothed by SVG filters later
    for (let i = 1; i < points.length - 1; i++) {
        // Simple curve smoothing logic
        const p0 = points[i - 1];
        const p1 = points[i];
        const midX = (p0[0] + p1[0]) / 2;
        const midY = (p0[1] + p1[1]) / 2;
        d += `Q ${p0[0]},${p0[1]} ${midX},${midY} `;
    }
    d += `L ${points[points.length-1][0]},${points[points.length-1][1]} Z`;

    return d;
  }, [week, index]);

  const total = week.days.reduce((a, b) => a + b.count, 0);
  const isRich = total > 15;
  const isEmpty = total === 0;

  // Color logic
  let fill = "none";
  let stroke = "#1e293b";
  let strokeWidth = 2;

  if (isRich) {
    stroke = "#ffffff";
    strokeWidth = 4;
  } else if (!isEmpty) {
    stroke = "#4b5563";
    strokeWidth = 2;
  }

  return (
    <div
        className={`relative w-full h-32 -mt-20 transition-all duration-500 ease-out transform origin-center group ${isActive ? 'scale-105 z-10' : 'scale-100 z-0'}`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
    >
      {/* Desktop SVG with displacement filter */}
      <svg
        viewBox="0 0 1000 150"
        preserveAspectRatio="none"
        className="hidden md:block w-full h-full drop-shadow-xl"
        style={{ filter: 'url(#displacementFilter)' }}
      >
        <path
            d={pathData}
            fill="none"
            stroke={stroke}
            strokeWidth={isActive ? strokeWidth * 1.5 : strokeWidth}
            vectorEffect="non-scaling-stroke"
            className="transition-all duration-300 opacity-90 hover:opacity-100"
        />
      </svg>

      {/* Mobile SVG - multiple overlapping strokes for texture */}
      <svg
        viewBox="0 0 1000 150"
        preserveAspectRatio="none"
        className="block md:hidden w-full h-full"
      >
        {/* Base thick line for visibility */}
        <path
            d={pathData}
            fill="none"
            stroke={stroke}
            strokeWidth={isRich ? 8 : 5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.4"
        />
        {/* Medium line for body */}
        <path
            d={pathData}
            fill="none"
            stroke={stroke}
            strokeWidth={isRich ? 5 : 3}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
        />
        {/* Thin line for definition */}
        <path
            d={pathData}
            fill="none"
            stroke={stroke}
            strokeWidth={isRich ? 2 : 1}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
        />
      </svg>
      
      {/* Blueprint Annotations */}
      <div className="absolute top-1/2 left-0 w-full px-4 flex justify-between pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
        <span className="text-[9px] font-mono tracking-widest text-white/40 rotate-90 origin-left translate-y-4">
           {week.days[0].date.replace(/-/g, '.')}
        </span>
        {total > 0 && (
            <span className="text-[9px] font-mono border-b border-white/20 text-white/60">
                MASS: {total}
            </span>
        )}
      </div>
    </div>
  );
};