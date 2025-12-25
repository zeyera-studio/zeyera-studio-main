import React, { useState, useEffect } from 'react';
import { Play, Clock, Star, Calendar, Globe, Film, Users, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Content, Episode, SeasonGroup } from '../types';
import { supabase } from '../lib/supabaseClient';
import { fetchEpisodesBySeries } from '../lib/episodeService';
import VideoPlayerModal from './VideoPlayerModal';
import CommentsSection from './CommentsSection';

interface TVSeriesDetailPageProps {
  seriesId: string;
  onBack: () => void;
}

const TVSeriesDetailPage: React.FC<TVSeriesDetailPageProps> = ({ seriesId, onBack }) => {
  const [series, setSeries] = useState<Content | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [seasonGroups, setSeasonGroups] = useState<SeasonGroup[]>([]);
  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(new Set([1])); // First season expanded by default
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlayerOpen, setPlayerOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    loadSeriesData();
  }, [seriesId]);

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

      // Load episodes
      const episodesData = await fetchEpisodesBySeries(seriesId, 'published');
      setEpisodes(episodesData);

      // Group episodes by season
      const grouped = groupEpisodesBySeason(episodesData);
      setSeasonGroups(grouped);
    } catch (err: any) {
      console.error('Error loading TV series:', err);
      setError(err.message || 'Failed to load TV series');
    } finally {
      setLoading(false);
    }
  };

  const groupEpisodesBySeason = (episodes: Episode[]): SeasonGroup[] => {
    const groups: SeasonGroup[] = [];
    
    episodes.forEach(episode => {
      const existingGroup = groups.find(g => g.seasonNumber === episode.season_number);
      if (existingGroup) {
        existingGroup.episodes.push(episode);
      } else {
        groups.push({
          seasonNumber: episode.season_number,
          episodes: [episode]
        });
      }
    });

    // Sort seasons and episodes
    groups.sort((a, b) => a.seasonNumber - b.seasonNumber);
    groups.forEach(group => {
      group.episodes.sort((a, b) => a.episode_number - b.episode_number);
    });

    return groups;
  };

  const toggleSeason = (seasonNumber: number) => {
    const newExpanded = new Set(expandedSeasons);
    if (newExpanded.has(seasonNumber)) {
      newExpanded.delete(seasonNumber);
    } else {
      newExpanded.add(seasonNumber);
    }
    setExpandedSeasons(newExpanded);
  };

  const handlePlayEpisode = (episode: Episode) => {
    setSelectedEpisode(episode);
    setPlayerOpen(true);
  };

  const extractYouTubeId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

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
                {seasonGroups.length > 0 && (
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                    {seasonGroups.length} Season{seasonGroups.length !== 1 ? 's' : ''}
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

        {/* Episodes Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Episodes</h2>
          
          {seasonGroups.length === 0 ? (
            <div className="bg-white/5 rounded-lg p-8 text-center">
              <p className="text-gray-400">No episodes available yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {seasonGroups.map((seasonGroup) => (
                <div key={seasonGroup.seasonNumber} className="bg-white/5 rounded-lg overflow-hidden">
                  {/* Season Header */}
                  <button
                    onClick={() => toggleSeason(seasonGroup.seasonNumber)}
                    className="w-full flex items-center justify-between p-6 hover:bg-white/10 transition-colors"
                  >
                    <h3 className="text-xl font-bold text-white">
                      Season {seasonGroup.seasonNumber}
                      <span className="text-gray-400 text-sm ml-3">
                        ({seasonGroup.episodes.length} episode{seasonGroup.episodes.length !== 1 ? 's' : ''})
                      </span>
                    </h3>
                    {expandedSeasons.has(seasonGroup.seasonNumber) ? (
                      <ChevronUp className="text-neon-green" size={24} />
                    ) : (
                      <ChevronDown className="text-gray-400" size={24} />
                    )}
                  </button>

                  {/* Episodes List */}
                  {expandedSeasons.has(seasonGroup.seasonNumber) && (
                    <div className="border-t border-white/10">
                      {seasonGroup.episodes.map((episode) => (
                        <div
                          key={episode.id}
                          className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                        >
                          {/* Episode Thumbnail */}
                          <div className="relative w-40 h-24 flex-shrink-0 bg-white/10 rounded overflow-hidden group cursor-pointer"
                            onClick={() => handlePlayEpisode(episode)}
                          >
                            <img
                              src={episode.thumbnail_url || series.poster_url}
                              alt={episode.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play size={32} className="text-neon-green" fill="currentColor" />
                            </div>
                          </div>

                          {/* Episode Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-neon-green font-semibold">
                                S{episode.season_number.toString().padStart(2, '0')}E{episode.episode_number.toString().padStart(2, '0')}
                              </span>
                              {episode.duration && (
                                <span className="text-gray-400 text-sm flex items-center gap-1">
                                  <Clock size={14} />
                                  {episode.duration}
                                </span>
                              )}
                            </div>
                            <h4 className="text-white font-semibold mb-1 truncate">
                              {episode.title}
                            </h4>
                            <p className="text-gray-400 text-sm line-clamp-2">
                              {episode.description}
                            </p>
                          </div>

                          {/* Watch Button */}
                          <button
                            onClick={() => handlePlayEpisode(episode)}
                            className="px-4 py-2 bg-neon-green text-black rounded-lg font-semibold hover:bg-neon-green/80 transition-colors flex items-center gap-2 flex-shrink-0"
                          >
                            <Play size={16} fill="currentColor" />
                            Watch
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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

      {/* Video Player Modal */}
      {selectedEpisode && (
        <VideoPlayerModal
          isOpen={isPlayerOpen}
          videoUrl={selectedEpisode.video_url}
          title={`${series.title} - S${selectedEpisode.season_number.toString().padStart(2, '0')}E${selectedEpisode.episode_number.toString().padStart(2, '0')}: ${selectedEpisode.title}`}
          onClose={() => {
            setPlayerOpen(false);
            setSelectedEpisode(null);
          }}
        />
      )}
    </div>
  );
};

export default TVSeriesDetailPage;

