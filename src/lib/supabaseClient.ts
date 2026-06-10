import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Mock client implementation for offline/fallback mode
const mockSupabase: any = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signOut: () => Promise.resolve(),
    signInWithPassword: () => Promise.resolve({ data: {}, error: null }),
    signUp: () => Promise.resolve({ data: {}, error: null }),
  },
  from: (table: string) => ({
    select: () => ({
      order: () => Promise.resolve({ data: [], error: null }),
      eq: () => Promise.resolve({ data: {}, error: null }),
    }),
    insert: (data: any) => {
      // Offline fallback: save to localStorage if it fits any of our core tables
      try {
        if (table === 'listings') {
          const saved = localStorage.getItem('khubo_listings');
          const current = saved ? JSON.parse(saved) : [];
          localStorage.setItem('khubo_listings', JSON.stringify([data, ...current]));
        } else if (table === 'roommates') {
          const saved = localStorage.getItem('khubo_roommates');
          const current = saved ? JSON.parse(saved) : [];
          localStorage.setItem('khubo_roommates', JSON.stringify([data, ...current]));
        } else if (table === 'reservations') {
          const saved = localStorage.getItem('khubo_reservations');
          const current = saved ? JSON.parse(saved) : [];
          localStorage.setItem('khubo_reservations', JSON.stringify([data, ...current]));
        }
      } catch (err) {
        console.error('Failed to save mock insert to localStorage:', err);
      }
      return Promise.resolve({ data, error: null });
    },
    update: () => Promise.resolve({ data: {}, error: null }),
    delete: () => Promise.resolve({ data: {}, error: null }),
  }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: { path: 'mock-path' }, error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: path } }),
    }),
  },
};

// Use real client if URL and Anon Key are configured in environment variables
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : mockSupabase;
