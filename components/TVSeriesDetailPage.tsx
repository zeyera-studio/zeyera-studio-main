import React, { useState, useEffect } from 'react';
import { Play, Clock, Star, Calendar, Globe, Film, Users, ArrowLeft, Lock, ShoppingCart } from 'lucide-react';
import { Content, Episode, SeasonPrice } from '../types';
import { supabase } from '../lib/supabaseClient';
import { fetchEpisodesBySeries } from '../lib/episodeService';
import { useAuth } from '../contexts/AuthContext';
import { getUserPurchasedSeasons } from '../lib/purchaseService';
import { getSeasonPrices } from '../lib/pricingService';
import CommentsSection from './CommentsSection';
import PurchaseModal from './PurchaseModal';
import SeasonEpisodesPage from './SeasonEpisodesPage';

interface TVSeriesDetailPageProps {
  seriesId: string;
  onBack: () => void;
}

interface SeasonInfo {
  seasonNumber: number;
  episodeCount: number;
  price: number;
  isPurchased: boolean;
  isFree: boolean;
}

const TVSeriesDetailPage: React.FC<TVSeriesDetailPageProps> = ({ seriesId, onBack }) => {
  const { user, isAdmin } = useAuth();
  const [series, setSeries] = useState<Content | null>(null);
  const [seasons, setSeasons] = useState<SeasonInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Purchase Modal State
  const [isPurchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [selectedSeasonForPurchase, setSelectedSeasonForPurchase] = useState<number | null>(null);
  const [selectedSeasonPrice, setSelectedSeasonPrice] = useState(0);
  
  // Season Episodes Page State
  const [viewingSeason, setViewingSeason] = useState<number | null>(null);

  useEffect(() => {
    loadSeriesData();
  }, [seriesId, user, isAdmin]);

  const loadSeriesData = async () => {
    setLoading(true);
    setError('');
    try {
      // Load series info
      const { data: seriesData, error: seriesError } = await supabase
        .from('content')
        .select('*')
        .eq('id', seriesId)
        .eq('content_type', 'TV Series')
        .single();

      if (seriesError) throw seriesError;

      if (!seriesData) {
        setError('TV Series not found');
        return;
      }

      setSeries(seriesData as Content);

      // Load all episodes to get season info
      const allEpisodes = await fetchEpisodesBySeries(seriesId, 'published');
      
      // Group episodes by season
      const seasonMap = new Map<number, number>();
      allEpisodes.forEach(ep => {
        const count = seasonMap.get(ep.season_number) || 0;
        seasonMap.set(ep.season_number, count + 1);
      });

      // Load season prices
      const prices = await getSeasonPrices(seriesId);
      const priceMap: Record<number, number> = {};
      prices.forEach((sp: SeasonPrice) => {
        priceMap[sp.season_number] = sp.price;
      });

      // Load purchased seasons for user
      let purchasedSeasons: number[] = [];
      if (isAdmin) {
        purchasedSeasons = Array.from(seasonMap.keys());
      } else if (user) {
        purchasedSeasons = await getUserPurchasedSeasons(seriesId, user.id);
      }

      // Build season info array
      const seasonInfos: SeasonInfo[] = [];
      seasonMap.forEach((episodeCount, seasonNumber) => {
        const price = priceMap[seasonNumber] ?? (seriesData.price || 0);
        const isFree = price === 0;
        const isPurchased = isAdmin || isFree || purchasedSeasons.includes(seasonNumber);
        
        seasonInfos.push({
          seasonNumber,
          episodeCount,
          price,
          isPurchased,
          isFree
        });
      });

      // Sort by season number
      seasonInfos.sort((a, b) => a.seasonNumber - b.seasonNumber);
      setSeasons(seasonInfos);

    } catch (err: any) {
      console.error('Error loading TV series:', err);
      setError(err.message || 'Failed to load TV series');
    } finally {
      setLoading(false);
    }
  };

  const handleSeasonClick = (season: SeasonInfo) => {
    if (season.isPurchased) {
      // User has access - go to episodes page
      setViewingSeason(season.seasonNumber);
    } else {
      // User needs to purchase - show modal
      setSelectedSeasonForPurchase(season.seasonNumber);
      setSelectedSeasonPrice(season.price);
      setPurchaseModalOpen(true);
    }
  };

  const extractYouTubeId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // If viewing a season's episodes, show that page
  if (viewingSeason !== null && series) {
    return (
      <SeasonEpisodesPage
        series={series}
        seasonNumber={viewingSeason}
        onBack={() => {
          setViewingSeason(null);
          // Reload data in case purchase was made
          loadSeriesData();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pt-24 px-4">
        <div className="max-w-7xl mx-auto text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-neon-green border-t-transparent"></div>
          <p className="text-white mt-4">Loading TV series...</p>
        </div>
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="min-h-screen bg-[#050505] pt-24 px-4">
        <div className="max-w-7xl mx-auto text-center py-20">
          <p className="text-red-500 text-xl mb-4">{error || 'TV Series not found'}</p>
          <button
            onClick={onBack}
            className="text-neon-green hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-20">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-neon-green transition-colors"
        >
          <ArrowLeft size={20} />
          Back to TV Series
        </button>
      </div>

      {/* Hero Section with Poster */}
      <div className="relative h-[60vh] overflow-hidden">
        {/* Background Image with Gradient */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${series.poster_url})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative h-full max-w-7xl mx-auto px-4 flex items-end pb-12">
          <div className="flex gap-8 items-end">
            {/* Poster */}
            <img
              src={series.poster_url}
              alt={series.title}
              className="w-64 h-96 object-cover rounded-xl shadow-2xl border-2 border-neon-green/30 hidden md:block"
            />

            {/* Info */}
            <div className="flex-1 pb-4">
              <h1 className="text-5xl font-bold text-white mb-4">
                {series.title}
              </h1>
              
              {/* Metadata Row */}
              <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-6">
                {series.year && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-neon-green" />
                    <span>{series.year}</span>
                  </div>
                )}
                {series.rating && (
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-neon-green" />
                    <span>{series.rating}</span>
                  </div>
                )}
                {series.quality && (
                  <span className="px-3 py-1 bg-neon-green/20 text-neon-green rounded-full text-sm font-semibold">
                    {series.quality}
                  </span>
                )}
                {series.language && (
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-neon-green" />
                    <span>{series.language}</span>
                  </div>
                )}
                {seasons.length > 0 && (
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                    {seasons.length} Season{seasons.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Genre */}
              <div className="mb-6">
                <span className="px-4 py-2 bg-white/10 rounded-full text-white">
                  {series.genre}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        {/* Description */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Synopsis</h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            {series.description}
          </p>
        </div>

        {/* Additional Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {series.director && (
            <div className="bg-white/5 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Film size={20} className="text-neon-green" />
                <h3 className="text-lg font-semibold text-white">Creator</h3>
              </div>
              <p className="text-gray-300">{series.director}</p>
            </div>
          )}

          {series.cast_members && series.cast_members.length > 0 && (
            <div className="bg-white/5 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Users size={20} className="text-neon-green" />
                <h3 className="text-lg font-semibold text-white">Cast</h3>
              </div>
              <p className="text-gray-300">{series.cast_members.join(', ')}</p>
            </div>
          )}
        </div>

        {/* Seasons Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Seasons</h2>
          
          {seasons.length === 0 ? (
            <div className="bg-white/5 rounded-lg p-8 text-center">
              <p className="text-gray-400">No seasons available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {seasons.map((season) => (
                <div
                  key={season.seasonNumber}
                  onClick={() => handleSeasonClick(season)}
                  className={`relative bg-[#111] border rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105 hover:shadow-xl ${
                    season.isPurchased 
                      ? 'border-neon-green/30 hover:border-neon-green' 
                      : 'border-white/10 hover:border-yellow-500/50'
                  }`}
                >
                  {/* Season Image */}
                  <div className="relative aspect-[2/3] bg-gray-900">
                    <img
                      src={series.poster_url}
                      alt={`Season ${season.seasonNumber}`}
                      className={`w-full h-full object-cover ${!season.isPurchased ? 'opacity-60' : ''}`}
                    />
                    
                    {/* Overlay for locked seasons */}
                    {!season.isPurchased && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center">
                          <Lock size={48} className="text-yellow-500 mx-auto mb-2" />
                          <p className="text-white font-bold">Locked</p>
                        </div>
                      </div>
                    )}

                    {/* Play overlay for unlocked seasons */}
                    {season.isPurchased && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 rounded-full bg-neon-green flex items-center justify-center">
                          <Play size={32} className="text-black ml-1" fill="currentColor" />
                        </div>
                      </div>
                    )}

                    {/* Season Badge */}
                    <div className="absolute top-3 left-3 bg-black/80 px-3 py-1 rounded-full">
                      <span className="text-neon-green font-bold">Season {season.seasonNumber}</span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {season.isFree ? (
                        <span className="bg-neon-green text-black px-2 py-1 rounded-full text-xs font-bold">
                          FREE
                        </span>
                      ) : season.isPurchased ? (
                        <span className="bg-neon-green text-black px-2 py-1 rounded-full text-xs font-bold">
                          OWNED
                        </span>
                      ) : (
                        <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                          Rs. {season.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Season Info */}
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-white mb-1">
                      Season {season.seasonNumber}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">
                      {season.episodeCount} Episode{season.episodeCount !== 1 ? 's' : ''}
                    </p>

                    {/* Action Button */}
                    {season.isPurchased ? (
                      <button className="w-full bg-neon-green text-black py-2 rounded-lg font-bold hover:bg-neon-green/80 transition-colors flex items-center justify-center gap-2">
                        <Play size={18} fill="currentColor" />
                        Watch Now
                      </button>
                    ) : (
                      <button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black py-2 rounded-lg font-bold hover:from-yellow-400 hover:to-orange-400 transition-colors flex items-center justify-center gap-2">
                        <ShoppingCart size={18} />
                        Buy Rs. {season.price.toLocaleString()}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trailer Section */}
        {series.trailer_url && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Trailer</h2>
            <div className="aspect-video bg-black rounded-xl overflow-hidden">
              {extractYouTubeId(series.trailer_url) ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${extractYouTubeId(series.trailer_url)}`}
                  title="Series Trailer"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={series.trailer_url}
                  controls
                  className="w-full h-full"
                />
              )}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <CommentsSection contentId={series.id} />
      </div>

      {/* Purchase Modal */}
      {series && selectedSeasonForPurchase !== null && (
        <PurchaseModal
          isOpen={isPurchaseModalOpen}
          content={series}
          seasonNumber={selectedSeasonForPurchase}
          price={selectedSeasonPrice}
          onClose={() => {
            setPurchaseModalOpen(false);
            setSelectedSeasonForPurchase(null);
            // Reload data in case purchase was made
            loadSeriesData();
          }}
        />
      )}
    </div>
  );
};

export default TVSeriesDetailPage;
