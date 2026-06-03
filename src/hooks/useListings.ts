import { useState, useEffect } from 'react';
import { LISTINGS as MOCK_LISTINGS } from '../data/listings';
import { Listing } from '../types';
import { supabase } from '../lib/supabase';

export function useListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch from Supabase
        const { data: supabaseListings, error } = await supabase
          .from('listings')
          .select('*');

        if (error) throw error;

        const allListings = [...MOCK_LISTINGS, ...(supabaseListings || [])];

        // Deduplicate by ID
        const uniqueListings = Array.from(
          new Map(allListings.map((item) => [item.id, item])).values()
        );

        setListings(uniqueListings);
      } catch (e) {
        console.error("Error fetching listings:", e);
        // Fallback to mock if fetch fails
        setListings(MOCK_LISTINGS);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { listings, loading };
}
