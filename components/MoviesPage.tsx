import React, { useState } from 'react';
import { Search, Filter, Star, Play, Info, ChevronDown } from 'lucide-react';

// Extended mock data for the movies page to populate categories
const MOVIE_DATABASE = [
  { id: 'm1', title: 'Cyber Strike', genre: 'Action', rating: '4.8', year: '2024', image: 'https://images.unsplash.com/photo-1535016120720-40c6874c3b13?q=80&w=800&auto=format&fit=crop' },
  { id: 'm2', title: 'The Last Duel', genre: 'Action', rating: '4.5', year: '2023', image: 'https://images.unsplash.com/photo-1596727147705-5d353c6805a5?q=80&w=800&auto=format&fit=crop' },
  { id: 'm3', title: 'Speed Demon', genre: 'Action', rating: '4.2', year: '2024', image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=800&auto=format&fit=crop' },
  { id: 'm4', title: 'Agent Zero', genre: 'Action', rating: '4.9', year: '2025', image: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=800&auto=format&fit=crop' },
  
  { id: 'c1', title: 'Love & Laughter', genre: 'Comedy', rating: '4.3', year: '2023', image: 'https://images.unsplash.com/photo-1517604931442-7105376f2fa3?q=80&w=800&auto=format&fit=crop' },
  { id: 'c2', title: 'Office Chaos', genre: 'Comedy', rating: '4.1', year: '2022', image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800&auto=format&fit=crop' },
  { id: 'c3', title: 'Summer Break', genre: 'Comedy', rating: '4.0', year: '2024', image: 'https://images.unsplash.com/photo-1562131625-a897b5e64003?q=80&w=800&auto=format&fit=crop' },
  { id: 'c4', title: 'The Stand Up', genre: 'Comedy', rating: '4.6', year: '2023', image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?q=80&w=800&auto=format&fit=crop' },

  { id: 'r1', title: 'Parisian Nights', genre: 'Romance', rating: '4.7', year: '2021', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop' },
  { id: 'r2', title: 'Forever Yours', genre: 'Romance', rating: '4.4', year: '2023', image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop' },
  { id: 'r3', title: 'Sunset Promise', genre: 'Romance', rating: '4.2', year: '2022', image: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=800&auto=format&fit=crop' },
  { id: 'r4', title: 'Heartstrings', genre: 'Romance', rating: '4.5', year: '2024', image: 'https://images.unsplash.com/photo-1516589178581-a7870abd2146?q=80&w=800&auto=format&fit=crop' },
  
  { id: 's1', title: 'Star Voyager', genre: 'Sci-Fi', rating: '4.9', year: '2025', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop' },
  { id: 's2', title: 'Robot Wars', genre: 'Sci-Fi', rating: '4.3', year: '2021', image: 'https://images.unsplash.com/photo-1531297461136-82 LW39a21c9c6?q=80&w=800&auto=format&fit=crop' }, // Fixed URL manually
  { id: 's3', title: 'Neural Net', genre: 'Sci-Fi', rating: '4.6', year: '2024', image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop' },
];

const CategorySection: React.FC<{ title: string; movies: typeof MOVIE_DATABASE }> = ({ title, movies }) => {
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
        {movies.map((movie) => (
          <div key={movie.id} className="min-w-[220px] w-[220px] snap-center group cursor-pointer">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-900 mb-3 border border-white/5 group-hover:border-neon-green/50 transition-all duration-300 shadow-lg group-hover:shadow-[0_0_20px_rgba(57,255,20,0.15)]">
              <img src={movie.image} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
              
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded flex items-center gap-1 border border-white/10">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold">{movie.rating}</span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                <div className="w-12 h-12 rounded-full bg-neon-green flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-100 shadow-[0_0_15px_#39ff14]">
                  <Play className="w-5 h-5 text-black fill-black ml-1" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-lg truncate group-hover:text-neon-green transition-colors">{movie.title}</h4>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <span>{movie.year}</span>
                <span className="border border-gray-700 px-1 rounded text-[10px]">HD</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MoviesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter data based on search
  const filteredMovies = MOVIE_DATABASE.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const actionMovies = filteredMovies.filter(m => m.genre === 'Action');
  const comedyMovies = filteredMovies.filter(m => m.genre === 'Comedy');
  const romanceMovies = filteredMovies.filter(m => m.genre === 'Romance');
  const sciFiMovies = filteredMovies.filter(m => m.genre === 'Sci-Fi');

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12">
      
      {/* Hero / Search Section */}
      <div className="relative w-full py-16 md:py-24 px-4 mb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/10 to-[#050505] pointer-events-none"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-neon-green/5 rounded-full blur-[120px]"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
            Find Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-emerald-400">Obsession</span>
          </h1>
          <p className="text-gray-400 mb-10 text-lg max-w-2xl mx-auto">
            Explore our vast library of movies, from heart-pounding action to tear-jerking romance.
          </p>

          {/* Big Search Bar */}
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-500 group-focus-within:text-neon-green transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search for movies, genres, or actors..."
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
              Latest Release
            </button>
            <button className="px-4 py-2 rounded-full bg-[#1a1a1a] border border-white/10 hover:border-neon-green/50 hover:text-neon-green transition-all text-sm font-medium">
              Top Rated
            </button>
            <button className="px-4 py-2 rounded-full bg-[#1a1a1a] border border-white/10 hover:border-neon-green/50 hover:text-neon-green transition-all text-sm font-medium">
              4K HDR
            </button>
          </div>
        </div>
      </div>

      {/* Movie Catalogs */}
      <div className="w-full space-y-8">
        {searchQuery && filteredMovies.length === 0 ? (
            <div className="text-center py-20">
                <h3 className="text-xl text-gray-500">No movies found for "{searchQuery}"</h3>
            </div>
        ) : (
            <>
                {(!searchQuery || actionMovies.length > 0) && <CategorySection title="Action Packed" movies={actionMovies.length ? actionMovies : MOVIE_DATABASE.filter(m => m.genre === 'Action')} />}
                {(!searchQuery || comedyMovies.length > 0) && <CategorySection title="Laugh Out Loud" movies={comedyMovies.length ? comedyMovies : MOVIE_DATABASE.filter(m => m.genre === 'Comedy')} />}
                {(!searchQuery || romanceMovies.length > 0) && <CategorySection title="Romantic Getaways" movies={romanceMovies.length ? romanceMovies : MOVIE_DATABASE.filter(m => m.genre === 'Romance')} />}
                {(!searchQuery || sciFiMovies.length > 0) && <CategorySection title="Sci-Fi Dimensions" movies={sciFiMovies.length ? sciFiMovies : MOVIE_DATABASE.filter(m => m.genre === 'Sci-Fi')} />}
            </>
        )}
      </div>

    </div>
  );
};

export default MoviesPage;