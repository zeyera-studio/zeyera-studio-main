import React, { useEffect, useState } from 'react';
import { ShoppingBag, Play, Film, Tv, Calendar, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserPurchases } from '../lib/purchaseService';
import { Purchase } from '../types';

interface MyPurchasesPageProps {
  onNavigate: (page: string, contentId?: string) => void;
}

type FilterType = 'all' | 'movies' | 'tvseries';

export const MyPurchasesPage: React.FC<MyPurchasesPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const loadPurchases = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const data = await getUserPurchases(user.id);
        setPurchases(data);
      } catch (error) {
        console.error('Error loading purchases:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPurchases();
  }, [user]);

  const filteredPurchases = purchases.filter((purchase) => {
    if (filter === 'all') return true;
    const contentType = (purchase.content as any)?.content_type;
    if (filter === 'movies') return contentType === 'Movie';
    if (filter === 'tvseries') return contentType === 'TV Series';
    return true;
  });

  const handleWatch = (purchase: Purchase) => {
    const contentType = (purchase.content as any)?.content_type;
    if (contentType === 'Movie') {
      onNavigate('movieDetail', purchase.content_id);
    } else {
      onNavigate('tvDetail', purchase.content_id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black pt-20 px-4">
        <div className="max-w-4xl mx-auto text-center py-20">
          <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Please Log In</h2>
          <p className="text-gray-400">Log in to view your purchased content.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-neon-green" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-white">My Purchases</h1>
              <p className="text-gray-400">Your purchased movies and TV series</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-neon-green text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All ({purchases.length})
          </button>
          <button
            onClick={() => setFilter('movies')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              filter === 'movies'
                ? 'bg-neon-green text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Film size={18} />
            Movies
          </button>
          <button
            onClick={() => setFilter('tvseries')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              filter === 'tvseries'
                ? 'bg-neon-green text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Tv size={18} />
            TV Series
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-neon-green animate-spin" />
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="text-center py-20 bg-dark-gray rounded-xl">
            <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No Purchases Yet</h2>
            <p className="text-gray-400 mb-6">
              {filter === 'all'
                ? "You haven't purchased any content yet."
                : `You haven't purchased any ${filter === 'movies' ? 'movies' : 'TV series'} yet.`}
            </p>
            <button
              onClick={() => onNavigate(filter === 'tvseries' ? 'tvseries' : 'movies')}
              className="bg-neon-green text-black px-6 py-2 rounded-lg font-medium hover:bg-neon-green/80 transition-all"
            >
              Browse Content
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPurchases.map((purchase) => {
              const content = purchase.content as any;
              if (!content) return null;

              return (
                <div
                  key={purchase.id}
                  className="bg-dark-gray rounded-xl overflow-hidden border border-gray-800 hover:border-neon-green/50 transition-all group"
                >
                  {/* Poster */}
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={content.poster_url}
                      alt={content.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                      <button
                        onClick={() => handleWatch(purchase)}
                        className="bg-neon-green text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-neon-green/80 transition-all"
                      >
                        <Play size={18} fill="currentColor" />
                        Watch
                      </button>
                    </div>
                    {/* Content Type Badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        content.content_type === 'Movie'
                          ? 'bg-blue-500/80 text-white'
                          : 'bg-purple-500/80 text-white'
                      }`}>
                        {content.content_type}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-white font-semibold truncate">{content.title}</h3>
                    {purchase.season_number && (
                      <p className="text-neon-green text-sm">Season {purchase.season_number}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-gray-400 text-sm">
                      <Calendar size={14} />
                      {formatDate(purchase.purchased_at)}
                    </div>
                    <div className="mt-2 text-gray-400 text-sm">
                      Rs. {purchase.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPurchasesPage;
