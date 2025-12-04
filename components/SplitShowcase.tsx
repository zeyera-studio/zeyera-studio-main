
import React, { useRef, useEffect } from 'react';
import { ContentItem } from '../types';

interface SplitShowcaseProps {
  items: ContentItem[];
}

const SplitShowcase: React.FC<SplitShowcaseProps> = ({ items }) => {
  const scrollRefMovies = useRef<HTMLDivElement>(null);
  const scrollRefTV = useRef<HTMLDivElement>(null);

  const movies = items.filter(i => i.category === 'Movie');
  const tvSeries = items.filter(i => i.category === 'TV Series');

  // Horizontal scroll wheel support
  useEffect(() => {
    const handleWheel = (ref: React.RefObject<HTMLDivElement>) => (e: WheelEvent) => {
      if (ref.current) {
        e.preventDefault();
        ref.current.scrollLeft += e.deltaY;
      }
    };

    const mRef = scrollRefMovies.current;
    const tRef = scrollRefTV.current;

    if (mRef) mRef.addEventListener('wheel', handleWheel(scrollRefMovies) as any);
    if (tRef) tRef.addEventListener('wheel', handleWheel(scrollRefTV) as any);

    return () => {
      if (mRef) mRef.removeEventListener('wheel', handleWheel(scrollRefMovies) as any);
      if (tRef) tRef.removeEventListener('wheel', handleWheel(scrollRefTV) as any);
    };
  }, []);

  return (
    <div className="relative w-full bg-[#050505] py-20 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-900/10 rounded-full blur-[100px]"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 relative">
          
          {/* Central Divider - Only visible on Large Screens */}
          <div className="hidden lg:flex absolute inset-0 justify-center items-center pointer-events-none z-20">
             <div className="h-[140%] w-[120px] relative">
               <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-full w-full overflow-visible" viewBox="0 0 100 800" preserveAspectRatio="none">
                  {/* The core white line - Thunder Shape */}
                  <path 
                    d="M50,0 L50,250 L10,350 L95,400 L5,460 L50,560 L50,800" 
                    vectorEffect="non-scaling-stroke"
                    className="stroke-white stroke-[2px] fill-none"
                  />
                  {/* The Neon Glow Layers */}
                  <path 
                    d="M50,0 L50,250 L10,350 L95,400 L5,460 L50,560 L50,800" 
                    vectorEffect="non-scaling-stroke"
                    className="stroke-neon-green stroke-[4px] fill-none blur-[3px] opacity-100"
                  />
                  <path 
                    d="M50,0 L50,250 L10,350 L95,400 L5,460 L50,560 L50,800" 
                    vectorEffect="non-scaling-stroke"
                    className="stroke-neon-green stroke-[12px] fill-none blur-[10px] opacity-60"
                  />
                  <path 
                    d="M50,0 L50,250 L10,350 L95,400 L5,460 L50,560 L50,800" 
                    vectorEffect="non-scaling-stroke"
                    className="stroke-neon-green stroke-[25px] fill-none blur-[25px] opacity-30"
                  />
               </svg>
             </div>
          </div>

          {/* MOVIES SECTION (Left) */}
          <div className="relative lg:pr-12 group">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-green-600 tracking-wider uppercase drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">Movies</h2>
              <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto lg:mx-0">
                Cinematic masterpieces curated for the ultimate experience.
              </p>
            </div>

            <div 
              ref={scrollRefMovies}
              className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {movies.map((movie) => (
                <div key={movie.id} className="min-w-[200px] w-[200px] snap-center flex flex-col gap-3 group/card cursor-pointer">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg transition-all duration-300 group-hover/card:shadow-[0_0_20px_rgba(57,255,20,0.2)] group-hover/card:scale-105 border border-white/5">
                    <img src={movie.imageUrl} alt={movie.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover/card:translate-y-0 transition-transform">
                        <button className="w-full bg-neon-green text-black font-bold py-2 rounded text-xs opacity-0 group-hover/card:opacity-100 transition-opacity">
                          Watch Now
                        </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg truncate">{movie.title}</h3>
                    <p className="text-gray-500 text-xs uppercase tracking-widest">{movie.year || '2024'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TV SERIES SECTION (Right) */}
          <div className="relative lg:pl-12">
            <div className="mb-8 text-center lg:text-right">
              <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-green-600 tracking-wider uppercase drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">TV Series</h2>
              <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto lg:mx-0 lg:ml-auto">
                Binge-worthy sagas that define generations.
              </p>
            </div>

            <div 
              ref={scrollRefTV}
              className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory flex-row-reverse hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {tvSeries.map((show) => (
                <div key={show.id} className="min-w-[200px] w-[200px] snap-center flex flex-col gap-3 group/card cursor-pointer text-right">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg transition-all duration-300 group-hover/card:shadow-[0_0_20px_rgba(57,255,20,0.2)] group-hover/card:scale-105 border border-white/5">
                    <img src={show.imageUrl} alt={show.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover/card:translate-y-0 transition-transform">
                        <button className="w-full bg-white text-black font-bold py-2 rounded text-xs opacity-0 group-hover/card:opacity-100 transition-opacity">
                          Episodes
                        </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg truncate">{show.title}</h3>
                    <p className="text-gray-500 text-xs uppercase tracking-widest">{show.year || '2024'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SplitShowcase;
    