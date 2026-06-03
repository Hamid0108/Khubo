import { useState, useEffect } from 'react';
import { LISTINGS as MOCK_LISTINGS } from '../data/listings';
import { Listing } from '../types';

export function useListing(id: string | undefined) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      const mockListing = MOCK_LISTINGS.find(l => l.id === id);
      setListing(mockListing || null);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

  return { listing, loading };
}
