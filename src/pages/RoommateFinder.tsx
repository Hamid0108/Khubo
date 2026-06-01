import React, { useState, useMemo, useRef } from 'react';
import RoommateHero from '../components/RoommateHero';
import RoommateCard from '../components/RoommateCard';
import BottomNav from '../components/BottomNav';
import Filters, { FilterState } from '../components/Filters';
import Footer from '../components/Footer';
import { ROOMMATES } from '../data/roommates';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronLeft, ChevronRight, ChevronDown, MapPin, Calendar as CalendarIcon, Wallet, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RoommateModal from '../components/RoommateModal';
import { Roommate } from '../types';
import MobileSearchOverlay from '../components/MobileSearchOverlay';
import RoommateSearchDropdown from '../components/RoommateSearchDropdown';

const TAGS = [
  'ALL', 'Near MSU-IIT', 'All Female', 'Solo Room', 'Shared Room', 'All Male', 
  'Affordable', 'Bed Spacer', 'Boarding House', 'Studio', 'Apartment', 'Transient'
];

export default function RoommateFinder() {
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

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

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
  const [isMobileLandscape, setIsMobileLandscape] = useState(
    window.innerWidth < 1024 && window.innerWidth > window.innerHeight
  );

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsMobileLandscape(window.innerWidth < 1024 && window.innerWidth > window.innerHeight);
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
    let result = [...ROOMMATES];
    
    if (selectedTag !== 'ALL') {
      result = result.filter(roommate => 
        roommate.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase()) ||
        roommate.preferredPlace.toLowerCase().includes(selectedTag.toLowerCase())
      );
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
  }, [selectedTag, searchQuery]);

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
        onOpenMobileSearch={() => setIsMobileSearchOpen(true)}
        onSelectRoommate={openProfile}
        suppressDropdown={displaySearch}
      />
      <MobileSearchOverlay 
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        defaultTab="roommates"
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
                            className={`w-full flex items-center justify-between px-2 sm:px-3 md:pl-5 md:pr-3 py-2 md:py-2 transition-all cursor-pointer group focus-visible:outline-none ${
                                activeStickyDropdown === 'location' 
                                ? 'bg-neutral-100 rounded-full text-[#17294F] relative z-[60] shadow-sm' 
                                : 'hover:bg-neutral-50 rounded-full'
                              }`}
                          >
                            <div className="flex items-center gap-1 md:gap-2.5 min-w-0">
                              <MapPin className="text-[#2252D6] flex-shrink-0 w-4 h-4 sm:w-4 sm:h-4 md:w-[15px] md:h-[15px]" />
                              <span className={`text-xs sm:text-sm md:text-sm font-bold truncate md:whitespace-nowrap text-neutral-800`}>Location</span>
                            </div>
                            <ChevronDown className={`flex-shrink-0 opacity-50 text-neutral-500 group-hover:opacity-100 transition-all w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeStickyDropdown === 'location' ? 'rotate-180' : ''}`} />
                          </div>

                          <AnimatePresence>
                            {activeStickyDropdown === 'location' && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
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
                                      {['MSU-IIT', 'Pala-o', 'Tibanga'].map((loc) => (
                                        <button 
                                          key={loc}
                                          onClick={() => { setSearchQuery(loc); setActiveStickyDropdown(null); }}
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
                            className={`w-full flex items-center justify-between px-2 sm:px-3 md:pl-5 md:pr-3 py-2 md:py-2 transition-all cursor-pointer group focus-visible:outline-none ${
                                activeStickyDropdown === 'budget' 
                                ? 'bg-neutral-100 rounded-full text-[#17294F] relative z-[60] shadow-sm' 
                                : 'hover:bg-neutral-50 rounded-full'
                              }`}
                          >
                            <div className="flex items-center gap-1 md:gap-2.5 min-w-0">
                              <Wallet className="text-[#2252D6] flex-shrink-0 w-4 h-4 sm:w-4 sm:h-4 md:w-[15px] md:h-[15px]" />
                              <span className={`text-xs sm:text-sm md:text-sm font-bold truncate md:whitespace-nowrap text-neutral-800`}>Budget</span>
                            </div>
                            <ChevronDown className={`flex-shrink-0 opacity-50 text-neutral-500 group-hover:opacity-100 transition-all w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeStickyDropdown === 'budget' ? 'rotate-180' : ''}`} />
                          </div>

                          <AnimatePresence>
                            {activeStickyDropdown === 'budget' && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-[100%] mt-2 left-0 w-full bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] md:shadow-xl border border-neutral-100 p-2 md:p-4 z-50 text-left"
                              >
                                <div className="space-y-2">
                                  <div className="grid grid-cols-1 gap-1">
                                    {[
                                      { label: '₱1k - ₱3k', val: '1500' },
                                      { label: '₱3k - ₱5k', val: '4000' },
                                      { label: '₱5k+', val: '6000' }
                                    ].map((range) => (
                                      <button 
                                        key={range.label}
                                        onClick={() => { setSearchQuery(range.val); setActiveStickyDropdown(null); }}
                                        className="flex flex-col p-2 rounded-lg bg-neutral-50 border border-neutral-100 hover:border-[#17294F]/30 hover:bg-white transition-all text-left"
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
                <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                  {TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border text-[11px] sm:text-[13px] font-bold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                        selectedTag === tag 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-neutral-600 border-neutral-300 hover:border-black'
                      }`}
                    >
                      {tag.toUpperCase()}
                    </button>
                  ))}
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
              
              <div className="hidden md:flex items-center gap-3">
                <button 
                  onClick={() => scroll(recommendedRef, 'left')}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 bg-white hover:border-black hover:bg-neutral-50 transition-all active:scale-90"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => scroll(recommendedRef, 'right')}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 bg-white hover:border-black hover:bg-neutral-50 transition-all active:scale-90"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            
            <div 
              ref={recommendedRef}
              className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth"
              style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
            >
              <AnimatePresence mode="popLayout">
                {filteredRoommates.slice(0, isMobileLandscape ? 2 : (isMobile ? 3 : 10)).map((roommate) => (
                  <div key={roommate.id} className={`flex-none snap-start ${isMobileLandscape ? 'w-[calc(50vw-24px)]' : 'w-full sm:w-[320px] md:w-[340px] xl:w-[calc((100%-48px)/4)]'}`}>
                    <RoommateCard roommate={roommate} onProfileClick={openProfile} />
                  </div>
                ))}
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
                {filteredRoommates.slice().reverse().slice(0, isMobileLandscape ? 2 : (isMobile ? 3 : 10)).map((roommate) => (
                  <div key={roommate.id} className={`flex-none snap-start ${isMobileLandscape ? 'w-[calc(50vw-24px)]' : 'w-full sm:w-[320px] md:w-[340px] xl:w-[calc((100%-48px)/4)]'}`}>
                    <RoommateCard roommate={roommate} onProfileClick={openProfile} actionLabel="Accept as Roommate" />
                  </div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          
          {filteredRoommates.length === 0 && (
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
    </div>
  );
}
