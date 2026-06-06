import { useState, useEffect } from 'react';
import { LISTINGS as MOCK_LISTINGS } from '../mocks/listings';
import { Listing } from '../types';

/**
 * Custom hook to fetch and manage a list of property listings.
 * Currently simulates an API fetch delay and returns local mock data.
 * Ready to be swapped with real API calls using Supabase.
 *
 * @returns {{ listings: Listing[], loading: boolean }} The fetched listings and loading state
 */
export function useListings() {
  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      setListings(MOCK_LISTINGS);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return { listings, loading };
}
