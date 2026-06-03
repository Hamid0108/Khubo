import { createClient } from '@supabase/supabase-js';

// These are public keys meant for the browser, safe to include here.
let envUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL as string | undefined;
let envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Fallback logic
const DEFAULT_URL = 'https://aggqfzosjxcxpxydtjfh.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZ3Fmem9zanhjeHB4eWR0amZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMzUzNzcsImV4cCI6MjA4MjkxMTM3N30.1oCKVlqY2tdbYvE19R6YAhVrlCwT3sTn6Wuw7AxWznc';

function isValidUrl(url: string | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url === 'undefined' || url === 'null' || url === "''" || url === '""') return false;
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
}

let supabaseUrl = isValidUrl(envUrl) ? envUrl!.trim() : DEFAULT_URL;
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  supabaseUrl = `https://${supabaseUrl}`;
}

let supabaseAnonKey = (envKey && typeof envKey === 'string' && envKey !== 'undefined' && envKey !== 'null' && envKey.trim().length > 0) ? envKey.trim() : DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
