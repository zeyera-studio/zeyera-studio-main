import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// These should be environment variables in a real application
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);