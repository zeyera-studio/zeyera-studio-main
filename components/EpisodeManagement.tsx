import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Trash2, Plus, Loader } from 'lucide-react';
import { Content, Episode } from '../types';
import { fetchEpisodesBySeries, publishEpisode, unpublishEpisode, deleteEpisode, groupEpisodesBySeason } from '../lib/episodeService';
import EpisodeUploadModal from './EpisodeUploadModal';

interface EpisodeManagementProps {
  isOpen: boolean;
  onClose: () => void;
  series: Content;
  onUpdate: () => void;
}

const EpisodeManagement: React.FC<EpisodeManagementProps> = ({ isOpen, onClose, series, onUpdate }) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddEpisodeOpen, setAddEpisodeOpen] = useState(false);

  useEffect(() => {
    if (isOpen && series) {
      loadEpisodes();
    }
  }, [isOpen, series]);

  const loadEpisodes = async () => {
    setLoading(true);
    try {
      const allEpisodes = await fetchEpisodesBySeries(series.id);
      setEpisodes(allEpisodes);
    } catch (error) {
      console.error('Error loading episodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (episodeId: string) => {
    try {
      await publishEpisode(episodeId);
      await loadEpisodes();
      onUpdate();
    } catch (error: any) {
      alert(error.message || 'Failed to publish episode');
    }
  };

  const handleUnpublish = async (episodeId: string) => {
    try {
      await unpublishEpisode(episodeId);
      await loadEpisodes();
      onUpdate();
    } catch (error: any) {
      alert(error.message || 'Failed to unpublish episode');
    }
  };

  const handleDelete = async (episodeId: string, episodeTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${episodeTitle}"?`)) {
      return;
    }
    try {
      await deleteEpisode(episodeId);
      await loadEpisodes();
      onUpdate();
    } catch (error: any) {
      alert(error.message || 'Failed to delete episode');
    }
  };

  const handleAddEpisodeSuccess = () => {
    loadEpisodes();
    onUpdate();
  };

  if (!isOpen) return null;

  const seasonGroups = groupEpisodesBySeason(episodes);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Manage Episodes</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {series.title} • {episodes.length} Episodes
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setAddEpisodeOpen(true)}
                  className="bg-neon-green hover:bg-neon-green/80 text-black px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Episode
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
          </div>

          {/* Episodes List */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader className="animate-spin text-neon-green mb-4" size={48} />
                <p className="text-gray-400">Loading episodes...</p>
              </div>
            ) : episodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Plus className="text-gray-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Episodes Yet</h3>
                <p className="text-gray-400 mb-6">Add episodes to this TV series.</p>
                <button
                  onClick={() => setAddEpisodeOpen(true)}
                  className="bg-neon-green hover:bg-neon-green/80 text-black px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add First Episode
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {seasonGroups.map((seasonGroup) => (
                  <div key={seasonGroup.seasonNumber} className="space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <div className="w-1 h-6 bg-neon-green rounded-full"></div>
                      Season {seasonGroup.seasonNumber} ({seasonGroup.episodes.length} Episodes)
                    </h3>

                    <div className="space-y-3">
                      {seasonGroup.episodes.map((episode) => (
                        <div
                          key={episode.id}
                          className="bg-[#111] border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            {/* Episode Thumbnail or Placeholder */}
                            <div className="w-32 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-900">
                              {episode.thumbnail_url ? (
                                <img
                                  src={episode.thumbnail_url}
                                  alt={episode.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                  <span className="text-2xl font-bold">
                                    E{episode.episode_number}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Episode Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-gray-500 uppercase">
                                      Episode {episode.episode_number}
                                    </span>
                                    {episode.status === 'published' ? (
                                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-neon-green/20 text-neon-green border border-neon-green/20">
                                        PUBLISHED
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-500/20 text-yellow-500 border border-yellow-500/20">
                                        DRAFT
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-white font-bold mb-1">{episode.title}</h4>
                                  <p className="text-sm text-gray-400 line-clamp-2">
                                    {episode.description}
                                  </p>
                                  {episode.duration && (
                                    <p className="text-xs text-gray-600 mt-1">Duration: {episode.duration}</p>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {episode.status === 'unpublished' ? (
                                    <button
                                      onClick={() => handlePublish(episode.id)}
                                      className="bg-neon-green hover:bg-neon-green/80 text-black px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-1"
                                      title="Publish"
                                    >
                                      <CheckCircle size={14} />
                                      Publish
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUnpublish(episode.id)}
                                      className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-1"
                                      title="Unpublish"
                                    >
                                      <XCircle size={14} />
                                      Unpublish
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDelete(episode.id, episode.title)}
                                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Add Episode Modal */}
      <EpisodeUploadModal
        isOpen={isAddEpisodeOpen}
        onClose={() => setAddEpisodeOpen(false)}
        seriesId={series.id}
        seriesTitle={series.title}
        onSuccess={handleAddEpisodeSuccess}
      />
    </>
  );
};

export default EpisodeManagement;

