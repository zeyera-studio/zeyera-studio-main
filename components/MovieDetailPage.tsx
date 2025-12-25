import React, { useState, useEffect } from 'react';
import { Play, Clock, Star, Calendar, Globe, Film, Users, ArrowLeft } from 'lucide-react';
import { Content } from '../types';
import { supabase } from '../lib/supabaseClient';
import VideoPlayerModal from './VideoPlayerModal';
import CommentsSection from './CommentsSection';

interface MovieDetailPageProps {
  movieId: string;
  onBack: () => void;
}

const MovieDetailPage: React.FC<MovieDetailPageProps> = ({ movieId, onBack }) => {
  const [movie, setMovie] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlayerOpen, setPlayerOpen] = useState(false);

  useEffect(() => {
    loadMovie();
  }, [movieId]);

  const loadMovie = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('id', movieId)
        .eq('content_type', 'Movie')
        .single();

      if (error) throw error;

      if (!data) {
        setError('Movie not found');
        return;
      }

      setMovie(data as Content);
    } catch (err: any) {
      console.error('Error loading movie:', err);
      setError(err.message || 'Failed to load movie');
    } finally {
      setLoading(false);
    }
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
          <p className="text-white mt-4">Loading movie...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#050505] pt-24 px-4">
        <div className="max-w-7xl mx-auto text-center py-20">
          <p className="text-red-500 text-xl mb-4">{error || 'Movie not found'}</p>
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
          Back to Movies
        </button>
      </div>

      {/* Hero Section with Poster */}
      <div className="relative h-[60vh] overflow-hidden">
        {/* Background Image with Gradient */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${movie.poster_url})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative h-full max-w-7xl mx-auto px-4 flex items-end pb-12">
          <div className="flex gap-8 items-end">
            {/* Poster */}
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="w-64 h-96 object-cover rounded-xl shadow-2xl border-2 border-neon-green/30 hidden md:block"
            />

            {/* Info */}
            <div className="flex-1 pb-4">
              <h1 className="text-5xl font-bold text-white mb-4">
                {movie.title}
              </h1>
              
              {/* Metadata Row */}
              <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-6">
                {movie.year && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-neon-green" />
                    <span>{movie.year}</span>
                  </div>
                )}
                {movie.duration && (
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-neon-green" />
                    <span>{movie.duration}</span>
                  </div>
                )}
                {movie.rating && (
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-neon-green" />
                    <span>{movie.rating}</span>
                  </div>
                )}
                {movie.quality && (
                  <span className="px-3 py-1 bg-neon-green/20 text-neon-green rounded-full text-sm font-semibold">
                    {movie.quality}
                  </span>
                )}
                {movie.language && (
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-neon-green" />
                    <span>{movie.language}</span>
                  </div>
                )}
              </div>

              {/* Genre */}
              <div className="mb-6">
                <span className="px-4 py-2 bg-white/10 rounded-full text-white">
                  {movie.genre}
                </span>
              </div>

              {/* Watch Now Button */}
              {movie.video_url && (
                <button
                  onClick={() => setPlayerOpen(true)}
                  className="bg-neon-green text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-neon-green/80 transition-all hover:scale-105 flex items-center gap-3 shadow-lg shadow-neon-green/30"
                >
                  <Play size={24} fill="currentColor" />
                  Watch Now
                </button>
              )}
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
            {movie.description}
          </p>
        </div>

        {/* Additional Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {movie.director && (
            <div className="bg-white/5 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Film size={20} className="text-neon-green" />
                <h3 className="text-lg font-semibold text-white">Director</h3>
              </div>
              <p className="text-gray-300">{movie.director}</p>
            </div>
          )}

          {movie.cast_members && movie.cast_members.length > 0 && (
            <div className="bg-white/5 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Users size={20} className="text-neon-green" />
                <h3 className="text-lg font-semibold text-white">Cast</h3>
              </div>
              <p className="text-gray-300">{movie.cast_members.join(', ')}</p>
            </div>
          )}
        </div>

        {/* Trailer Section */}
        {movie.trailer_url && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Trailer</h2>
            <div className="aspect-video bg-black rounded-xl overflow-hidden">
              {extractYouTubeId(movie.trailer_url) ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${extractYouTubeId(movie.trailer_url)}`}
                  title="Movie Trailer"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={movie.trailer_url}
                  controls
                  className="w-full h-full"
                />
              )}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <CommentsSection contentId={movie.id} />
      </div>

      {/* Video Player Modal */}
      {movie.video_url && (
        <VideoPlayerModal
          isOpen={isPlayerOpen}
          videoUrl={movie.video_url}
          title={movie.title}
          onClose={() => setPlayerOpen(false)}
        />
      )}
    </div>
  );
};

export default MovieDetailPage;

