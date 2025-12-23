import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, Film, Loader, Plus, Trash2 } from 'lucide-react';
import { ContentType, Genre, UploadProgress } from '../types';
import { uploadImage, uploadVideo, createContent } from '../lib/contentService';
import { createEpisode } from '../lib/episodeService';

interface UploadContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface EpisodeData {
  id: string;
  seasonNumber: string;
  episodeNumber: string;
  title: string;
  description: string;
  duration: string;
  videoFile: File | null;
  thumbnailFile: File | null;
  thumbnailPreview: string;
}

const UploadContentModal: React.FC<UploadContentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'Movie' | 'TV Series'>('Movie');

  // Common form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState<Genre>('Action');
  const [year, setYear] = useState('');
  const [rating, setRating] = useState('');
  const [duration, setDuration] = useState('');
  const [cast, setCast] = useState('');
  const [director, setDirector] = useState('');
  const [language, setLanguage] = useState('English');
  const [quality, setQuality] = useState('HD');
  const [trailerUrl, setTrailerUrl] = useState('');

  // File state
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // TV Series episodes state
  const [episodes, setEpisodes] = useState<EpisodeData[]>([]);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [error, setError] = useState<string>('');

  const genres: Genre[] = ['Action', 'Comedy', 'Romance', 'Sci-Fi', 'Drama', 'Horror', 'Thriller', 'Fantasy', 'Western'];

  const handlePosterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Please select a video file');
        return;
      }
      if (file.size > 500 * 1024 * 1024) {
        setError('Video must be less than 500MB');
        return;
      }
      setVideoFile(file);
      setError('');
    }
  };

  // Episode management functions
  const addEpisode = () => {
    const newEpisode: EpisodeData = {
      id: Date.now().toString(),
      seasonNumber: '1',
      episodeNumber: (episodes.length + 1).toString(),
      title: '',
      description: '',
      duration: '',
      videoFile: null,
      thumbnailFile: null,
      thumbnailPreview: '',
    };
    setEpisodes([...episodes, newEpisode]);
  };

  const removeEpisode = (id: string) => {
    setEpisodes(episodes.filter((ep) => ep.id !== id));
  };

  const updateEpisode = (id: string, field: keyof EpisodeData, value: any) => {
    setEpisodes(episodes.map((ep) => (ep.id === id ? { ...ep, [field]: value } : ep)));
  };

  const handleEpisodeVideoSelect = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Please select a video file');
        return;
      }
      if (file.size > 500 * 1024 * 1024) {
        setError('Video must be less than 500MB');
        return;
      }
      updateEpisode(id, 'videoFile', file);
      setError('');
    }
  };

  const handleEpisodeThumbnailSelect = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      updateEpisode(id, 'thumbnailFile', file);
      updateEpisode(id, 'thumbnailPreview', URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Common validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    if (!posterFile) {
      setError('Poster image is required');
      return;
    }

    if (activeTab === 'Movie') {
      await uploadMovie();
    } else {
      await uploadTVSeries();
    }
  };

  const uploadMovie = async () => {
    setIsUploading(true);

    try {
      // Upload poster image
      setUploadProgress({ poster: 0 });
      const posterUrl = await uploadImage(posterFile!, (progress) => {
        setUploadProgress((prev) => ({ ...prev, poster: progress }));
      });

      // Upload video if provided
      let videoUrl: string | undefined;
      if (videoFile) {
        setUploadProgress((prev) => ({ ...prev, video: 0 }));
        videoUrl = await uploadVideo(videoFile, (progress) => {
          setUploadProgress((prev) => ({ ...prev, video: progress }));
        });
      }

      // Create content record
      await createContent({
        title: title.trim(),
        description: description.trim(),
        content_type: 'Movie',
        genre,
        poster_url: posterUrl,
        video_url: videoUrl,
        trailer_url: trailerUrl.trim() || undefined,
        year: year.trim() || undefined,
        rating: rating.trim() || undefined,
        duration: duration.trim() || undefined,
        cast_members: cast.trim() ? cast.split(',').map((c) => c.trim()) : undefined,
        director: director.trim() || undefined,
        language,
        quality,
      });

      // Success!
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload movie');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const uploadTVSeries = async () => {
    // Validate episodes
    if (episodes.length === 0) {
      setError('Please add at least one episode');
      return;
    }

    for (const ep of episodes) {
      if (!ep.title.trim()) {
        setError(`Episode ${ep.episodeNumber}: Title is required`);
        return;
      }
      if (!ep.videoFile) {
        setError(`Episode ${ep.episodeNumber}: Video file is required`);
        return;
      }
    }

    setIsUploading(true);

    try {
      // Upload series poster
      setUploadProgress({ poster: 0 });
      const posterUrl = await uploadImage(posterFile!, (progress) => {
        setUploadProgress((prev) => ({ ...prev, poster: progress }));
      });

      // Create TV series record
      const series = await createContent({
        title: title.trim(),
        description: description.trim(),
        content_type: 'TV Series',
        genre,
        poster_url: posterUrl,
        trailer_url: trailerUrl.trim() || undefined,
        year: year.trim() || undefined,
        rating: rating.trim() || undefined,
        duration: `${episodes.length} Episodes`,
        cast_members: cast.trim() ? cast.split(',').map((c) => c.trim()) : undefined,
        director: director.trim() || undefined,
        language,
        quality,
      });

      // Upload episodes
      for (let i = 0; i < episodes.length; i++) {
        const ep = episodes[i];
        
        // Upload episode video
        const videoUrl = await uploadVideo(ep.videoFile!, (progress) => {
          setUploadProgress((prev) => ({ ...prev, [`episode-${i}-video`]: progress }));
        });

        // Upload episode thumbnail if provided
        let thumbnailUrl: string | undefined;
        if (ep.thumbnailFile) {
          thumbnailUrl = await uploadImage(ep.thumbnailFile, (progress) => {
            setUploadProgress((prev) => ({ ...prev, [`episode-${i}-thumb`]: progress }));
          });
        }

        // Create episode record
        await createEpisode({
          content_id: series.id,
          season_number: parseInt(ep.seasonNumber) || 1,
          episode_number: parseInt(ep.episodeNumber) || (i + 1),
          title: ep.title.trim(),
          description: ep.description.trim() || ep.title.trim(),
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          duration: ep.duration.trim() || undefined,
        });
      }

      // Success!
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload TV series');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setGenre('Action');
    setYear('');
    setRating('');
    setDuration('');
    setCast('');
    setDirector('');
    setLanguage('English');
    setQuality('HD');
    setTrailerUrl('');
    setPosterFile(null);
    setPosterPreview('');
    setVideoFile(null);
    setEpisodes([]);
    setError('');
    setActiveTab('Movie');
  };

  const handleClose = () => {
    if (!isUploading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with Tabs */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Upload Content</h2>
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('Movie')}
              disabled={isUploading}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'Movie'
                  ? 'bg-neon-green text-black'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              } disabled:opacity-50`}
            >
              Movie
            </button>
            <button
              onClick={() => setActiveTab('TV Series')}
              disabled={isUploading}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'TV Series'
                  ? 'bg-neon-green text-black'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              } disabled:opacity-50`}
            >
              TV Series
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Series/Movie Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="w-1 h-5 bg-neon-green rounded-full"></div>
              {activeTab} Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isUploading}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-green/50 focus:outline-none disabled:opacity-50"
                  placeholder="Enter title"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isUploading}
                  rows={3}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-green/50 focus:outline-none disabled:opacity-50 resize-none"
                  placeholder="Enter description"
                />
              </div>

              {/* Genre */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Genre <span className="text-red-500">*</span>
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as Genre)}
                  disabled={isUploading}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-green/50 focus:outline-none disabled:opacity-50"
                >
                  {genres.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Year</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  disabled={isUploading}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-green/50 focus:outline-none disabled:opacity-50"
                  placeholder="2024"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Rating</label>
                <input
                  type="text"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  disabled={isUploading}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-green/50 focus:outline-none disabled:opacity-50"
                  placeholder="4.8"
                />
              </div>

              {/* Duration - Only for Movie */}
              {activeTab === 'Movie' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    disabled={isUploading}
                    className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-green/50 focus:outline-none disabled:opacity-50"
                    placeholder="2h 15m"
                  />
                </div>
              )}

              {/* Cast */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-2">Cast</label>
                <input
                  type="text"
                  value={cast}
                  onChange={(e) => setCast(e.target.value)}
                  disabled={isUploading}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-green/50 focus:outline-none disabled:opacity-50"
                  placeholder="Actor 1, Actor 2, Actor 3"
                />
              </div>

              {/* Director & Language */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Director</label>
                <input
                  type="text"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  disabled={isUploading}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-green/50 focus:outline-none disabled:opacity-50"
                  placeholder="Director name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Language</label>
                <input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={isUploading}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-green/50 focus:outline-none disabled:opacity-50"
                  placeholder="English"
                />
              </div>
            </div>
          </div>

          {/* Poster & Trailer */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="w-1 h-5 bg-neon-green rounded-full"></div>
              Media
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Poster Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Poster Image <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterSelect}
                    disabled={isUploading}
                    className="hidden"
                    id="poster-upload"
                  />
                  <label
                    htmlFor="poster-upload"
                    className={`block w-full aspect-[2/3] border-2 border-dashed rounded-lg ${
                      posterPreview ? 'border-neon-green/50' : 'border-white/20'
                    } hover:border-neon-green/50 transition-colors cursor-pointer overflow-hidden ${
                      isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {posterPreview ? (
                      <img src={posterPreview} alt="Poster preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <ImageIcon size={32} />
                        <span className="text-sm mt-2">Upload Poster</span>
                        <span className="text-xs">Max 5MB</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Movie Video Upload - Only for Movie */}
              {activeTab === 'Movie' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Video File (Optional)</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoSelect}
                      disabled={isUploading}
                      className="hidden"
                      id="video-upload"
                    />
                    <label
                      htmlFor="video-upload"
                      className={`block w-full aspect-[2/3] border-2 border-dashed rounded-lg border-white/20 hover:border-neon-green/50 transition-colors cursor-pointer overflow-hidden ${
                        isUploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <Film size={32} />
                        <span className="text-sm mt-2">{videoFile ? videoFile.name : 'Upload Video'}</span>
                        <span className="text-xs">Max 500MB</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Trailer URL */}
              <div className={activeTab === 'Movie' ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-400 mb-2">Trailer URL (Optional)</label>
                <input
                  type="url"
                  value={trailerUrl}
                  onChange={(e) => setTrailerUrl(e.target.value)}
                  disabled={isUploading}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-green/50 focus:outline-none disabled:opacity-50"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
          </div>

          {/* Episodes Section - Only for TV Series */}
          {activeTab === 'TV Series' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <div className="w-1 h-5 bg-neon-green rounded-full"></div>
                  Episodes ({episodes.length})
                </h3>
                <button
                  type="button"
                  onClick={addEpisode}
                  disabled={isUploading}
                  className="bg-neon-green hover:bg-neon-green/80 text-black px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Plus size={16} />
                  Add Episode
                </button>
              </div>

              {episodes.length === 0 ? (
                <div className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center text-gray-500">
                  <Film size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No episodes added yet. Click "Add Episode" to start.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {episodes.map((ep, index) => (
                    <div key={ep.id} className="bg-[#111] border border-white/10 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white">Episode {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeEpisode(ep.id)}
                          disabled={isUploading}
                          className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {/* Season & Episode Number */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Season</label>
                          <input
                            type="number"
                            min="1"
                            value={ep.seasonNumber}
                            onChange={(e) => updateEpisode(ep.id, 'seasonNumber', e.target.value)}
                            disabled={isUploading}
                            className="w-full bg-[#050505] border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:border-neon-green/50 focus:outline-none disabled:opacity-50"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Episode #</label>
                          <input
                            type="number"
                            min="1"
                            value={ep.episodeNumber}
                            onChange={(e) => updateEpisode(ep.id, 'episodeNumber', e.target.value)}
                            disabled={isUploading}
                            className="w-full bg-[#050505] border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:border-neon-green/50 focus:outline-none disabled:opacity-50"
                          />
                        </div>

                        {/* Episode Title */}
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-400 mb-1">
                            Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={ep.title}
                            onChange={(e) => updateEpisode(ep.id, 'title', e.target.value)}
                            disabled={isUploading}
                            className="w-full bg-[#050505] border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:border-neon-green/50 focus:outline-none disabled:opacity-50"
                            placeholder="Episode title"
                          />
                        </div>

                        {/* Episode Description */}
                        <div className="md:col-span-3">
                          <label className="block text-xs text-gray-400 mb-1">Description</label>
                          <input
                            type="text"
                            value={ep.description}
                            onChange={(e) => updateEpisode(ep.id, 'description', e.target.value)}
                            disabled={isUploading}
                            className="w-full bg-[#050505] border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:border-neon-green/50 focus:outline-none disabled:opacity-50"
                            placeholder="Episode description"
                          />
                        </div>

                        {/* Duration */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Duration</label>
                          <input
                            type="text"
                            value={ep.duration}
                            onChange={(e) => updateEpisode(ep.id, 'duration', e.target.value)}
                            disabled={isUploading}
                            className="w-full bg-[#050505] border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:border-neon-green/50 focus:outline-none disabled:opacity-50"
                            placeholder="45m"
                          />
                        </div>

                        {/* Video Upload */}
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-400 mb-1">
                            Video <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleEpisodeVideoSelect(ep.id, e)}
                            disabled={isUploading}
                            className="w-full text-xs text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-neon-green file:text-black hover:file:bg-neon-green/80 file:cursor-pointer disabled:opacity-50"
                          />
                        </div>

                        {/* Thumbnail Upload */}
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-400 mb-1">Thumbnail (Optional)</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleEpisodeThumbnailSelect(ep.id, e)}
                            disabled={isUploading}
                            className="w-full text-xs text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-white/10 file:text-white hover:file:bg-white/20 file:cursor-pointer disabled:opacity-50"
                          />
                        </div>
                      </div>

                      {/* Thumbnail Preview */}
                      {ep.thumbnailPreview && (
                        <img
                          src={ep.thumbnailPreview}
                          alt="Episode thumbnail"
                          className="w-32 h-18 object-cover rounded"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUploading}
            className="px-6 py-2 rounded-lg bg-neon-green hover:bg-neon-green/80 text-black font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader className="animate-spin" size={16} />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                {activeTab === 'Movie' ? 'Upload Movie' : 'Upload TV Series'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadContentModal;
