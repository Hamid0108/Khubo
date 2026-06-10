import React, { useState, useMemo, useRef } from 'react';
import RoommateHero from '../components/RoommateHero';
import RoommateCard from '../components/RoommateCard';
import RoommateCardSkeleton from '../components/RoommateCardSkeleton';
import BottomNav from '../components/BottomNav';
import Filters, { FilterState } from '../components/Filters';
import Footer from '../components/Footer';
import { ROOMMATES } from '../mocks/roommates';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronLeft, ChevronRight, ChevronDown, MapPin, Calendar as CalendarIcon, Wallet, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RoommateModal from '../components/RoommateModal';
import { Roommate } from '../types';
import RoommateSearchDropdown from '../components/RoommateSearchDropdown';
import { useRoommates } from '../hooks/useRoommates';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

const TAGS = [
  'ALL', 'Near MSU-IIT', 'All Female', 'Solo Room', 'Shared Room', 'All Male', 
  'Affordable', 'Bed Spacer', 'Boarding House', 'Studio', 'Apartment', 'Transient'
];

function parseSearchQuery(query: string) {
  let tempQuery = query.toLowerCase();
  let parsedLocation = '';
  let parsedBudget = '';

  // 1. Parse Location
  if (tempQuery.includes('cagayan')) {
    parsedLocation = 'Cagayan de Oro';
    tempQuery = tempQuery.replace(/cagayan(\s+de\s+oro)?/gi, '');
  } else if (tempQuery.includes('iligan')) {
    parsedLocation = 'Iligan City';
    tempQuery = tempQuery.replace(/iligan(\s+city)?/gi, '');
  } else if (tempQuery.includes('butuan')) {
    parsedLocation = 'Butuan City';
    tempQuery = tempQuery.replace(/butuan(\s+city)?/gi, '');
  } else if (tempQuery.includes('msu-iit') || tempQuery.includes('msu iit')) {
    parsedLocation = 'MSU-IIT';
    tempQuery = tempQuery.replace(/msu[- ]iit/gi, '');
  } else if (tempQuery.includes('pala-o') || tempQuery.includes('palao')) {
    parsedLocation = 'Pala-o';
    tempQuery = tempQuery.replace(/pala[-]?o/gi, '');
  } else if (tempQuery.includes('tibanga')) {
    parsedLocation = 'Tibanga';
    tempQuery = tempQuery.replace(/tibanga/gi, '');
  }

  // 2. Parse Budget
  const budget1k3kRegex = /(1k\s*-\s*3k|1000\s*-\s*3000|1500)/i;
  const budget3k5kRegex = /(3k\s*-\s*5k|3000\s*-\s*5000|4000)/i;
  const budget5kPlusRegex = /(5k\+|5000\+|6000|5k)/i;

  if (budget1k3kRegex.test(tempQuery)) {
    parsedBudget = '₱1k - ₱3k';
    tempQuery = tempQuery.replace(budget1k3kRegex, '');
  } else if (budget3k5kRegex.test(tempQuery)) {
    parsedBudget = '₱3k - ₱5k';
    tempQuery = tempQuery.replace(budget3k5kRegex, '');
  } else if (budget5kPlusRegex.test(tempQuery)) {
    parsedBudget = '₱5k+';
    tempQuery = tempQuery.replace(budget5kPlusRegex, '');
  }

  // Clean up punctuation and stop words
  const cleanQuery = tempQuery
    .replace(/\b(in|at|for|with|budget|price|of|around|under|above|below)\b/gi, '')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    location: parsedLocation,
    budget: parsedBudget,
    cleanQuery
  };
}

