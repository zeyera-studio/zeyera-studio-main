import { supabase } from './supabaseClient';
import { Episode, EpisodeStatus, SeasonGroup, EpisodeStats } from '../types';
import { uploadImage, uploadVideo } from './contentService';

/**
 * Create new episode for a TV series
 * @param episodeData Episode data to insert
 * @returns Created episode record
 */
export const createEpisode = async (
  episodeData: Omit<Episode, 'id' | 'created_at' | 'updated_at' | 'status'>
): Promise<Episode> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('episodes')
      .insert([
        {
          ...episodeData,
          status: 'unpublished',
          uploaded_by: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data as Episode;
  } catch (error: any) {
    console.error('Error creating episode:', error);
    throw new Error(error.message || 'Failed to create episode');
  }
};

/**
 * Fetch all episodes for a specific TV series
 * @param seriesId Content ID of the TV series
 * @param status Optional filter by status
 * @returns Array of episodes
 */
export const fetchEpisodesBySeries = async (
  seriesId: string,
  status?: EpisodeStatus
): Promise<Episode[]> => {
  try {
    let query = supabase
      .from('episodes')
      .select('*')
      .eq('content_id', seriesId)
      .order('season_number', { ascending: true })
      .order('episode_number', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data as Episode[]) || [];
  } catch (error: any) {
    console.error('Error fetching episodes:', error);
    throw new Error(error.message || 'Failed to fetch episodes');
  }
};

/**
 * Fetch episodes for a specific season of a series
 * @param seriesId Content ID of the TV series
 * @param seasonNumber Season number
 * @returns Array of episodes
 */
export const fetchEpisodesBySeason = async (
  seriesId: string,
  seasonNumber: number
): Promise<Episode[]> => {
  try {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('content_id', seriesId)
      .eq('season_number', seasonNumber)
      .order('episode_number', { ascending: true });

    if (error) throw error;

    return (data as Episode[]) || [];
  } catch (error: any) {
    console.error('Error fetching season episodes:', error);
    throw new Error(error.message || 'Failed to fetch season episodes');
  }
};

/**
 * Get a single episode by ID
 * @param id Episode ID
 * @returns Episode
 */
export const getEpisodeById = async (id: string): Promise<Episode> => {
  try {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data as Episode;
  } catch (error: any) {
    console.error('Error fetching episode:', error);
    throw new Error(error.message || 'Failed to fetch episode');
  }
};

/**
 * Publish an episode
 * @param id Episode ID
 * @returns Updated episode
 */
export const publishEpisode = async (id: string): Promise<Episode> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('episodes')
      .update({
        status: 'published',
        published_by: user.id,
        published_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data as Episode;
  } catch (error: any) {
    console.error('Error publishing episode:', error);
    throw new Error(error.message || 'Failed to publish episode');
  }
};

/**
 * Unpublish an episode
 * @param id Episode ID
 * @returns Updated episode
 */
export const unpublishEpisode = async (id: string): Promise<Episode> => {
  try {
    const { data, error } = await supabase
      .from('episodes')
      .update({
        status: 'unpublished',
        published_by: null,
        published_at: null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data as Episode;
  } catch (error: any) {
    console.error('Error unpublishing episode:', error);
    throw new Error(error.message || 'Failed to unpublish episode');
  }
};

/**
 * Update an episode
 * @param id Episode ID
 * @param updates Partial episode data
 * @returns Updated episode
 */
export const updateEpisode = async (
  id: string,
  updates: Partial<Omit<Episode, 'id' | 'created_at' | 'updated_at'>>
): Promise<Episode> => {
  try {
    const { data, error } = await supabase
      .from('episodes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data as Episode;
  } catch (error: any) {
    console.error('Error updating episode:', error);
    throw new Error(error.message || 'Failed to update episode');
  }
};

/**
 * Delete an episode and associated files
 * @param id Episode ID
 */
export const deleteEpisode = async (id: string): Promise<void> => {
  try {
    // First, get the episode to find associated files
    const episode = await getEpisodeById(id);

    // Delete from database
    const { error: dbError } = await supabase
      .from('episodes')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;

    // Delete associated video file from storage
    if (episode.video_url) {
      const videoPath = episode.video_url.split('/').slice(-2).join('/');
      await supabase.storage.from('content-videos').remove([videoPath]);
    }

    // Delete thumbnail if it exists
    if (episode.thumbnail_url) {
      const thumbPath = episode.thumbnail_url.split('/').slice(-2).join('/');
      await supabase.storage.from('content-images').remove([thumbPath]);
    }
  } catch (error: any) {
    console.error('Error deleting episode:', error);
    throw new Error(error.message || 'Failed to delete episode');
  }
};

/**
 * Get episode count for a series
 * @param seriesId Content ID of the TV series
 * @returns Total episode count
 */
export const getEpisodeCount = async (seriesId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('episodes')
      .select('*', { count: 'exact', head: true })
      .eq('content_id', seriesId);

    if (error) throw error;

    return count || 0;
  } catch (error: any) {
    console.error('Error getting episode count:', error);
    return 0;
  }
};

/**
 * Get season count for a series
 * @param seriesId Content ID of the TV series
 * @returns Total season count
 */
export const getSeasonCount = async (seriesId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('episodes')
      .select('season_number')
      .eq('content_id', seriesId);

    if (error) throw error;

    if (!data || data.length === 0) return 0;

    // Get unique season numbers
    const uniqueSeasons = new Set(data.map((ep) => ep.season_number));
    return uniqueSeasons.size;
  } catch (error: any) {
    console.error('Error getting season count:', error);
    return 0;
  }
};

/**
 * Get episode statistics for a series
 * @param seriesId Content ID of the TV series
 * @returns Episode stats
 */
export const getEpisodeStats = async (seriesId: string): Promise<EpisodeStats> => {
  try {
    const episodes = await fetchEpisodesBySeries(seriesId);
    
    return {
      total: episodes.length,
      published: episodes.filter((ep) => ep.status === 'published').length,
      seasons: new Set(episodes.map((ep) => ep.season_number)).size,
    };
  } catch (error: any) {
    console.error('Error getting episode stats:', error);
    return {
      total: 0,
      published: 0,
      seasons: 0,
    };
  }
};

/**
 * Group episodes by season
 * @param episodes Array of episodes
 * @returns Array of season groups
 */
export const groupEpisodesBySeason = (episodes: Episode[]): SeasonGroup[] => {
  const seasonMap = new Map<number, Episode[]>();

  episodes.forEach((episode) => {
    if (!seasonMap.has(episode.season_number)) {
      seasonMap.set(episode.season_number, []);
    }
    seasonMap.get(episode.season_number)!.push(episode);
  });

  return Array.from(seasonMap.entries())
    .map(([seasonNumber, episodes]) => ({
      seasonNumber,
      episodes: episodes.sort((a, b) => a.episode_number - b.episode_number),
    }))
    .sort((a, b) => a.seasonNumber - b.seasonNumber);
};

/**
 * Upload episode with video and optional thumbnail
 * @param episodeData Basic episode data
 * @param videoFile Video file
 * @param thumbnailFile Optional thumbnail file
 * @param onProgress Progress callback
 * @returns Created episode
 */
export const uploadEpisode = async (
  episodeData: {
    content_id: string;
    season_number: number;
    episode_number: number;
    title: string;
    description: string;
    duration?: string;
  },
  videoFile: File,
  thumbnailFile?: File,
  onProgress?: (type: 'video' | 'thumbnail', progress: number) => void
): Promise<Episode> => {
  try {
    // Upload video (required)
    const videoUrl = await uploadVideo(videoFile, (progress) => {
      if (onProgress) onProgress('video', progress);
    });

    // Upload thumbnail (optional)
    let thumbnailUrl: string | undefined;
    if (thumbnailFile) {
      thumbnailUrl = await uploadImage(thumbnailFile, (progress) => {
        if (onProgress) onProgress('thumbnail', progress);
      });
    }

    // Create episode record
    const episode = await createEpisode({
      ...episodeData,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
    });

    return episode;
  } catch (error: any) {
    console.error('Error uploading episode:', error);
    throw new Error(error.message || 'Failed to upload episode');
  }
};

