import React, { useMemo } from 'react';
import { Search, MapPin, TrendingUp, Building, CornerDownLeft, Star } from 'lucide-react';
import { useListings } from '../hooks/useListings';
import { Listing } from '../types';
import { useNavigate } from 'react-router-dom';

interface SearchDropdownProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onClose: () => void;
  onSelectListing?: (id: string) => void;
}

export default function SearchDropdown({
  searchQuery,
  setSearchQuery,
  onClose,
  onSelectListing
}: SearchDropdownProps) {
  const navigate = useNavigate();
  const query = searchQuery.trim().toLowerCase();
  const { listings: LISTINGS } = useListings();

  // Get matching results
  const matches = useMemo(() => {
    const dataListings = LISTINGS || [];
    if (!query) {
      return {
        popular: ['Near MSU-IIT', 'Solo Room', 'All Female', 'Affordable', 'With Aircon', 'WiFi Included'],
        listings: dataListings.slice(0, 2),
      };
    }

    // Filter categories / tags
    const matchingCategories = ['Near MSU-IIT', 'All Female', 'Solo Room', 'Shared Room', 'All Male', 'Affordable', 'Bed Spacer', 'Boarding House', 'Apartment', 'Transient', 'With Aircon', 'WiFi Included']
      .filter(cat => cat.toLowerCase().includes(query))
      .slice(0, 4);

    // Filter listings
    const matchingListings = dataListings.filter(listing => 
      listing.title.toLowerCase().includes(query) ||
      listing.location.toLowerCase().includes(query) ||
      listing.category.toLowerCase().includes(query) ||
      listing.description.toLowerCase().includes(query)
    ).slice(0, 2);

    return {
      popular: matchingCategories,
      listings: matchingListings,
    };
  }, [query, LISTINGS]);

  const handleSuggestionClick = (text: string) => {
    setSearchQuery(text);
    // Smooth scroll to results
    setTimeout(() => {
      const resultsDiv = document.getElementById('search-results-anchor') || document.querySelector('main');
      resultsDiv?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    onClose();
  };

  const handleListingClick = (id: string) => {
    if (onSelectListing) {
      onSelectListing(id);
    } else {
      navigate(`/listing/${id}`);
    }
    onClose();
  };

  const hasResults = matches.popular.length > 0 || matches.listings.length > 0;

  return (
    <div className="absolute top-[100%] mt-2 md:mt-3 left-0 right-0 bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden z-[99] text-left pointer-events-auto flex flex-col md:flex-row max-h-[60dvh] md:max-h-[360px]">
      
      {/* Left panel: General Suggestions & Quick Searches */}
      <div className="flex-1 border-b md:border-b-0 md:border-r border-neutral-100 p-4 sm:p-5 overflow-y-auto">
        {/* Popular Tags / Query Autocompletes */}
        <div>
          <h4 className="text-[11px] sm:text-xs font-black uppercase text-neutral-400 tracking-wider flex items-center gap-1.5 mb-3">
            <TrendingUp size={13} className="text-[#2252D6]" />
            Trending Searches
          </h4>
          <div className="flex flex-wrap gap-2">
            {matches.popular.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(item)}
                className="text-xs sm:text-[13px] font-bold bg-[#17294F]/5 text-[#17294F] hover:bg-[#17294F] hover:text-white px-3 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1.5 cursor-pointer focus-visible:outline-none"
              >
                <Search size={11} />
                {item}
              </button>
            ))}
            {matches.popular.length === 0 && (
              <span className="text-xs text-neutral-400 italic">No trending suggestions match</span>
            )}
          </div>
        </div>
      </div>

      {/* Right panel: Rooms suggestions */}
      <div className="flex-[1.2] bg-neutral-50/50 p-4 sm:p-5 overflow-y-auto flex flex-col gap-4">
        {/* Rooms / Listings Section */}
        <div>
          <h4 className="text-[11px] sm:text-xs font-black uppercase text-neutral-400 tracking-wider flex items-center gap-1.5 mb-3">
            <Building size={13} className="text-[#2252D6]" />
            Matching Dorms & Rooms
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {matches.listings.map((listing) => (
              <div
                key={listing.id}
                onClick={() => handleListingClick(listing.id)}
                className="flex gap-3 bg-white p-2.5 rounded-xl border border-neutral-100 hover:border-[#17294F]/20 hover:shadow-sm transition-all duration-150 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-neutral-200 flex-shrink-0 relative">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-1 left-1 bg-[#17294F] text-white text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Star size={7} fill="currentColor" stroke="none" />
                    {listing.rating.toFixed(1)}
                  </div>
                </div>
                <div className="flex-1 min-w-0 text-left flex flex-col justify-between py-0.5">
                  <div className="min-w-0">
                    <h5 className="text-xs sm:text-sm font-extrabold text-neutral-900 leading-snug truncate group-hover:text-[#2252D6] transition-colors">{listing.title}</h5>
                    <p className="text-[10px] sm:text-xs text-neutral-500 truncate flex items-center mt-1">
                      <MapPin size={10} className="mr-0.5" />
                      {listing.location}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs sm:text-[13px] font-black text-[#17294F]">₱{listing.price.toLocaleString()}/mo</span>
                    <span className="text-[9px] sm:text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-semibold font-mono">{listing.category}</span>
                  </div>
                </div>
              </div>
            ))}
            {matches.listings.length === 0 && (
              <div className="p-4 bg-white rounded-xl text-center border border-dashed border-neutral-200">
                <p className="text-xs text-neutral-400">No rooms match your search</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
