import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, Film, Loader } from 'lucide-react';
import { ContentType, Genre, UploadProgress } from '../types';
import { uploadImage, uploadVideo, createContent } from '../lib/contentService';

interface UploadContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadContentModal: React.FC<UploadContentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<ContentType>('Movie');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
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

    setIsUploading(true);

    try {
      // Upload poster image
      setUploadProgress({ poster: 0 });
      const posterUrl = await uploadImage(posterFile, (progress) => {
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
        content_type: contentType,
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
      setError(err.message || 'Failed to upload content');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setContentType('Movie');
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
    setError('');
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
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Upload New Content</h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="w-1 h-5 bg-neon-green rounded-full"></div>
              Basic Information
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
                  placeholder="Enter content title"
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
                  placeholder="Enter content description"
                />
              </div>

              {/* Content Type */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Content Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as ContentType)}
                  disabled={isUploading}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-green/50 focus:outline-none disabled:opacity-50"
                >
                  <option value="Movie">Movie</option>
                  <option value="TV Series">TV Series</option>
                </select>
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

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  disabled={isUploading}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-green/50 focus:outline-none disabled:opacity-50"
                  placeholder="2h 15m or 3 Seasons"
                />
              </div>

              {/* Language */}
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

              {/* Director */}
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

              {/* Quality */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Quality</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  disabled={isUploading}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-green/50 focus:outline-none disabled:opacity-50"
                >
                  <option value="HD">HD</option>
                  <option value="4K">4K</option>
                  <option value="8K">8K</option>
                </select>
              </div>
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="w-1 h-5 bg-neon-green rounded-full"></div>
              Media Files
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
                  {uploadProgress.poster !== undefined && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                      <div
                        className="h-full bg-neon-green transition-all"
                        style={{ width: `${uploadProgress.poster}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Video Upload */}
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
                  {uploadProgress.video !== undefined && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                      <div
                        className="h-full bg-neon-green transition-all"
                        style={{ width: `${uploadProgress.video}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Trailer URL */}
              <div className="md:col-span-2">
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
                Upload Content
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadContentModal;

