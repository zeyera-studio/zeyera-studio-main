import React, { useState, useEffect } from 'react';
import { Play, Clock, ArrowLeft, Film } from 'lucide-react';
import { Content, Episode } from '../types';
import { fetchEpisodesBySeason } from '../lib/episodeService';
import VideoPlayerModal from './VideoPlayerModal';

interface SeasonEpisodesPageProps {
  series: Content;
  seasonNumber: number;
  onBack: () => void;
}

const SeasonEpisodesPage: React.FC<SeasonEpisodesPageProps> = ({ 
  series, 
  seasonNumber, 
  onBack 
}) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlayerOpen, setPlayerOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    loadEpisodes();
  }, [series.id, seasonNumber]);

  const loadEpisodes = async () => {
    setLoading(true);
    setError('');
    try {
      const episodesData = await fetchEpisodesBySeason(series.id, seasonNumber);
      // Only show published episodes
      const publishedEpisodes = episodesData.filter(ep => ep.status === 'published');
      setEpisodes(publishedEpisodes);
    } catch (err: any) {
      console.error('Error loading episodes:', err);
      setError(err.message || 'Failed to load episodes');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayEpisode = (episode: Episode) => {
    setSelectedEpisode(episode);
    setPlayerOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pt-24 px-4">
        <div className="max-w-7xl mx-auto text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-neon-green border-t-transparent"></div>
          <p className="text-white mt-4">Loading episodes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] pt-24 px-4">
        <div className="max-w-7xl mx-auto text-center py-20">
          <p className="text-red-500 text-xl mb-4">{error}</p>
          <button onClick={onBack} className="text-neon-green hover:underline">
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
          Back to {series.title}
        </button>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-6">
          <img
            src={series.poster_url}
            alt={series.title}
            className="w-32 h-48 object-cover rounded-xl shadow-lg border border-white/10"
          />
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{series.title}</h1>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-neon-green">Season {seasonNumber}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">{episodes.length} Episodes</span>
            </div>
            <p className="text-gray-400 mt-2">{series.genre} • {series.year}</p>
          </div>
        </div>
      </div>

      {/* Episodes Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Film className="text-neon-green" size={24} />
          All Episodes
        </h2>

        {episodes.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-12 text-center">
            <p className="text-gray-400">No episodes available for this season yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {episodes.map((episode) => (
              <div
                key={episode.id}
                className="bg-[#111] border border-white/10 rounded-xl overflow-hidden hover:border-neon-green/50 transition-all group cursor-pointer"
                onClick={() => handlePlayEpisode(episode)}
              >
                {/* Episode Thumbnail */}
                <div className="relative aspect-video bg-gray-900">
                  <img
                    src={episode.thumbnail_url || series.poster_url}
                    alt={episode.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-neon-green flex items-center justify-center">
                      <Play size={32} className="text-black ml-1" fill="currentColor" />
                    </div>
                  </div>
                  {/* Episode Number Badge */}
                  <div className="absolute top-3 left-3 bg-black/80 px-3 py-1 rounded-full">
                    <span className="text-neon-green font-bold text-sm">
                      E{episode.episode_number.toString().padStart(2, '0')}
                    </span>
                  </div>
                  {/* Duration Badge */}
                  {episode.duration && (
                    <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded flex items-center gap-1">
                      <Clock size={12} className="text-gray-400" />
                      <span className="text-gray-300 text-xs">{episode.duration}</span>
                    </div>
                  )}
                </div>

                {/* Episode Info */}
                <div className="p-4">
                  <h3 className="text-white font-bold mb-2 line-clamp-1">
                    {episode.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {episode.description}
                  </p>
                </div>

                {/* Watch Button */}
                <div className="px-4 pb-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayEpisode(episode);
                    }}
                    className="w-full bg-neon-green text-black py-2 rounded-lg font-bold hover:bg-neon-green/80 transition-colors flex items-center justify-center gap-2"
                  >
                    <Play size={18} fill="currentColor" />
                    Watch Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {selectedEpisode && (
        <VideoPlayerModal
          isOpen={isPlayerOpen}
          videoUrl={selectedEpisode.video_url}
          title={`${series.title} - S${seasonNumber.toString().padStart(2, '0')}E${selectedEpisode.episode_number.toString().padStart(2, '0')}: ${selectedEpisode.title}`}
          onClose={() => {
            setPlayerOpen(false);
            setSelectedEpisode(null);
          }}
        />
      )}
    </div>
  );
};

export default SeasonEpisodesPage;
