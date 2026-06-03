import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Star, MapPin, Edit, Users, Loader2 } from 'lucide-react';
import { EditListingModal } from '../components/EditListingModal';
import { useNavigate } from 'react-router-dom';

export default function ManageListings() {
  const { user, isLoading: authLoading } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingListing, setEditingListing] = useState<any | null>(null);
  const navigate = useNavigate();

  const fetchMyListings = async () => {
    setLoading(true);
    // Mock listings fetch
    setTimeout(() => {
      setListings([]);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchMyListings();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F9F9F9]">
        <Navbar />
        <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-12 animate-pulse">
          <div className="h-10 bg-neutral-200 rounded w-64 mb-8"></div>
          <div className="flex flex-col gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-neutral-100 flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-1/3 md:w-1/4 aspect-[4/3] rounded-2xl bg-neutral-200 shrink-0"></div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="h-8 bg-neutral-200 rounded w-1/2"></div>
                      <div className="h-6 bg-neutral-200 rounded-full w-24 shrink-0"></div>
                    </div>
                    <div className="h-5 bg-neutral-200 rounded w-1/3 mb-4"></div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="h-6 bg-neutral-200 rounded-full w-16"></div>
                      <div className="h-6 bg-neutral-200 rounded-full w-20"></div>
                      <div className="h-6 bg-neutral-200 rounded-full w-24"></div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-neutral-100">
                    <div className="h-8 bg-neutral-200 rounded w-32"></div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="h-10 bg-neutral-200 rounded-full w-24"></div>
                      <div className="h-10 bg-neutral-200 rounded-full w-24"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F9F9]">
      <Navbar />
      
      <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-neutral-800 mb-8">Manage Listings</h1>
        
        {listings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-800 mb-2">No listings found</h2>
            <p className="text-neutral-500 mb-6">You haven't created any listings yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {listings.map(listing => (
              <div key={listing.id} className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-neutral-100 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
                <div className="w-full sm:w-1/3 md:w-1/4 aspect-[4/3] rounded-2xl overflow-hidden shrink-0">
                  <img src={listing.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'} alt={listing.title} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h2 className="text-2xl font-bold text-neutral-800 line-clamp-1">{listing.title}</h2>
                      <span className="bg-neutral-800 text-white px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider shrink-0">
                        Active Listing
                      </span>
                    </div>
                    
                    <p className="text-neutral-500 mb-4 flex items-center gap-1">
                      <MapPin size={16} />
                      {listing.location}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {listing.rating > 0 && (
                        <div className="flex items-center gap-1 font-bold text-sm bg-neutral-100 px-3 py-1 rounded-full">
                          <Star size={14} className="fill-[#FFB340] text-[#FFB340]" />
                          {listing.rating.toFixed(2)}
                        </div>
                      )}
                      
                      {listing.amenities?.slice(0, 3).map((amenity: string, idx: number) => (
                        <span key={idx} className="bg-neutral-50 border border-neutral-200 text-neutral-600 px-3 py-1 text-sm rounded-full">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-neutral-100">
                    <div className="text-2xl font-bold text-[#17294F]">
                      ₱{listing.price.toLocaleString()} <span className="text-sm font-normal text-neutral-500">/month</span>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                      <button 
                        onClick={() => setEditingListing(listing)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-neutral-300 text-neutral-800 font-bold hover:bg-neutral-50 transition"
                      >
                        <Edit size={18} />
                        Edit Listing
                      </button>
                      <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#4CB051] text-white font-bold hover:bg-[#3f9443] transition">
                        <Users size={18} />
                        Manage Tenants
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {editingListing && (
        <EditListingModal 
          isOpen={true} 
          listing={editingListing}
          onClose={() => setEditingListing(null)}
          onSuccess={() => {
            fetchMyListings(); // Refetch after edit
            setEditingListing(null);
          }}
        />
      )}
    </div>
  );
}
