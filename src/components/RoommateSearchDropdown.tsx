import React, { useMemo } from 'react';
import { Search, MapPin, TrendingUp, Users, Award, ShieldCheck } from 'lucide-react';
import { ROOMMATES } from '../data/roommates';
import { Roommate } from '../types';

interface RoommateSearchDropdownProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onClose: () => void;
  onSelectRoommate?: (roommate: Roommate) => void;
}

export default function RoommateSearchDropdown({
  searchQuery,
  setSearchQuery,
  onClose,
  onSelectRoommate
}: RoommateSearchDropdownProps) {
  const query = searchQuery.trim().toLowerCase();

  const matches = useMemo(() => {
    // Standard tag list for Quick Searches
    const tagList = [
      'Near MSU-IIT', 'All Female', 'Solo Room', 'Shared Room', 
      'All Male', 'Affordable', 'Bed Spacer', 'Boarding House', 
      'Quiet', 'Clean', 'Night owl', 'Introvert'
    ];

    if (!query) {
      return {
        popular: tagList.slice(0, 6),
        roommates: ROOMMATES.slice(0, 3)
      };
    }

    const matchingTags = tagList
      .filter(tag => tag.toLowerCase().includes(query))
      .slice(0, 4);

    const matchingRoommates = ROOMMATES.filter(roommate => {
      const nameMatch = roommate.name.toLowerCase().includes(query);
      const bioMatch = roommate.bio ? roommate.bio.toLowerCase().includes(query) : false;
      const placeMatch = roommate.preferredPlace.toLowerCase().includes(query);
      const tagsMatch = roommate.tags.some(tag => tag.toLowerCase().includes(query));
      const genderMatch = roommate.gender ? roommate.gender.toLowerCase().includes(query) : false;
      const universityMatch = roommate.university ? roommate.university.toLowerCase().includes(query) : false;
      return nameMatch || bioMatch || placeMatch || tagsMatch || genderMatch || universityMatch;
    }).slice(0, 3);

    return {
      popular: matchingTags,
      roommates: matchingRoommates
    };
  }, [query]);

  const handleSuggestionClick = (text: string) => {
    setSearchQuery(text);
    // Smooth scroll to roommate results
    setTimeout(() => {
      const resultsDiv = document.getElementById('roommate-results-anchor') || document.querySelector('main');
      resultsDiv?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    onClose();
  };

  const handleRoommateClick = (roommate: Roommate) => {
    if (onSelectRoommate) {
      onSelectRoommate(roommate);
    }
    onClose();
  };

  return (
    <div className="absolute top-[100%] mt-2 md:mt-3 left-0 right-0 bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden z-[99] text-left pointer-events-auto flex flex-col md:flex-row max-h-[60vh] md:max-h-[360px]">
      
      {/* Left panel: Quick tags & Searches */}
      <div className="flex-1 border-b md:border-b-0 md:border-r border-neutral-100 p-4 sm:p-5 overflow-y-auto">
        <div>
          <h4 className="text-[11px] sm:text-xs font-black uppercase text-neutral-400 tracking-wider flex items-center gap-1.5 mb-3">
            <TrendingUp size={13} className="text-[#2252D6]" />
            Roommate Tags & Filters
          </h4>
          <div className="flex flex-wrap gap-2">
            {matches.popular.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(item)}
                className="text-xs sm:text-[13px] font-medium bg-[#17294F]/5 text-[#17294F] hover:bg-[#17294F] hover:text-white px-3 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1.5 cursor-pointer focus-visible:outline-none"
              >
                <Search size={11} />
                {item}
              </button>
            ))}
            {matches.popular.length === 0 && (
              <span className="text-xs text-neutral-400 italic">No matching tags</span>
            )}
          </div>
        </div>
      </div>

      {/* Right panel: Roommates suggestions */}
      <div className="flex-[1.2] bg-neutral-50/50 p-4 sm:p-5 overflow-y-auto flex flex-col gap-4">
        <div>
          <h4 className="text-[11px] sm:text-xs font-black uppercase text-neutral-400 tracking-wider flex items-center gap-1.5 mb-3">
            <Users size={13} className="text-[#2252D6]" />
            Matching Roommates
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {matches.roommates.map((roommate) => (
              <div
                key={roommate.id}
                onClick={() => handleRoommateClick(roommate)}
                className="flex gap-3 bg-white p-2.5 rounded-xl border border-neutral-100 hover:border-[#17294F]/20 hover:shadow-sm transition-all duration-150 cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-100 border-2 border-white shadow-sm flex-shrink-0 relative">
                  <img
                    src={roommate.image}
                    alt={roommate.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0 text-left flex flex-col justify-between py-0.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <h5 className="text-xs sm:text-sm font-semibold text-neutral-900 leading-snug truncate group-hover:text-[#2252D6] transition-colors">
                        {roommate.name}
                      </h5>
                      <span className="text-[10px] text-neutral-500 font-medium flex-shrink-0">
                        • {roommate.gender}
                      </span>
                    </div>
                    <p className="text-[9px] sm:text-xs text-neutral-500 truncate flex items-center mt-0.5">
                      <MapPin size={10} className="mr-0.5 text-neutral-400" />
                      Prefers: {roommate.preferredPlace}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-semibold text-[#17294F] bg-[#17294F]/5 px-2 py-0.5 rounded">
                      {roommate.budgetRange}
                    </span>
                    <span className="text-[9px] text-[#2252D6] font-semibold flex items-center gap-0.5 bg-[#2252D6]/5 px-1.5 py-0.5 rounded">
                      <ShieldCheck size={10} />
                      {roommate.university}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {matches.roommates.length === 0 && (
              <div className="p-4 bg-white rounded-xl text-center border border-dashed border-neutral-200">
                <p className="text-xs text-neutral-400">No roommates match your search</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
