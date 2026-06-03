import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LISTINGS as MOCK_LISTINGS } from '../data/listings';
import { Listing } from '../types';

export function useListings() {
  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching listings from Supabase:', error);
          setListings(MOCK_LISTINGS);
          return;
        }

        if (data && data.length > 0) {
          // Merge Supabase listings with mock listings (Supabase first)
          // Also format data to match Listing interface if needed
          const supabaseListings: Listing[] = data.map((d: any) => ({
            id: d.id,
            title: d.title,
            location: d.location,
            description: d.description,
            price: d.price,
            rating: d.rating || 0,
            image: d.image || d.gallery?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
            gallery: d.gallery || [],
            category: d.category || 'Boarding House',
            date: d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Now available',
            amenities: d.amenities || [],
            lat: d.lat,
            lng: d.lng,
            reviews: [], // Would need a join if reviews are in another table
            host: {
              name: 'Host',
              image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
              reviews: 0,
              rating: 5,
              hostingDuration: '1 month',
              work: 'Property Manager',
              location: d.location
            }
          }));

          setListings([...supabaseListings, ...MOCK_LISTINGS]);
        } else {
          setListings(MOCK_LISTINGS);
        }
      } catch (err) {
        console.error('Unexpected error fetching listings:', err);
        setListings(MOCK_LISTINGS);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, []);

  return { listings, loading };
}
