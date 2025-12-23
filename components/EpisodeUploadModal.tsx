import React, { useState } from 'react';
import { X, Upload, Film, Image as ImageIcon, Loader } from 'lucide-react';
import { uploadEpisode } from '../lib/episodeService';

interface EpisodeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  seriesId: string;
  seriesTitle: string;
  onSuccess: () => void;
}

const EpisodeUploadModal: React.FC<EpisodeUploadModalProps> = ({
  isOpen,
  onClose,
  seriesId,
  seriesTitle,
  onSuccess,
}) => {
  // Form state
  const [seasonNumber, setSeasonNumber] = useState('1');
  const [episodeNumber, setEpisodeNumber] = useState('1');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');

  // File state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ video?: number; thumbnail?: number }>({});
  const [error, setError] = useState<string>('');

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

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Thumbnail must be less than 5MB');
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!title.trim()) {
      setError('Episode title is required');
      return;
    }
    if (!description.trim()) {
      setError('Episode description is required');
      return;
    }
    if (!videoFile) {
      setError('Video file is required');
      return;
    }

    const season = parseInt(seasonNumber);
    const episode = parseInt(episodeNumber);

    if (isNaN(season) || season < 1) {
      setError('Season number must be a positive number');
      return;
    }
    if (isNaN(episode) || episode < 1) {
      setError('Episode number must be a positive number');
      return;
    }

    setIsUploading(true);

    try {
      await uploadEpisode(
        {
          content_id: seriesId,
          season_number: season,
          episode_number: episode,
          title: title.trim(),
          description: description.trim(),
          duration: duration.trim() || undefined,
        },
        videoFile,
        thumbnailFile || undefined,
        (type, progress) => {
          setUploadProgress((prev) => ({ ...prev, [type]: progress }));
        }
      );

      // Success!
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload episode');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const resetForm = () => {
    setSeasonNumber('1');
    setEpisodeNumber('1');
    setTitle('');
    setDescription('');
    setDuration('');
    setVideoFile(null);
    setThumbnailFile(null);
    setThumbnailPreview('');
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
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Add Episode</h2>
              <p className="text-sm text-gray-400 mt-1">For: {seriesTitle}</p>
            </div>
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <X size={24} />
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

          {/* Episode Organization */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="w-1 h-5 bg-neon-green rounded-full"></div>
              Episode Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Season Number */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Season Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={seasonNumber}
                  onChange={(e) => setSeasonNumber(e.target.value)}
                  disabled={isUploading}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-green/50 focus:outline-none disabled:opacity-50"
                  placeholder="1"
                />
              </div>

              {/* Episode Number */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Episode Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(e.target.value)}
                  disabled={isUploading}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-green/50 focus:outline-none disabled:opacity-50"
                  placeholder="1"
                />
              </div>
            </div>

            {/* Episode Title */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Episode Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading}
                className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-green/50 focus:outline-none disabled:opacity-50"
                placeholder="Episode title"
              />
            </div>

            {/* Episode Description */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
                rows={3}
                className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-green/50 focus:outline-none disabled:opacity-50 resize-none"
                placeholder="Episode description"
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
                placeholder="45m or 1h 15m"
              />
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="w-1 h-5 bg-neon-green rounded-full"></div>
              Media Files
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Episode Video <span className="text-red-500">*</span>
                </label>
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
                    className={`block w-full aspect-video border-2 border-dashed rounded-lg ${
                      videoFile ? 'border-neon-green/50' : 'border-white/20'
                    } hover:border-neon-green/50 transition-colors cursor-pointer overflow-hidden ${
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

              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Thumbnail (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailSelect}
                    disabled={isUploading}
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <label
                    htmlFor="thumbnail-upload"
                    className={`block w-full aspect-video border-2 border-dashed rounded-lg ${
                      thumbnailPreview ? 'border-neon-green/50' : 'border-white/20'
                    } hover:border-neon-green/50 transition-colors cursor-pointer overflow-hidden ${
                      isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {thumbnailPreview ? (
                      <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <ImageIcon size={32} />
                        <span className="text-sm mt-2">Upload Thumbnail</span>
                        <span className="text-xs">Max 5MB</span>
                      </div>
                    )}
                  </label>
                  {uploadProgress.thumbnail !== undefined && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                      <div
                        className="h-full bg-neon-green transition-all"
                        style={{ width: `${uploadProgress.thumbnail}%` }}
                      />
                    </div>
                  )}
                </div>
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
                Add Episode
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EpisodeUploadModal;