export default function RoommateFinder() {
  const { user } = useAuth();
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [selectedRoommate, setSelectedRoommate] = useState<Roommate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [activeStickyDropdown, setActiveStickyDropdown] = useState<'location' | 'budget' | 'general' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isStickySearchActive, setIsStickySearchActive] = useState(false);
  const [hideStickyDropdown, setHideStickyDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');

  React.useEffect(() => {
    if (!searchQuery) return;

    const parsed = parseSearchQuery(searchQuery);
    let updated = false;

    if (parsed.location && parsed.location !== selectedLocation) {
      setSelectedLocation(parsed.location);
      updated = true;
    }
    if (parsed.budget && parsed.budget !== selectedBudget) {
      setSelectedBudget(parsed.budget);
      updated = true;
    }

    if (parsed.location || parsed.budget) {
      if (searchQuery !== parsed.cleanQuery) {
        setSearchQuery(parsed.cleanQuery);
      }
    }
  }, [searchQuery, selectedLocation, selectedBudget]);

  // Aligned roommate list states
  const { roommates: roommatesList, setRoommates: setRoommatesList, loading: roommatesLoading } = useRoommates();
  const [isCreateRequestOpen, setIsCreateRequestOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    name: 'Micheal B. Jordan',
    age: 20,
    gender: 'Female' as const,
    university: 'MSU-IIT',
    location: 'Tibanga, Iligan City',
    budgetRange: 'P2500-P3000',
    preferredPlace: "Layla's Residences",
    bio: 'CS student, very quiet, stays up late coding. Looking for similar student boarders!',
    tags: 'Quiet, Clean, CS Student'
  });

  React.useEffect(() => {
    try {
      const cached = localStorage.getItem('khubo_user_profile');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed) {
          setNewRequest(prev => ({
            ...prev,
            name: parsed.nickname || parsed.full_name || prev.name,
            location: parsed.location || prev.location,
            university: parsed.school_or_company || prev.university,
            bio: parsed.bio || prev.bio,
            gender: parsed.gender || prev.gender,
            tags: parsed.lifestyle && parsed.lifestyle.length > 0 
              ? parsed.lifestyle.map((id: string) => {
                  const labelMap: Record<string, string> = {
                    pet_friendly: 'Pet-friendly', non_smoker: 'Non-smoker', vegan: 'Vegan',
                    fitness: 'Gym lover', music: 'Into music', foodie: 'Foodie',
                    social: 'Social butterfly', introvert: 'Introvert', remote_work: 'Remote worker', studious: 'Studious'
                  };
                  return labelMap[id] || id;
                }).join(', ')
              : prev.tags
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  React.useEffect(() => {
    if (roommatesLoading) {
      setLoading(true);
    } else {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [roommatesLoading, selectedTag, searchQuery, roommatesList]);

  React.useEffect(() => {
    if (isStickySearchActive) {
      setHideStickyDropdown(false);
    }
  }, [isStickySearchActive]);

  React.useEffect(() => {
    if (!isSticky || !isStickySearchActive) {
      setActiveStickyDropdown(null);
    }
  }, [isSticky, isStickySearchActive]);

  const openProfile = (roommate: Roommate) => {
    setSelectedRoommate(roommate);
    setIsModalOpen(true);
  };

  const closeProfile = () => {
    setIsModalOpen(false);
  };
  const observerRef = useRef<HTMLDivElement>(null);
  const searchObserverRef = useRef<HTMLDivElement>(null);
  const recommendedRef = useRef<HTMLDivElement>(null);
  const nearMsuIitRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [filters, setFilters] = useState<FilterState>({
    minPrice: 0,
    maxPrice: 50000,
    minRating: 0,
    sortBy: 'relevance'
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { rootMargin: '-1px 0px 0px 0px', threshold: 1.0 }
    );
    
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowSearch(!entry.isIntersecting);
      },
      { rootMargin: '-70px 0px 0px 0px', threshold: 0 }
    );
    
    if (searchObserverRef.current) {
      observer.observe(searchObserverRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const displaySearch = isMobile ? (isSticky && showSearch) : isSticky;

  React.useEffect(() => {
    if (displaySearch) {
      setIsSearchActive(false);
    }
  }, [displaySearch]);

  const stickyDropdownRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (stickyDropdownRef.current && !stickyDropdownRef.current.contains(e.target as Node)) {
        setActiveStickyDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleStickyDropdown = (dropdown: 'location' | 'budget') => {
    setActiveStickyDropdown(activeStickyDropdown === dropdown ? null : dropdown);
  };

  const filteredRoommates = useMemo(() => {
    let result = [...roommatesList];
    
    if (selectedTag !== 'ALL') {
      const tagLower = selectedTag.toLowerCase();
      result = result.filter(roommate => {
        // 1. Direct tag match (case-insensitive)
        const hasTag = roommate.tags.some(tag => tag.toLowerCase() === tagLower);
        if (hasTag) return true;
        
        // 2. Direct preferred place match
        const hasPlace = roommate.preferredPlace.toLowerCase().includes(tagLower);
        if (hasPlace) return true;
        
        // 3. Special Semantic Tags matching
        if (tagLower === 'near msu-iit') {
          return roommate.university.toLowerCase().includes('msu-iit') || 
                 roommate.location.toLowerCase().includes('msu-iit') ||
                 roommate.preferredPlace.toLowerCase().includes('msu-iit');
        }
        if (tagLower === 'all female') {
          return roommate.gender.toLowerCase() === 'female';
        }
        if (tagLower === 'all male') {
          return roommate.gender.toLowerCase() === 'male';
        }
        if (tagLower === 'solo room') {
          return roommate.tags.some(t => t.toLowerCase().includes('solo')) || 
                 roommate.preferredPlace.toLowerCase().includes('single') ||
                 roommate.preferredPlace.toLowerCase().includes('solo');
        }
        if (tagLower === 'shared room') {
          return roommate.tags.some(t => t.toLowerCase().includes('shared')) || 
                 roommate.preferredPlace.toLowerCase().includes('boarders') ||
                 roommate.preferredPlace.toLowerCase().includes('dormitory') ||
                 roommate.preferredPlace.toLowerCase().includes('shared');
        }
        if (tagLower === 'affordable') {
          const match = roommate.budgetRange.match(/\d+/);
          if (match) {
            const val = parseInt(match[0], 10);
            return val <= 2500;
          }
          return false;
        }
        
        return false;
      });
    }

    // Filter by Selected Location
    if (selectedLocation) {
      const loc = selectedLocation.toLowerCase();
      result = result.filter(roommate => 
        roommate.location.toLowerCase().includes(loc) || 
        roommate.preferredPlace.toLowerCase().includes(loc) ||
        roommate.university.toLowerCase().includes(loc)
      );
    }

    // Filter by Selected Budget Range
    if (selectedBudget) {
      result = result.filter(roommate => {
        const numbers = roommate.budgetRange.match(/\d+/g);
        if (!numbers) return true;
        const maxBudget = Math.max(...numbers.map(Number));
        if (selectedBudget === '₱1k - ₱3k') {
          return maxBudget <= 3000;
        } else if (selectedBudget === '₱3k - ₱5k') {
          return maxBudget >= 3000 && maxBudget <= 5000;
        } else if (selectedBudget === '₱5k+') {
          return maxBudget >= 5000;
        }
        return true;
      });
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(roommate => {
        const nameMatch = roommate.name.toLowerCase().includes(q);
        const bioMatch = roommate.bio ? roommate.bio.toLowerCase().includes(q) : false;
        const placeMatch = roommate.preferredPlace.toLowerCase().includes(q);
        const tagsMatch = roommate.tags.some(tag => tag.toLowerCase().includes(q));
        const genderMatch = roommate.gender ? roommate.gender.toLowerCase().includes(q) : false;
        const universityMatch = roommate.university ? roommate.university.toLowerCase().includes(q) : false;
        return nameMatch || bioMatch || placeMatch || tagsMatch || genderMatch || universityMatch;
      });
    }

    return result;
  }, [selectedTag, searchQuery, roommatesList, selectedLocation, selectedBudget]);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.8;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-32">
      <RoommateHero 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearchActive={isSearchActive}
        setIsSearchActive={setIsSearchActive}
        onOpenMobileSearch={() => setIsSearchActive(true)}
        onSelectRoommate={openProfile}
        suppressDropdown={displaySearch}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        selectedBudget={selectedBudget}
        setSelectedBudget={setSelectedBudget}
      />
      <div id="roommate-results-anchor" />
      <div ref={observerRef} className="w-full h-[1px] invisible pointer-events-none" />
      
      {/* Sticky Header with Categories & Search */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="max-w-[2520px] mx-auto xl:px-12 md:px-12 sm:px-4 px-0 flex items-center justify-between min-h-[70px]">
          <AnimatePresence mode="wait">
            {displaySearch ? (
              <motion.div 
                key="search"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between w-full py-3 px-2 sm:px-0"
              >
                <div className="hidden md:block flex-1 min-w-0"></div>
                <div className="flex justify-center flex-[3] lg:flex-none min-w-0 w-full px-2 sm:px-0" ref={stickyDropdownRef}>
                  <div 
                    className="bg-white border border-neutral-200 p-1.5 sm:p-2 md:p-2 rounded-full flex items-center text-neutral-800 shadow-lg w-full max-w-[340px] sm:max-w-[480px] md:max-w-[650px] lg:max-w-[750px] relative transition-all duration-300 pointer-events-auto cursor-default"
                  >
                    {isStickySearchActive ? (
                      <>
                        <div className="flex-1 flex items-center pl-4 md:pl-5 pr-0 py-0 w-full">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              setHideStickyDropdown(false);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setHideStickyDropdown(true);
                                setIsStickySearchActive(false);
                              }
                            }}
                            placeholder="Search rooms, location..."
                            className="w-full bg-transparent border-none outline-none text-xs sm:text-sm font-bold text-neutral-800 placeholder:text-neutral-400 focus:ring-0 p-0"
                            autoFocus
                          />
                          {searchQuery && (
                            <button 
                              onClick={() => setSearchQuery('')} 
                              className="p-1 hover:bg-neutral-100 rounded-full transition-colors flex-shrink-0"
                              aria-label="Clear search"
                            >
                              <X className="w-3.5 h-3.5 text-neutral-500" />
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              setIsStickySearchActive(false);
                            }}
                            className="bg-[#17294F] p-1.5 sm:p-2 md:p-2.5 rounded-full transition-all duration-200 shadow-md ml-0.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17294F] flex-shrink-0 flex items-center justify-center cursor-pointer"
                          >
                            <Search className="text-white w-3 h-3 sm:w-4 sm:h-4 group-hover:stroke-[3px] transition-all" />
                          </button>
                        </div>
                        {!hideStickyDropdown && (
                          <RoommateSearchDropdown
                            searchQuery={searchQuery}
                            setSearchQuery={(val) => {
                              setSearchQuery(val);
                              setHideStickyDropdown(true);
                            }}
                            onClose={() => {
                              setHideStickyDropdown(true);
                              setIsStickySearchActive(false);
                            }}
                            onSelectRoommate={(roommate) => openProfile(roommate)}
                          />
                        )}
                      </>
                    ) : (
                      <>
                        {/* Sticky Location Section */}
                        <div className="flex-1 min-w-0">
                          <div 
                            role="button" 
                            tabIndex={0} 
                            aria-label="Location: Location"
                            onClick={() => {
                              setActiveStickyDropdown(activeStickyDropdown === 'location' ? null : 'location');
                            }}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setActiveStickyDropdown(activeStickyDropdown === 'location' ? null : 'location'))}
                            className={`w-full flex items-center justify-between px-2 sm:px-3 md:pl-5 md:pr-3 py-2 md:py-2 transition-all cursor-pointer select-none group focus-visible:outline-none ${
                                activeStickyDropdown === 'location' 
                                ? 'bg-neutral-100 rounded-full text-[#17294F] relative z-[60] shadow-sm' 
                                : 'hover:bg-neutral-50 rounded-full'
                              }`}
                          >
                            <div className="flex items-center gap-1 md:gap-2.5 min-w-0">
                              <MapPin className="text-[#2252D6] flex-shrink-0 w-4 h-4 sm:w-4 sm:h-4 md:w-[15px] md:h-[15px]" />
                              <span className={`text-xs sm:text-sm md:text-sm font-bold truncate md:whitespace-nowrap text-neutral-800`}>
                                {selectedLocation || 'Location'}
                              </span>
                              {selectedLocation && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLocation('');
                                    setSearchQuery('');
                                  }}
                                  className="p-0.5 hover:bg-neutral-200 rounded-full text-neutral-500 ml-1 flex-shrink-0 z-[70] cursor-pointer pointer-events-auto"
                                >
                                  <X size={10} />
                                </button>
                              )}
                            </div>
                            <ChevronDown className={`flex-shrink-0 opacity-50 text-neutral-500 group-hover:opacity-100 transition-all w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeStickyDropdown === 'location' ? 'rotate-180' : ''}`} />
                          </div>

                          <AnimatePresence>
                            {activeStickyDropdown === 'location' && (
                              <motion.div
                                initial={{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }}
                                animate={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
                                exit={{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }}
                                transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
                                className="absolute top-[100%] mt-2 left-0 w-full bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] md:shadow-xl border border-neutral-100 p-3 z-50 text-left"
                              >
                                <div className="space-y-3">
                                  <div>
                                    <div className="flex items-center px-3 py-2 bg-neutral-100 rounded-xl mb-2 focus-within:ring-2 focus-within:ring-[#2252D6]/20 transition-all cursor-text" onClick={(e) => { e.stopPropagation(); (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus(); }}>
                                      <Search className="w-3.5 h-3.5 text-neutral-400 mr-2 flex-shrink-0" />
                                      <input 
                                        type="text"
                                        placeholder="Search location..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-transparent border-none outline-none text-xs font-semibold text-neutral-900 placeholder:text-neutral-400 p-0 focus:ring-0"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      {['Iligan City', 'Cagayan de Oro', 'Butuan City', 'MSU-IIT', 'Pala-o', 'Tibanga'].map((loc) => (
                                        <button 
                                          key={loc}
                                          onClick={() => { 
                                            setSelectedLocation(loc);
                                            setSearchQuery(loc); 
                                            setActiveStickyDropdown(null); 
                                          }}
                                          className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-50 transition-colors group"
                                        >
                                          <div className="w-6 h-6 rounded bg-[#2252D6]/10 flex items-center justify-center text-[#2252D6] group-hover:bg-[#2252D6] group-hover:text-white transition-all">
                                            <MapPin size={12} />
                                          </div>
                                          <span className="font-medium text-neutral-800 text-xs">{loc}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="w-[1px] h-3 sm:h-4 bg-neutral-200 flex-shrink-0 self-center" />

                        {/* Sticky Budget Section */}
                        <div className="flex-1 min-w-0">
                          <div 
                            role="button" 
                            tabIndex={0} 
                            aria-label="Add budget"
                            onClick={() => {
                              setActiveStickyDropdown(activeStickyDropdown === 'budget' ? null : 'budget');
                            }}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setActiveStickyDropdown(activeStickyDropdown === 'budget' ? null : 'budget'))}
                            className={`w-full flex items-center justify-between px-2 sm:px-3 md:pl-5 md:pr-3 py-2 md:py-2 transition-all cursor-pointer select-none group focus-visible:outline-none ${
                                activeStickyDropdown === 'budget' 
                                ? 'bg-neutral-100 rounded-full text-[#17294F] relative z-[60] shadow-sm' 
                                : 'hover:bg-neutral-50 rounded-full'
                              }`}
                          >
                            <div className="flex items-center gap-1 md:gap-2.5 min-w-0">
                              <Wallet className="text-[#2252D6] flex-shrink-0 w-4 h-4 sm:w-4 sm:h-4 md:w-[15px] md:h-[15px]" />
                              <span className={`text-xs sm:text-sm md:text-sm font-bold truncate md:whitespace-nowrap text-neutral-800`}>
                                {selectedBudget || 'Budget'}
                              </span>
                              {selectedBudget && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBudget('');
                                    setSearchQuery('');
                                  }}
                                  className="p-0.5 hover:bg-neutral-200 rounded-full text-neutral-500 ml-1 flex-shrink-0 z-[70] cursor-pointer pointer-events-auto"
                                >
                                  <X size={10} />
                                </button>
                              )}
                            </div>
                            <ChevronDown className={`flex-shrink-0 opacity-50 text-neutral-500 group-hover:opacity-100 transition-all w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeStickyDropdown === 'budget' ? 'rotate-180' : ''}`} />
                          </div>

                          <AnimatePresence>
                            {activeStickyDropdown === 'budget' && (
                              <motion.div
                                initial={{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }}
                                animate={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
                                exit={{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }}
                                transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
                                className="absolute top-[100%] mt-2 left-0 w-full bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] md:shadow-xl border border-neutral-100 p-2 md:p-4 z-50 text-left"
                              >
                                <div className="space-y-2">
                                  <div className="grid grid-cols-1 gap-1">
                                    {[
                                      { label: '₱1k - ₱3k' },
                                      { label: '₱3k - ₱5k' },
                                      { label: '₱5k+' }
                                    ].map((range) => (
                                      <button 
                                        key={range.label}
                                        onClick={() => { 
                                          setSelectedBudget(range.label);
                                          setSearchQuery(range.label); 
                                          setActiveStickyDropdown(null); 
                                        }}
                                        className="flex flex-col px-3 py-2.5 rounded-lg bg-transparent hover:bg-neutral-100 transition-all text-left w-full"
                                      >
                                        <span className="font-medium text-neutral-900 text-xs">{range.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Search Button */}
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSearchQuery('');
                            setIsStickySearchActive(true);
                            setActiveStickyDropdown(null);
                          }}
                          aria-label="Search" 
                          className="bg-[#17294F] p-2.5 sm:p-2 md:p-2.5 rounded-full transition-all duration-200 shadow-md ml-0.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white flex-shrink-0"
                        >
                          <Search size={16} className="text-white group-hover:stroke-[3px] transition-all md:hidden" />
                          <Search size={16} className="text-white group-hover:stroke-[3px] transition-all hidden md:block" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="hidden md:flex flex-1 justify-end pl-2 sm:pl-4 min-w-0">
                  <Filters currentFilters={filters} onFilterChange={setFilters} />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="categories"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between w-full px-4 md:px-0"
              >
                <div className="flex-1 flex flex-row items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 w-full touch-pan-x">
                  {TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-2.5 py-1 sm:px-4 sm:py-2 rounded-full border text-[10px] sm:text-xs font-bold sm:tracking-wider uppercase transition-all duration-200 whitespace-nowrap flex-shrink-0 active:scale-95 cursor-pointer ${
                        selectedTag === tag 
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm' 
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-800 hover:text-neutral-900'
                      }`}
                    >
                      {tag.toUpperCase()}
                    </button>
                  ))}
                  {/* End Spacer to guarantee the rightmost items can be scrolled into view without clipping */}
                  <div className="w-4 md:w-12 h-1 flex-shrink-0" aria-hidden="true" />
                </div>
                <div className="pl-4">
                  <Filters currentFilters={filters} onFilterChange={setFilters} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div ref={searchObserverRef} className="w-full h-[1px] invisible pointer-events-none" />
      
      <main className="max-w-[2520px] mx-auto xl:px-12 md:px-12 sm:px-4 px-4 pt-10">
        <div className="flex flex-col gap-16">
          {/* Recommended Section */}
          <div className="flex flex-col gap-5 md:gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 group cursor-pointer min-w-0">
                <h2 className="font-display font-extrabold text-xl sm:text-2xl md:text-3xl text-black whitespace-nowrap truncate">Finding Roommate</h2>
                <div className="flex items-center gap-1 px-3 py-1 bg-[#17294F] text-white rounded-full ml-1 sm:ml-2 flex-shrink-0">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">See more</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsCreateRequestOpen(true)}
                  className="px-5 py-2.5 bg-[#17294F] hover:bg-[#1e3466] text-white rounded-full font-bold text-xs uppercase tracking-widest transition active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  + Post Request
                </button>
                <div className="hidden md:flex items-center gap-3">
                  <button 
                    onClick={() => scroll(recommendedRef, 'left')}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 bg-white hover:border-black hover:bg-neutral-50 transition-all active:scale-95"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => scroll(recommendedRef, 'right')}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 bg-white hover:border-black hover:bg-neutral-50 transition-all active:scale-95"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
            
            <div 
              ref={recommendedRef}
              className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth"
              style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
            >
              <AnimatePresence mode="popLayout">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={`skeleton-rec-${i}`} className="flex-none snap-start w-full [@media(max-height:500px)_and_(orientation:landscape)]:w-[calc(50vw-24px)] sm:w-[320px] md:w-[340px] xl:w-[calc((100%-48px)/4)]">
                      <RoommateCardSkeleton />
                    </div>
                  ))
                ) : (
                  filteredRoommates.slice(0, 10).map((roommate) => (
                    <div key={roommate.id} className="flex-none snap-start w-full [@media(max-height:500px)_and_(orientation:landscape)]:w-[calc(50vw-24px)] sm:w-[320px] md:w-[340px] xl:w-[calc((100%-48px)/4)]">
                      <RoommateCard roommate={roommate} onProfileClick={openProfile} />
                    </div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Near MSU-IIT Section */}
          <div className="flex flex-col gap-5 md:gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 group cursor-pointer min-w-0">
                <h2 className="font-display font-extrabold text-xl sm:text-2xl md:text-3xl text-black whitespace-nowrap truncate">Applying as Roommate</h2>
                <div className="flex items-center gap-1 px-3 py-1 bg-[#17294F] text-white rounded-full ml-1 sm:ml-2 flex-shrink-0">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">See more</span>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-3">
                <button 
                  onClick={() => scroll(nearMsuIitRef, 'left')}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 bg-white hover:border-black hover:bg-neutral-50 transition-all active:scale-90"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => scroll(nearMsuIitRef, 'right')}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 bg-white hover:border-black hover:bg-neutral-50 transition-all active:scale-90"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            
            <div 
              ref={nearMsuIitRef}
              className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth"
              style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
            >
              <AnimatePresence mode="popLayout">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={`skeleton-msu-${i}`} className="flex-none snap-start w-full [@media(max-height:500px)_and_(orientation:landscape)]:w-[calc(50vw-24px)] sm:w-[320px] md:w-[340px] xl:w-[calc((100%-48px)/4)]">
                      <RoommateCardSkeleton />
                    </div>
                  ))
                ) : (
                  filteredRoommates.slice().reverse().slice(0, 10).map((roommate) => (
                    <div key={roommate.id} className="flex-none snap-start w-full [@media(max-height:500px)_and_(orientation:landscape)]:w-[calc(50vw-24px)] sm:w-[320px] md:w-[340px] xl:w-[calc((100%-48px)/4)]">
                      <RoommateCard roommate={roommate} onProfileClick={openProfile} actionLabel="Accept as Roommate" />
                    </div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {!loading && filteredRoommates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl shadow-sm border border-neutral-100">
              <div className="bg-neutral-100 p-8 rounded-full mb-4">
                <Search size={40} className="text-neutral-400" />
              </div>
              <h3 className="text-xl font-bold text-black">No roommates found</h3>
              <p className="text-neutral-500 mt-2">Try adjusting your filters to find more potential matches.</p>
              <button 
                onClick={() => setSelectedTag('ALL')}
                className="mt-6 px-8 py-3 bg-black text-white rounded-full font-bold hover:bg-neutral-800 transition"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />

      <RoommateModal 
        roommate={selectedRoommate} 
        isOpen={isModalOpen} 
        onClose={closeProfile} 
      />

      {/* Create Roommate Request Modal */}
      <AnimatePresence>
        {isCreateRequestOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsCreateRequestOpen(false)}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl z-10 text-neutral-900"
            >
              <div className="flex items-center justify-center p-4 border-b border-neutral-100 relative">
                 <button 
                   onClick={() => setIsCreateRequestOpen(false)}
                   className="absolute left-4 p-2 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
                 >
                   <X size={20} />
                 </button>
                 <h2 className="font-bold text-lg">Post Roommate Request</h2>
              </div>
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const tagsArr = newRequest.tags.split(',').map(t => t.trim()).filter(Boolean);
                  const newRoommate: Roommate = {
                    id: 'rm-user-' + Date.now(),
                    name: newRequest.name,
                    age: Number(newRequest.age),
                    gender: newRequest.gender,
                    university: newRequest.university,
                    location: newRequest.location,
                    budgetRange: newRequest.budgetRange,
                    preferredPlace: newRequest.preferredPlace,
                    bio: newRequest.bio,
                    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newRequest.name}`,
                    tags: tagsArr.length > 0 ? tagsArr : ['Quiet', 'Clean']
                  };
                  
                  try {
                    await supabase.from('roommates').insert({
                      id: newRoommate.id,
                      name: newRoommate.name,
                      age: newRoommate.age,
                      gender: newRoommate.gender,
                      university: newRoommate.university,
                      location: newRoommate.location,
                      budget_range: newRoommate.budgetRange,
                      preferred_place: newRoommate.preferredPlace,
                      bio: newRoommate.bio,
                      image: newRoommate.image,
                      tags: newRoommate.tags,
                      user_id: user?.id || null
                    });
                  } catch (err) {
                    console.error('Failed to save roommate to Supabase:', err);
                  }
                  
                  setRoommatesList([newRoommate, ...roommatesList]);
                  setIsCreateRequestOpen(false);
                  
                  // Reset form
                  setNewRequest({
                    name: 'Micheal B. Jordan',
                    age: 20,
                    gender: 'Female',
                    university: 'MSU-IIT',
                    location: 'Tibanga, Iligan City',
                    budgetRange: 'P2500-P3000',
                    preferredPlace: "Layla's Residences",
                    bio: 'CS student, very quiet, stays up late coding. Looking for similar student boarders!',
                    tags: 'Quiet, Clean, CS Student'
                  });
                  alert('Roommate request posted successfully!');
                }}
                className="p-6 space-y-4 text-left max-h-[75vh] overflow-y-auto"
              >
                <div>
                  <label className="text-[10px] font-black text-[#17294F] uppercase tracking-wider block mb-1">Your Name</label>
                  <input 
                    type="text" 
                    value={newRequest.name} 
                    onChange={e => setNewRequest({ ...newRequest, name: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17294F] transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-[#17294F] uppercase tracking-wider block mb-1">Age</label>
                    <input 
                      type="number" 
                      value={newRequest.age} 
                      onChange={e => setNewRequest({ ...newRequest, age: Number(e.target.value) })}
                      required
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17294F] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#17294F] uppercase tracking-wider block mb-1">Gender</label>
                    <select 
                      value={newRequest.gender} 
                      onChange={e => setNewRequest({ ...newRequest, gender: e.target.value as any })}
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17294F] transition-all bg-white"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-[#17294F] uppercase tracking-wider block mb-1">Preferred Location</label>
                    <input 
                      type="text" 
                      value={newRequest.location} 
                      onChange={e => setNewRequest({ ...newRequest, location: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17294F] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#17294F] uppercase tracking-wider block mb-1">Monthly Budget</label>
                    <input 
                      type="text" 
                      value={newRequest.budgetRange} 
                      onChange={e => setNewRequest({ ...newRequest, budgetRange: e.target.value })}
                      placeholder="e.g. P2500-P3000"
                      required
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17294F] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#17294F] uppercase tracking-wider block mb-1">Brief Bio</label>
                  <textarea 
                    value={newRequest.bio} 
                    onChange={e => setNewRequest({ ...newRequest, bio: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17294F] transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#17294F] uppercase tracking-wider block mb-1">Tags (comma-separated)</label>
                  <input 
                    type="text" 
                    value={newRequest.tags} 
                    onChange={e => setNewRequest({ ...newRequest, tags: e.target.value })}
                    placeholder="e.g. Quiet, Clean, Gym-goer"
                    required
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17294F] transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#17294F] text-white py-3 rounded-xl font-bold uppercase tracking-widest mt-2 hover:bg-[#1e3466] transition-colors shadow-md cursor-pointer"
                >
                  Submit Request
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
