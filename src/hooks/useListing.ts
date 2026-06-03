import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LISTINGS as MOCK_LISTINGS } from '../data/listings';
import { Listing } from '../types';

export function useListing(id: string | undefined) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListing() {
      if (!id) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          // Fallback to mock
          const mockListing = MOCK_LISTINGS.find(l => l.id === id);
          setListing(mockListing || null);
          return;
        }

        const supabaseListing: Listing = {
          id: data.id,
          title: data.title,
          location: data.location,
          description: data.description,
          price: data.price,
          rating: data.rating || 0,
          image: data.image || data.gallery?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
          gallery: data.gallery || [],
          category: data.category || 'Boarding House',
          date: data.created_at ? new Date(data.created_at).toLocaleDateString() : 'Now available',
          amenities: data.amenities || [],
          lat: data.lat,
          lng: data.lng,
          reviews: [],
          host: {
            name: 'Host',
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
            reviews: 0,
            rating: 5,
            hostingDuration: '1 month',
            work: 'Property Manager',
            location: data.location
          }
        };

        setListing(supabaseListing);
      } catch (err) {
        console.error('Unexpected error fetching listing:', err);
        const mockListing = MOCK_LISTINGS.find(l => l.id === id);
        setListing(mockListing || null);
      } finally {
        setLoading(false);
      }
    }

    fetchListing();
  }, [id]);

  return { listing, loading };
}
