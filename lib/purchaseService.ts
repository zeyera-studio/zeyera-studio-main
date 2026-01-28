// Purchase Service - Handle purchases and access control
import { supabase } from './supabaseClient';
import { Purchase, Content, SeasonPrice } from '../types';

/**
 * Check if user has access to content (movie or TV series season)
 */
export async function checkContentAccess(
  contentId: string,
  userId: string | null,
  seasonNumber?: number
): Promise<boolean> {
  // Not logged in = no access
  if (!userId) return false;

  try {
    // Check if user is admin (admins have full access)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profile?.role === 'admin') {
      return true;
    }

    // Check for completed purchase
    let query = supabase
      .from('purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .eq('status', 'completed');

    if (seasonNumber !== undefined) {
      query = query.eq('season_number', seasonNumber);
    } else {
      query = query.is('season_number', null);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Error checking content access:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in checkContentAccess:', error);
    return false;
  }
}

/**
 * Get user's purchased seasons for a TV series
 */
export async function getUserPurchasedSeasons(
  contentId: string,
  userId: string
): Promise<number[]> {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('season_number')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .eq('status', 'completed')
      .not('season_number', 'is', null);

    if (error) {
      console.error('Error fetching purchased seasons:', error);
      return [];
    }

    return data?.map(p => p.season_number as number) || [];
  } catch (error) {
    console.error('Error in getUserPurchasedSeasons:', error);
    return [];
  }
}

/**
 * Get all purchases for a user
 */
export async function getUserPurchases(userId: string): Promise<Purchase[]> {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        content:content_id (
          id,
          title,
          poster_url,
          content_type,
          genre
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('purchased_at', { ascending: false });

    if (error) {
      console.error('Error fetching user purchases:', error);
      return [];
    }

    return data as Purchase[];
  } catch (error) {
    console.error('Error in getUserPurchases:', error);
    return [];
  }
}

/**
 * Create a pending purchase before PayHere redirect
 */
export async function createPendingPurchase(
  userId: string,
  contentId: string,
  orderId: string,
  amount: number,
  seasonNumber?: number
): Promise<Purchase | null> {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .insert({
        user_id: userId,
        content_id: contentId,
        season_number: seasonNumber || null,
        order_id: orderId,
        amount: amount,
        currency: 'LKR',
        status: 'pending',
        payment_method: 'payhere',
      })
      .select()
      .single();

    if (error) {
      // Check if it's a duplicate purchase error
      if (error.code === '23505') {
        console.log('Purchase already exists for this content');
        return null;
      }
      console.error('Error creating pending purchase:', error);
      throw error;
    }

    return data as Purchase;
  } catch (error) {
    console.error('Error in createPendingPurchase:', error);
    throw error;
  }
}

/**
 * Complete a purchase after successful PayHere payment
 */
export async function completePurchase(orderId: string): Promise<Purchase | null> {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) {
      console.error('Error completing purchase:', error);
      return null;
    }

    return data as Purchase;
  } catch (error) {
    console.error('Error in completePurchase:', error);
    return null;
  }
}

/**
 * Cancel/fail a purchase
 */
export async function cancelPurchase(orderId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('purchases')
      .update({
        status: 'failed',
      })
      .eq('order_id', orderId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error canceling purchase:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in cancelPurchase:', error);
    return false;
  }
}

/**
 * Get purchase by order ID
 */
export async function getPurchaseByOrderId(orderId: string): Promise<Purchase | null> {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        content:content_id (
          id,
          title,
          poster_url,
          content_type,
          video_url
        )
      `)
      .eq('order_id', orderId)
      .single();

    if (error) {
      console.error('Error fetching purchase:', error);
      return null;
    }

    return data as Purchase;
  } catch (error) {
    console.error('Error in getPurchaseByOrderId:', error);
    return null;
  }
}

/**
 * Get content price (for movies)
 */
export async function getContentPrice(contentId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('price')
      .eq('id', contentId)
      .single();

    if (error) {
      console.error('Error fetching content price:', error);
      return 0;
    }

    return data?.price || 0;
  } catch (error) {
    console.error('Error in getContentPrice:', error);
    return 0;
  }
}

/**
 * Get season price (for TV series)
 */
export async function getSeasonPrice(
  contentId: string,
  seasonNumber: number
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('season_prices')
      .select('price')
      .eq('content_id', contentId)
      .eq('season_number', seasonNumber)
      .single();

    if (error) {
      // If no specific season price, try to get default from content
      if (error.code === 'PGRST116') {
        return getContentPrice(contentId);
      }
      console.error('Error fetching season price:', error);
      return 0;
    }

    return data?.price || 0;
  } catch (error) {
    console.error('Error in getSeasonPrice:', error);
    return 0;
  }
}

/**
 * Check if user has any pending purchase for content
 */
export async function hasPendingPurchase(
  userId: string,
  contentId: string,
  seasonNumber?: number
): Promise<string | null> {
  try {
    let query = supabase
      .from('purchases')
      .select('order_id')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .eq('status', 'pending');

    if (seasonNumber !== undefined) {
      query = query.eq('season_number', seasonNumber);
    } else {
      query = query.is('season_number', null);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Error checking pending purchase:', error);
      return null;
    }

    return data?.order_id || null;
  } catch (error) {
    console.error('Error in hasPendingPurchase:', error);
    return null;
  }
}
