
import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Play, ChevronDown } from 'lucide-react';
import { Content } from '../types';
import { fetchContent } from '../lib/contentService';

// Mock data for TV Series (fallback)
const MOCK_TV_DATABASE = [
  { id: 't1', title: 'Quantum Rift', genre: 'Sci-Fi', rating: '4.8', year: '2024', image: 'https://picsum.photos/seed/quant/300/450', seasons: '3 Seasons' },
  { id: 't2', title: 'Desert Wind', genre: 'Western', rating: '4.5', year: '2021', image: 'https://picsum.photos/seed/des/300/450', seasons: '1 Season' },
  { id: 't3', title: 'Whispering Woods', genre: 'Horror', rating: '4.2', year: '2023', image: 'https://picsum.photos/seed/wood/300/450', seasons: '2 Seasons' },
  { id: 't4', title: 'Fallen Kingdom', genre: 'Fantasy', rating: '4.9', year: '2022', image: 'https://picsum.photos/seed/fall/300/450', seasons: '5 Seasons' },
  { id: 't5', title: 'Lost Signal', genre: 'Thriller', rating: '4.7', year: '2024', image: 'https://picsum.photos/seed/lost/300/450', seasons: '1 Season' },
  
  { id: 'd1', title: 'The Crown Jewel', genre: 'Drama', rating: '4.6', year: '2020', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop', seasons: '6 Seasons' },
  { id: 'd2', title: 'City Lights', genre: 'Drama', rating: '4.3', year: '2022', image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e63?q=80&w=800&auto=format&fit=crop', seasons: '3 Seasons' },
  { id: 'd3', title: 'Empire of Dust', genre: 'Drama', rating: '4.8', year: '2023', image: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cd4?q=80&w=800&auto=format&fit=crop', seasons: '2 Seasons' },
  
  { id: 'c1', title: 'Silicon Valley Dreams', genre: 'Comedy', rating: '4.5', year: '2019', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop', seasons: '4 Seasons' },
  { id: 'c2', title: 'Office Space 2099', genre: 'Comedy', rating: '4.1', year: '2023', image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800&auto=format&fit=crop', seasons: '2 Seasons' },
  { id: 'c3', title: 'Laugh Track', genre: 'Comedy', rating: '4.0', year: '2021', image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?q=80&w=800&auto=format&fit=crop', seasons: '5 Seasons' },

  { id: 's1', title: 'Space Frontiers', genre: 'Sci-Fi', rating: '4.9', year: '2024', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop', seasons: '2 Seasons' },
  { id: 's2', title: 'Android Soul', genre: 'Sci-Fi', rating: '4.4', year: '2022', image: 'https://images.unsplash.com/photo-1535016120720-40c6874c3b13?q=80&w=800&auto=format&fit=crop', seasons: '1 Season' },
  { id: 's3', title: 'Neon Genesis', genre: 'Sci-Fi', rating: '4.7', year: '2025', image: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop', seasons: '1 Season' },
];

const CategorySection: React.FC<{ title: string; shows: typeof TV_DATABASE; onSelectSeries: (id: string) => void }> = ({ title, shows, onSelectSeries }) => {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6 px-4 md:px-8">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
          <div className="w-1 h-6 bg-neon-green rounded-full"></div>
          {title}
        </h3>
        <button className="text-sm text-gray-400 hover:text-neon-green transition-colors flex items-center gap-1">
          View All <ChevronDown className="w-4 h-4 -rotate-90" />
        </button>
      </div>
      
      <div className="flex overflow-x-auto pb-8 px-4 md:px-8 gap-6 snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {shows.map((show) => (
          <div key={show.id} className="min-w-[220px] w-[220px] snap-center group cursor-pointer" onClick={() => onSelectSeries(show.id)}>
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-900 mb-3 border border-white/5 group-hover:border-neon-green/50 transition-all duration-300 shadow-lg group-hover:shadow-[0_0_20px_rgba(57,255,20,0.15)]">
              <img src={show.image} alt={show.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
              
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded flex items-center gap-1 border border-white/10">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold">{show.rating}</span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                <div className="w-12 h-12 rounded-full bg-neon-green flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-100 shadow-[0_0_15px_#39ff14]">
                  <Play className="w-5 h-5 text-black fill-black ml-1" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-lg truncate group-hover:text-neon-green transition-colors">{show.title}</h4>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <span>{show.year}</span>
                <span className="border border-gray-700 px-1 rounded text-[10px] bg-gray-800 text-gray-300 border-none">{show.seasons}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface TVSeriesPageProps {
  onSelectSeries: (seriesId: string) => void;
}

const TVSeriesPage: React.FC<TVSeriesPageProps> = ({ onSelectSeries }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dbShows, setDbShows] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch TV series from database on mount
  useEffect(() => {
    const loadTVShows = async () => {
      try {
        const shows = await fetchContent('published', 'TV Series');
        setDbShows(shows);
      } catch (error) {
        console.error('Error loading TV series:', error);
        // Fallback to mock data on error
      } finally {
        setLoading(false);
      }
    };
    loadTVShows();
  }, []);

  // Convert database content to display format and merge with mock data
  const convertToDisplayFormat = (content: Content) => ({
    id: content.id,
    title: content.title,
    genre: content.genre,
    rating: content.rating || '4.5',
    year: content.year || '2024',
    image: content.poster_url,
    seasons: content.duration || '1 Season',
  });

  // Merge database content with mock data (database first)
  const dbShowsFormatted = dbShows.map(convertToDisplayFormat);
  const TV_DATABASE = [...dbShowsFormatted, ...MOCK_TV_DATABASE];

  // Filter data based on search
  const filteredShows = TV_DATABASE.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const sciFiShows = filteredShows.filter(m => m.genre === 'Sci-Fi');
  const dramaShows = filteredShows.filter(m => m.genre === 'Drama');
  const comedyShows = filteredShows.filter(m => m.genre === 'Comedy');
  const otherShows = filteredShows.filter(m => !['Sci-Fi', 'Drama', 'Comedy'].includes(m.genre));

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12">
      
      {/* Hero / Search Section */}
      <div className="relative w-full py-16 md:py-24 px-4 mb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-[#050505] pointer-events-none"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-neon-green/5 rounded-full blur-[120px]"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
            Binge Worthy <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-teal-400">Television</span>
          </h1>
          <p className="text-gray-400 mb-10 text-lg max-w-2xl mx-auto">
            Discover seasons that never end. From gripping dramas to hilarious sitcoms.
          </p>

          {/* Big Search Bar */}
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-500 group-focus-within:text-neon-green transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search for series, episodes, or genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-full py-4 pl-14 pr-4 text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-green/50 focus:border-neon-green/50 transition-all shadow-2xl"
            />
            <button className="absolute inset-y-2 right-2 bg-white/10 hover:bg-white/20 text-white px-6 rounded-full text-sm font-bold transition-colors">
              Search
            </button>
          </div>

          {/* Filtering Options */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-white/10 hover:border-neon-green/50 hover:text-neon-green transition-all text-sm font-medium">
              <Filter className="w-4 h-4" />
              All Genres
            </button>
            <button className="px-4 py-2 rounded-full bg-[#1a1a1a] border border-white/10 hover:border-neon-green/50 hover:text-neon-green transition-all text-sm font-medium">
              New Episodes
            </button>
            <button className="px-4 py-2 rounded-full bg-[#1a1a1a] border border-white/10 hover:border-neon-green/50 hover:text-neon-green transition-all text-sm font-medium">
              Trending Now
            </button>
            <button className="px-4 py-2 rounded-full bg-[#1a1a1a] border border-white/10 hover:border-neon-green/50 hover:text-neon-green transition-all text-sm font-medium">
              Award Winning
            </button>
          </div>
        </div>
      </div>

      {/* TV Show Catalogs */}
      <div className="max-w-7xl mx-auto space-y-8">
        {searchQuery && filteredShows.length === 0 ? (
            <div className="text-center py-20">
                <h3 className="text-xl text-gray-500">No TV series found for "{searchQuery}"</h3>
            </div>
        ) : (
            <>
                {(!searchQuery || sciFiShows.length > 0) && <CategorySection title="Futuristic Worlds" shows={sciFiShows.length ? sciFiShows : TV_DATABASE.filter(m => m.genre === 'Sci-Fi')} onSelectSeries={onSelectSeries} />}
                {(!searchQuery || dramaShows.length > 0) && <CategorySection title="Intense Dramas" shows={dramaShows.length ? dramaShows : TV_DATABASE.filter(m => m.genre === 'Drama')} onSelectSeries={onSelectSeries} />}
                {(!searchQuery || comedyShows.length > 0) && <CategorySection title="Comedy Central" shows={comedyShows.length ? comedyShows : TV_DATABASE.filter(m => m.genre === 'Comedy')} onSelectSeries={onSelectSeries} />}
                {(!searchQuery || otherShows.length > 0) && <CategorySection title="Staff Picks" shows={otherShows.length ? otherShows : TV_DATABASE.filter(m => !['Sci-Fi', 'Drama', 'Comedy'].includes(m.genre))} onSelectSeries={onSelectSeries} />}
            </>
        )}
      </div>

    </div>
  );
};

export default TVSeriesPage;
