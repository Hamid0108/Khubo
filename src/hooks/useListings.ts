import { useState, useEffect } from 'react';
import { Listing } from '../types';
import { supabase } from '../lib/supabaseClient';

export function useListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: sbError } = await supabase
          .from('listings')
          .select('*')
          .order('created_at', { ascending: false });

        if (sbError) throw sbError;

        const mapped: Listing[] = (data || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          location: item.location,
          description: item.description,
          price: Number(item.price),
          rating: Number(item.rating || 5.0),
          image: item.image,
          gallery: Array.isArray(item.gallery) ? item.gallery : (item.image ? [item.image] : []),
          category: item.category,
          date: item.date || 'Available now',
          amenities: Array.isArray(item.amenities) ? item.amenities : [],
          lat: item.lat ? Number(item.lat) : undefined,
          lng: item.lng ? Number(item.lng) : undefined,
          landlord_id: item.landlord_id,
          reviews: Array.isArray(item.reviews) ? item.reviews : [],
          host: item.host && Object.keys(item.host).length > 0 ? item.host : {
            name: 'Khubo Host',
            image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.id}`,
            reviews: 0,
            rating: 5.0,
            hostingDuration: 'New host',
            work: '',
            location: item.location,
          },
        }));

        setListings(mapped);
      } catch (err: any) {
        console.error('Error fetching listings:', err);
        setError(err.message || 'Failed to load listings.');
        setListings([]);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, []);

  return { listings, loading, error };
}
