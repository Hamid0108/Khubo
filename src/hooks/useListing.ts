import { useState, useEffect } from 'react';
import { Listing } from '../types';
import { supabase } from '../lib/supabaseClient';

export function useListing(id: string | undefined) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetchListing() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setListing({
            id: data.id,
            title: data.title,
            location: data.location,
            description: data.description,
            price: Number(data.price),
            rating: Number(data.rating || 5.0),
            image: data.image,
            gallery: Array.isArray(data.gallery) ? data.gallery : (data.image ? [data.image] : []),
            category: data.category,
            date: data.date || 'Available now',
            amenities: Array.isArray(data.amenities) ? data.amenities : [],
            lat: data.lat ? Number(data.lat) : undefined,
            lng: data.lng ? Number(data.lng) : undefined,
            landlord_id: data.landlord_id,
            reviews: Array.isArray(data.reviews) ? data.reviews : [],
            host: data.host && Object.keys(data.host).length > 0 ? data.host : {
              name: 'Khubo Host',
              image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.id}`,
              reviews: 0,
              rating: 5.0,
              hostingDuration: 'New host',
              work: '',
              location: data.location,
            },
          });
        } else {
          setListing(null);
        }
      } catch (err) {
        console.error('Error fetching listing:', err);
        setListing(null);
      } finally {
        setLoading(false);
      }
    }

    fetchListing();
  }, [id]);

  return { listing, loading };
}
