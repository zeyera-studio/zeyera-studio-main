import { supabase } from './supabaseClient';
import { Comment } from '../types';

/**
 * Fetch all comments for a specific content (movie or TV series)
 * Includes user information by joining with profiles table
 */
export async function fetchCommentsByContentId(contentId: string): Promise<Comment[]> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        content_id,
        user_id,
        comment_text,
        created_at,
        updated_at,
        profiles:user_id (
          username,
          email
        )
      `)
      .eq('content_id', contentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }

    // Transform the joined data into our Comment interface
    const comments: Comment[] = (data || []).map((comment: any) => ({
      id: comment.id,
      content_id: comment.content_id,
      user_id: comment.user_id,
      comment_text: comment.comment_text,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      username: comment.profiles?.username || 'Anonymous',
      user_email: comment.profiles?.email || '',
    }));

    return comments;
  } catch (error) {
    console.error('Error in fetchCommentsByContentId:', error);
    return [];
  }
}

/**
 * Post a new comment on a content item
 * Requires user to be authenticated
 */
export async function postComment(
  contentId: string,
  userId: string,
  commentText: string
): Promise<{ success: boolean; comment?: Comment; error?: string }> {
  try {
    // Validate input
    if (!commentText.trim()) {
      return { success: false, error: 'Comment cannot be empty' };
    }

    if (commentText.length > 1000) {
      return { success: false, error: 'Comment is too long (max 1000 characters)' };
    }

    // Insert the comment
    const { data, error } = await supabase
      .from('comments')
      .insert({
        content_id: contentId,
        user_id: userId,
        comment_text: commentText.trim(),
      })
      .select(`
        id,
        content_id,
        user_id,
        comment_text,
        created_at,
        updated_at,
        profiles:user_id (
          username,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Error posting comment:', error);
      return { success: false, error: error.message };
    }

    // Transform the response
    const comment: Comment = {
      id: data.id,
      content_id: data.content_id,
      user_id: data.user_id,
      comment_text: data.comment_text,
      created_at: data.created_at,
      updated_at: data.updated_at,
      username: data.profiles?.username || 'Anonymous',
      user_email: data.profiles?.email || '',
    };

    return { success: true, comment };
  } catch (error: any) {
    console.error('Error in postComment:', error);
    return { success: false, error: error.message || 'Failed to post comment' };
  }
}

/**
 * Delete a comment
 * Only the comment author or an admin can delete
 */
export async function deleteComment(commentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteComment:', error);
    return { success: false, error: error.message || 'Failed to delete comment' };
  }
}

/**
 * Get comment count for a content item
 */
export async function getCommentCount(contentId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('content_id', contentId);

    if (error) {
      console.error('Error getting comment count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getCommentCount:', error);
    return 0;
  }
}

