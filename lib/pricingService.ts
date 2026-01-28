// Pricing Service - Admin pricing management
import { supabase } from './supabaseClient';
import { SeasonPrice } from '../types';

/**
 * Set price for a movie/content
 */
export async function setContentPrice(
  contentId: string,
  price: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('content')
      .update({ price: price })
      .eq('id', contentId);

    if (error) {
      console.error('Error setting content price:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in setContentPrice:', error);
    return false;
  }
}

/**
 * Set price for a TV series season
 */
export async function setSeasonPrice(
  contentId: string,
  seasonNumber: number,
  price: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('season_prices')
      .upsert(
        {
          content_id: contentId,
          season_number: seasonNumber,
          price: price,
        },
        {
          onConflict: 'content_id,season_number',
        }
      );

    if (error) {
      console.error('Error setting season price:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in setSeasonPrice:', error);
    return false;
  }
}

/**
 * Get all season prices for a TV series
 */
export async function getSeasonPrices(contentId: string): Promise<SeasonPrice[]> {
  try {
    const { data, error } = await supabase
      .from('season_prices')
      .select('*')
      .eq('content_id', contentId)
      .order('season_number', { ascending: true });

    if (error) {
      console.error('Error fetching season prices:', error);
      return [];
    }

    return data as SeasonPrice[];
  } catch (error) {
    console.error('Error in getSeasonPrices:', error);
    return [];
  }
}

/**
 * Delete season price
 */
export async function deleteSeasonPrice(
  contentId: string,
  seasonNumber: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('season_prices')
      .delete()
      .eq('content_id', contentId)
      .eq('season_number', seasonNumber);

    if (error) {
      console.error('Error deleting season price:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteSeasonPrice:', error);
    return false;
  }
}

/**
 * Bulk set season prices for a TV series
 */
export async function bulkSetSeasonPrices(
  contentId: string,
  seasonPrices: { seasonNumber: number; price: number }[]
): Promise<boolean> {
  try {
    const records = seasonPrices.map((sp) => ({
      content_id: contentId,
      season_number: sp.seasonNumber,
      price: sp.price,
    }));

    const { error } = await supabase
      .from('season_prices')
      .upsert(records, {
        onConflict: 'content_id,season_number',
      });

    if (error) {
      console.error('Error bulk setting season prices:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in bulkSetSeasonPrices:', error);
    return false;
  }
}

/**
 * Get content price
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
