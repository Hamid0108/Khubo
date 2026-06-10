import { useState, useEffect } from 'react';
import { Roommate } from '../types';
import { supabase } from '../lib/supabaseClient';

export function useRoommates() {
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoommates();
  }, []);

  async function fetchRoommates() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from('roommates')
        .select('*')
        .order('created_at', { ascending: false });

      if (sbError) throw sbError;

      const mapped: Roommate[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        age: item.age,
        gender: item.gender,
        university: item.university,
        location: item.location,
        bio: item.bio,
        image: item.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.id}`,
        tags: Array.isArray(item.tags) ? item.tags : [],
        budgetRange: item.budget_range,
        preferredPlace: item.preferred_place,
        userId: item.user_id,
      }));

      setRoommates(mapped);
    } catch (err: any) {
      console.error('Error fetching roommates:', err);
      setError(err.message || 'Failed to load roommates.');
      setRoommates([]);
    } finally {
      setLoading(false);
    }
  }

  const refetch = () => fetchRoommates();

  return { roommates, setRoommates, loading, error, refetch };
}
