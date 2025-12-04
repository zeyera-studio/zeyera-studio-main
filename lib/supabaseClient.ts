import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// Using import.meta.env for Vite support
// Casting import.meta to any to bypass TS error when vite/client types are missing
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);