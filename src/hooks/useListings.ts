import { useState, useEffect } from 'react';
import { LISTINGS as MOCK_LISTINGS } from '../data/listings';
import { Listing } from '../types';

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
