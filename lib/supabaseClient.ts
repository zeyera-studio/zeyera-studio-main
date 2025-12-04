import { createClient } from '@supabase/supabase-js';

// Support both standard process.env (Create React App) and import.meta.env (Vite)
const getEnv = (key: string, viteKey: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env[viteKey];
  }
  return process.env[key];
};

const supabaseUrl = getEnv('SUPABASE_URL', 'VITE_SUPABASE_URL') || process.env.SUPABASE_URL || '';
const supabaseKey = getEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY') || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Key is missing. Authentication will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);