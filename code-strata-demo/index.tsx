import React, { useState, useEffect, useRef } from 'react';
import { StrataData } from './lib/strata-types';
import { fetchStrataData, analyzeStrata } from './lib/github-strata';
import { NoiseFilter } from './components/NoiseFilter';
import { StrataLayer } from './components/StrataLayer';
import { GeologicalReport } from './components/GeologicalReport';

const Underground: React.FC = () => {
  const [username, setUsername] = useState('0xsalome'); // Default to project owner
  const [data, setData] = useState<StrataData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<string>("Hover over a strata layer to analyze.");
  const [analyzing, setAnalyzing] = useState(false);
  
  // Debounce for analysis
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadData(username);

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const loadData = async (user: string) => {
    setLoading(true);
    try {
      const result = await fetchStrataData(user);
      setData(result);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleLayerHover = (weekIndex: number) => {
    setActiveIndex(weekIndex);

    if (!data) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Only fetch AI analysis if user hovers for 600ms
    timeoutRef.current = setTimeout(async () => {
        setAnalyzing(true);
        // data.weeks is already reversed (0 is newest/top)
        const report = await analyzeStrata(data.weeks[weekIndex], data.username);
        setAnalysis(report);
        setAnalyzing(false);
    }, 600);
  };

  const handleLayerLeave = () => {
    setActiveIndex(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(username);
  };

  return (
    <div className="min-h-screen relative text-white selection:bg-white/20 selection:text-white font-mono overflow-x-hidden">
      <NoiseFilter />

      {/* === Background with Grain === */}
      <div className="fixed inset-0 bg-black -z-10" />
      <div
        className="fixed inset-0 bg-neutral-900 opacity-100 -z-10"
        style={{ filter: 'url(#grainFilter)' }}
      />

      {/* === Retro Terminal Effects === */}

      {/* 1. Heavy Noise Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30 z-50 mix-blend-overlay"
        style={{ filter: 'url(#noiseFilter)' }}
      />
      
      {/* 2. Scanlines */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))]" style={{ backgroundSize: '100% 2px, 3px 100%' }} />

      {/* 3. CRT Vignette */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[radial-gradient(circle,transparent_60%,rgba(0,0,0,0.8)_100%)]" />


      {/* Hero / Header */}
      <header className="fixed top-0 left-0 w-full p-4 md:p-8 z-40 flex justify-between items-start pointer-events-none">
         <div className="pointer-events-auto opacity-80 hover:opacity-100 transition-opacity">
             <pre className="font-mono text-[6px] md:text-[8px] leading-[1.1] text-white/90 whitespace-pre drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
{`
  ____ ___  ____  _____   ____ _____ ____      _  _____  _    
 / ___/ _ \\|  _ \\| ____| / ___|_   _|  _ \\    / \\|_   _|/ \\   
| |  | | | | | | |  _|   \\___ \\ | | | |_) |  / _ \\ | | / _ \\  
| |__| |_| | |_| | |___   ___) || | |  _ <  / ___ \\| |/ ___ \\ 
 \\____\\___/|____/|_____| |____/ |_| |_| \\_\\/_/   \\_\\_/_/   \\_\\
`}
             </pre>
             <div className="mt-4 pl-1">
                 <p className="text-[10px] font-mono text-white/40 tracking-[0.3em] uppercase">
                     GitHub Contribution Scan
                 </p>
                 <p className="mt-1 text-[10px] font-mono text-white/60 tracking-widest uppercase">
                     {'>>'} Excavation Site: {data?.username || 'UNKNOWN'}
                 </p>
             </div>
         </div>

         {/* Right side form removed per user request */}
      </header>

      {/* Main Visualization Area */}
      <main className="relative pt-48 md:pt-64 pb-32 px-4 md:px-0 max-w-4xl mx-auto min-h-screen">
        
        {/* Decorative Vertical Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2 fixed" />

        {loading ? (
            <div className="flex flex-col items-center justify-center h-64 font-mono text-white/40 gap-4">
                <div className="animate-spin text-2xl">◷</div>
                <div className="animate-pulse tracking-widest text-xs">INITIALIZING GEOLOGICAL SCAN...</div>
            </div>
        ) : (
            <div className="flex flex-col items-center">
                {data?.weeks.map((week, i) => (
                    <StrataLayer
                        key={i}
                        week={week}
                        index={i}
                        isActive={activeIndex === i}
                        onMouseEnter={() => handleLayerHover(i)}
                        onMouseLeave={handleLayerLeave}
                    />
                ))}
            </div>
        )}

        {/* Depth Markers */}
        <div className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-32 pointer-events-none font-mono text-[9px] text-white/20 border-l border-white/10 pl-2">
            <span>SURFACE_00</span>
            <span>MANTLE_01</span>
            <span>CORE_02</span>
        </div>

      </main>

    </div>
  );
};

export default Underground;
