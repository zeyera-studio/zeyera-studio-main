import { supabase } from './supabaseClient';
import { Content, ContentStatus, ContentType, Genre, ContentStats } from '../types';

/**
 * Upload an image to Supabase Storage
 * @param file Image file to upload
 * @param onProgress Optional callback for upload progress
 * @returns Public URL of uploaded image
 */
export const uploadImage = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Image must be less than 5MB');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `posters/${fileName}`;

    // Upload to storage
    const { data, error } = await supabase.storage
      .from('content-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('content-images')
      .getPublicUrl(filePath);

    if (onProgress) onProgress(100);

    return publicUrl;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
};

/**
 * Upload a video to Supabase Storage with progress tracking
 * @param file Video file to upload
 * @param onProgress Callback for upload progress
 * @returns Public URL of uploaded video
 */
export const uploadVideo = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // Validate file
    if (!file.type.startsWith('video/')) {
      throw new Error('File must be a video');
    }

    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      throw new Error('Video must be less than 500MB');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `videos/${fileName}`;

    // Upload to storage
    // Note: Supabase doesn't have built-in progress tracking for uploads
    // We simulate progress based on file size chunks
    if (onProgress) onProgress(10);

    const { data, error } = await supabase.storage
      .from('content-videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    if (onProgress) onProgress(90);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('content-videos')
      .getPublicUrl(filePath);

    if (onProgress) onProgress(100);

    return publicUrl;
  } catch (error: any) {
    console.error('Error uploading video:', error);
    throw new Error(error.message || 'Failed to upload video');
  }
};

/**
 * Create new content in the database
 * @param contentData Content data to insert
 * @returns Created content record
 */
export const createContent = async (
  contentData: Omit<Content, 'id' | 'created_at' | 'updated_at' | 'status'>
): Promise<Content> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('content')
      .insert([
        {
          ...contentData,
          status: 'unpublished',
          uploaded_by: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data as Content;
  } catch (error: any) {
    console.error('Error creating content:', error);
    throw new Error(error.message || 'Failed to create content');
  }
};

/**
 * Fetch content with optional filters
 * @param status Filter by status
 * @param contentType Filter by content type
 * @param genre Filter by genre
 * @returns Array of content items
 */
export const fetchContent = async (
  status?: ContentStatus,
  contentType?: ContentType,
  genre?: Genre
): Promise<Content[]> => {
  try {
    let query = supabase
      .from('content')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (contentType) {
      query = query.eq('content_type', contentType);
    }

    if (genre) {
      query = query.eq('genre', genre);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data as Content[]) || [];
  } catch (error: any) {
    console.error('Error fetching content:', error);
    throw new Error(error.message || 'Failed to fetch content');
  }
};

/**
 * Get a single content item by ID
 * @param id Content ID
 * @returns Content item
 */
export const getContentById = async (id: string): Promise<Content> => {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data as Content;
  } catch (error: any) {
    console.error('Error fetching content by ID:', error);
    throw new Error(error.message || 'Failed to fetch content');
  }
};

/**
 * Publish content (update status to published)
 * @param id Content ID
 * @param adminId Admin user ID
 * @returns Updated content
 */
export const publishContent = async (id: string): Promise<Content> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('content')
      .update({
        status: 'published',
        published_by: user.id,
        published_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data as Content;
  } catch (error: any) {
    console.error('Error publishing content:', error);
    throw new Error(error.message || 'Failed to publish content');
  }
};

/**
 * Unpublish content (update status back to unpublished)
 * @param id Content ID
 * @returns Updated content
 */
export const unpublishContent = async (id: string): Promise<Content> => {
  try {
    const { data, error } = await supabase
      .from('content')
      .update({
        status: 'unpublished',
        published_by: null,
        published_at: null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data as Content;
  } catch (error: any) {
    console.error('Error unpublishing content:', error);
    throw new Error(error.message || 'Failed to unpublish content');
  }
};

/**
 * Update existing content
 * @param id Content ID
 * @param updates Partial content data to update
 * @returns Updated content
 */
export const updateContent = async (
  id: string,
  updates: Partial<Omit<Content, 'id' | 'created_at' | 'updated_at'>>
): Promise<Content> => {
  try {
    const { data, error } = await supabase
      .from('content')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data as Content;
  } catch (error: any) {
    console.error('Error updating content:', error);
    throw new Error(error.message || 'Failed to update content');
  }
};

/**
 * Delete content and associated files
 * @param id Content ID
 */
export const deleteContent = async (id: string): Promise<void> => {
  try {
    // First, get the content to find associated files
    const content = await getContentById(id);

    // Delete from database
    const { error: dbError } = await supabase
      .from('content')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;

    // Delete associated files from storage
    if (content.poster_url) {
      const posterPath = content.poster_url.split('/').slice(-2).join('/');
      await supabase.storage.from('content-images').remove([posterPath]);
    }

    if (content.video_url) {
      const videoPath = content.video_url.split('/').slice(-2).join('/');
      await supabase.storage.from('content-videos').remove([videoPath]);
    }
  } catch (error: any) {
    console.error('Error deleting content:', error);
    throw new Error(error.message || 'Failed to delete content');
  }
};

/**
 * Get content statistics for dashboard
 * @returns Content stats
 */
export const getContentStats = async (): Promise<ContentStats> => {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('status');

    if (error) throw error;

    const stats = {
      total: data.length,
      unpublished: data.filter((c) => c.status === 'unpublished').length,
      published: data.filter((c) => c.status === 'published').length,
      archived: data.filter((c) => c.status === 'archived').length,
    };

    return stats;
  } catch (error: any) {
    console.error('Error fetching content stats:', error);
    return {
      total: 0,
      unpublished: 0,
      published: 0,
      archived: 0,
    };
  }
};

