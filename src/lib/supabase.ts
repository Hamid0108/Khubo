import { createClient } from '@supabase/supabase-js';

// These are public keys meant for the browser, safe to include here.
let envUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL;
let envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (envUrl === 'undefined' || envUrl === "''" || envUrl === '""') envUrl = '';
if (envKey === 'undefined' || envKey === "''" || envKey === '""') envKey = '';

let supabaseUrl = (envUrl && envUrl.trim().length > 0) ? envUrl.trim() : 'https://aggqfzosjxcxpxydtjfh.supabase.co';
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  supabaseUrl = `https://${supabaseUrl}`;
}

const supabaseAnonKey = (envKey && envKey.trim().length > 0) ? envKey.trim() : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZ3Fmem9zanhjeHB4eWR0amZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMzUzNzcsImV4cCI6MjA4MjkxMTM3N30.1oCKVlqY2tdbYvE19R6YAhVrlCwT3sTn6Wuw7AxWznc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
