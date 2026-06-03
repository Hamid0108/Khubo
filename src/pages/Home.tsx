import Hero from '../components/Hero';
import Categories from '../components/Categories';
import ListingCard from '../components/ListingCard';
import ListingCardSkeleton from '../components/ListingCardSkeleton';
import BottomNav from '../components/BottomNav';
import Filters, { FilterState } from '../components/Filters';
import Footer from '../components/Footer';
import { useListings } from '../hooks/useListings';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useMemo, useRef, useDeferredValue } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Search, MapPin, Calendar as CalendarIcon, Wallet, ChevronDown, X } from 'lucide-react';
import MobileSearchOverlay from '../components/MobileSearchOverlay';
import { DateScrollPicker } from '../components/DateScrollPicker';
import SearchDropdown from '../components/SearchDropdown';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { SearchHistory } from '../components/SearchHistory';

const POPULAR_LOCATIONS = ['Iligan City', 'Cagayan de Oro', 'Butuan City'];

const CAROUSEL_ITEM_CLASS = "w-[calc((100%-12px)/2)] flex-none min-w-[calc((100%-12px)/2)] sm:w-[calc((100%-12px)/2)] sm:min-w-[calc((100%-12px)/2)] md:portrait:min-w-[calc((100%-24px)/3)] md:portrait:w-[calc((100%-24px)/3)] md:landscape:min-w-[calc((100%-48px)/5)] md:landscape:w-[calc((100%-48px)/5)] lg:min-w-[calc((100%-48px)/5)] lg:w-[calc((100%-48px)/5)] xl:min-w-[calc((100%-48px)/5)] xl:w-[calc((100%-48px)/5)] snap-start";

const ListingCarouselSkeleton = ({ prefix }: { prefix: string }) => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={`skeleton-${prefix}-${i}`} className={CAROUSEL_ITEM_CLASS}>
        <ListingCardSkeleton />
      </div>
    ))}
  </>
);

export default function Home() {
  const { listings: LISTINGS, loading: listingsLoading } = useListings();
  const { history, addSearch, removeSearch } = useSearchHistory();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isStickySearchActive, setIsStickySearchActive] = useState(false);
  const [hideStickyDropdown, setHideStickyDropdown] = useState(false);
  
  React.useEffect(() => {
    if (isStickySearchActive) {
      setHideStickyDropdown(false);
    }
  }, [isStickySearchActive]);

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const observerRef = useRef<HTMLDivElement>(null);
  const searchObserverRef = useRef<HTMLDivElement>(null);
  const recommendedRef = useRef<HTMLDivElement>(null);
  const topListingsRef = useRef<HTMLDivElement>(null);
  const msuIitRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<FilterState>({
    minPrice: 0,
    maxPrice: 50000,
    minRating: 0,
    sortBy: 'relevance'
  });
  const navigate = useNavigate();
  const [stickyActiveDropdown, setStickyActiveDropdown] = useState<'location' | 'dates' | 'budget' | 'general' | null>(null);
  const stickyDropdownRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (stickyDropdownRef.current && !stickyDropdownRef.current.contains(event.target as Node)) {
        setStickyActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (!isSticky || !isStickySearchActive) {
      setStickyActiveDropdown(null);
    }
  }, [isSticky, isStickySearchActive]);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting && entry.boundingClientRect.top <= 0);
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
        setShowSearch(!entry.isIntersecting && entry.boundingClientRect.top <= 70);
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

  const filteredListings = useMemo(() => {
    if (!LISTINGS) return [];
    let result = [...LISTINGS];

    // Filter by Category
    if (selectedCategory !== 'ALL') {
      result = result.filter(listing => listing.category === selectedCategory);
    }

    // Filter by Price
    result = result.filter(listing => listing.price >= filters.minPrice && listing.price <= filters.maxPrice);

    // Filter by Rating
    result = result.filter(listing => listing.rating >= filters.minRating);

    // Filter by Search Query (keywords or numbers)
    if (deferredSearchQuery.trim() !== '') {
      const query = deferredSearchQuery.toLowerCase().trim();
      result = result.filter(listing => {
        return (
          listing.title.toLowerCase().includes(query) ||
          listing.description.toLowerCase().includes(query) ||
          listing.location.toLowerCase().includes(query) ||
          listing.category.toLowerCase().includes(query) ||
          listing.price.toString().includes(query)
        );
      });
    }

    // Sort
    switch (filters.sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Relevance - keep original order
        break;
    }

    return result;
  }, [selectedCategory, filters, deferredSearchQuery, LISTINGS]);

  const handleListingClick = (id: string) => {
    navigate(`/listing/${id}`);
  };

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
      <Hero 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearchActive={isSearchActive}
        setIsSearchActive={setIsSearchActive}
        onOpenMobileSearch={() => setIsMobileSearchOpen(true)}
        suppressDropdown={displaySearch}
      />
      
      {/* Search History section under Hero */}
      <div className="max-w-[2520px] mx-auto xl:px-12 md:px-12 sm:px-4 px-4 -mt-10 mb-4">
        <SearchHistory history={history} onSelect={(q) => { setSearchQuery(q); addSearch(q); }} onRemove={removeSearch} />
      </div>
      <MobileSearchOverlay 
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        defaultTab="properties"
      />
      <div id="search-results-anchor" />
      <div ref={observerRef} className="w-full h-[1px] invisible pointer-events-none" />
      
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
                    id="2nd-search-bar"
                    className="bg-white border border-neutral-200 p-1.5 sm:p-2 md:p-2 flex items-center text-neutral-800 shadow-lg w-full max-w-[340px] sm:max-w-[480px] md:max-w-[650px] lg:max-w-[750px] relative z-40 rounded-full transition-all duration-300 pointer-events-auto cursor-default"
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
                              className="p-1 hover:bg-neutral-100 rounded-full transition-colors mr-2 flex-shrink-0"
                              aria-label="Clear search"
                            >
                              <X className="w-3.5 h-3.5 text-neutral-500" />
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              addSearch(searchQuery);
                              setIsStickySearchActive(false);
                            }}
                            className="bg-[#17294F] p-1.5 sm:p-2 md:p-2.5 rounded-full transition-all duration-200 shadow-md ml-0.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white flex-shrink-0 flex items-center justify-center cursor-pointer"
                            aria-label="Search"
                          >
                            <Search size={12} className="text-white group-hover:stroke-[3px] transition-all md:hidden" />
                            <Search size={16} className="text-white group-hover:stroke-[3px] transition-all hidden md:block" />
                          </button>
                        </div>
                        {!hideStickyDropdown && (
                          <SearchDropdown
                            searchQuery={searchQuery}
                            setSearchQuery={(val) => {
                              setSearchQuery(val);
                              setHideStickyDropdown(true);
                            }}
                            onClose={() => {
                              setHideStickyDropdown(true);
                              setIsStickySearchActive(false);
                            }}
                            onSelectListing={(id) => handleListingClick(id)}
                          />
                        )}
                      </>
                    ) : (
                      <>
                        {/* Sticky Location Section */}
                        <div className="flex-[1.2] min-w-0">
                          <div 
                            role="button" 
                            tabIndex={0} 
                            aria-label="Location: Location"
                            onClick={() => {
                              setStickyActiveDropdown(stickyActiveDropdown === 'location' ? null : 'location');
                            }}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setStickyActiveDropdown(stickyActiveDropdown === 'location' ? null : 'location'))}
                            className={`w-full flex items-center justify-between px-1.5 sm:px-3 md:pl-5 md:pr-3 py-2 md:py-2 transition-all cursor-pointer group select-none focus-visible:outline-none ${
                              stickyActiveDropdown === 'location' 
                              ? 'bg-neutral-100 rounded-full text-[#17294F] relative z-[60] shadow-sm' 
                              : 'hover:bg-neutral-50 rounded-full'
                            }`}
                          >
                            <div className="flex items-center gap-1 md:gap-2.5 min-w-0">
                              <MapPin className="text-[#2252D6] flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[15px] md:h-[15px]" />
                              <span className={`text-[10px] sm:text-sm md:text-sm font-bold truncate md:whitespace-nowrap text-neutral-800`}>Location</span>
                            </div>
                            <ChevronDown className={`flex-shrink-0 opacity-50 text-neutral-500 group-hover:opacity-100 transition-all w-3 h-3 sm:w-4 sm:h-4 ${stickyActiveDropdown === 'location' ? 'rotate-180' : ''}`} />
                          </div>

                          <AnimatePresence>
                            {stickyActiveDropdown === 'location' && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-[100%] mt-2 left-0 w-full bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] md:shadow-xl border border-neutral-100 p-3 z-50 text-left"
                              >
                                <div className="space-y-3">
                                  <div>
                                    <div className="flex items-center px-2.5 py-2 bg-neutral-100 rounded-xl mb-2 focus-within:ring-2 focus-within:ring-[#2252D6]/20 transition-all cursor-text" onClick={(e) => { e.stopPropagation(); (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus(); }}>
                                      <Search className="w-3.5 h-3.5 text-neutral-400 mr-1.5 flex-shrink-0" />
                                      <input 
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-transparent border-none outline-none text-xs font-semibold text-neutral-900 placeholder:text-neutral-400 p-0 focus:ring-0"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      {POPULAR_LOCATIONS.map((loc) => (
                                        <button 
                                          key={loc}
                                          onClick={() => { setSearchQuery(loc); setStickyActiveDropdown(null); }}
                                          className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-50 transition-colors group"
                                        >
                                          <div className="w-6 h-6 rounded bg-[#2252D6]/10 flex items-center justify-center text-[#2252D6] group-hover:bg-[#2252D6] group-hover:text-white transition-all flex-shrink-0">
                                            <MapPin size={12} />
                                          </div>
                                          <span className="font-medium text-neutral-800 text-xs whitespace-nowrap">{loc}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="w-[1px] h-3 sm:h-4 bg-white/20 flex-shrink-0 self-center" />

                        {/* Sticky Dates Section */}
                        <div className="flex-1 min-w-0">
                          <div 
                            role="button" 
                            tabIndex={0} 
                            aria-label="Add dates"
                            onClick={() => {
                              setStickyActiveDropdown(stickyActiveDropdown === 'dates' ? null : 'dates');
                            }}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setStickyActiveDropdown(stickyActiveDropdown === 'dates' ? null : 'dates'))}
                            className={`w-full flex items-center justify-between px-1.5 sm:px-3 md:pl-5 md:pr-4 py-2 md:py-2 transition-all cursor-pointer group select-none focus-visible:outline-none ${
                              stickyActiveDropdown === 'dates' 
                              ? 'bg-neutral-100 rounded-full text-black relative z-[60] shadow-sm' 
                              : 'hover:bg-neutral-50 rounded-full'
                            }`}
                          >
                            <div className="flex items-center gap-1 md:gap-3 min-w-0">
                              <CalendarIcon className="text-[#2252D6] flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[15px] md:h-[15px]" strokeWidth={2} />
                              <span className={`text-[10px] sm:text-sm md:text-sm font-bold truncate md:whitespace-nowrap text-neutral-800`}>Dates</span>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2">
                              <ChevronDown className={`flex-shrink-0 opacity-50 text-neutral-500 transition-all w-3 h-3 sm:w-4 sm:h-4 ${stickyActiveDropdown === 'dates' ? 'rotate-180 opacity-50' : 'group-hover:opacity-100'}`} />
                            </div>
                          </div>

                          <AnimatePresence>
                            {stickyActiveDropdown === 'dates' && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-[100%] mt-2 left-0 w-full bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] md:shadow-xl border border-neutral-100 overflow-hidden z-50 text-left"
                              >
                                <DateScrollPicker 
                                  viewportHeight={132} 
                                  onMonthClick={(m) => { 
                                    setSearchQuery(prev => prev ? `${prev} in ${m}` : m); 
                                    setStickyActiveDropdown(null); 
                                  }} 
                                />
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
                              setStickyActiveDropdown(stickyActiveDropdown === 'budget' ? null : 'budget');
                            }}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setStickyActiveDropdown(stickyActiveDropdown === 'budget' ? null : 'budget'))}
                            className={`w-full flex items-center justify-between px-1.5 sm:px-3 md:pl-5 md:pr-3 py-2 md:py-2 transition-all cursor-pointer group select-none focus-visible:outline-none ${
                              stickyActiveDropdown === 'budget' 
                              ? 'bg-neutral-100 rounded-full text-[#17294F] relative z-[60] shadow-sm' 
                              : 'hover:bg-neutral-50 rounded-full'
                            }`}
                          >
                            <div className="flex items-center gap-1 md:gap-2.5 min-w-0">
                              <Wallet className="text-[#2252D6] flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[15px] md:h-[15px]" />
                              <span className={`text-[10px] sm:text-sm md:text-sm font-bold truncate md:whitespace-nowrap text-neutral-800`}>Budget</span>
                            </div>
                            <ChevronDown className={`flex-shrink-0 opacity-50 text-neutral-500 group-hover:opacity-100 transition-all w-3 h-3 sm:w-4 sm:h-4 ${stickyActiveDropdown === 'budget' ? 'rotate-180' : ''}`} />
                          </div>

                          <AnimatePresence>
                            {stickyActiveDropdown === 'budget' && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-[100%] mt-2 left-0 w-full bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] md:shadow-xl border border-neutral-100 p-2 md:p-4 z-50 text-left"
                              >
                                <div className="space-y-2 md:space-y-3">
                                  <div className="grid grid-cols-1 gap-1">
                                    {[
                                      { label: '₱1k - ₱3k', val: '1500' },
                                      { label: '₱3k - ₱5k', val: '4000' },
                                      { label: '₱5k+', val: '6000' }
                                    ].map((range) => (
                                      <button 
                                        key={range.label}
                                        onClick={() => { setSearchQuery(range.val); setStickyActiveDropdown(null); }}
                                        className="flex flex-col px-3 py-2.5 rounded-lg bg-transparent hover:bg-neutral-100 transition-all text-left w-full"
                                      >
                                        <span className="font-medium text-neutral-900 text-xs whitespace-nowrap">{range.label}</span>
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
                            if (isMobile) {
                                setIsMobileSearchOpen(true);
                            } else {
                                addSearch(searchQuery);
                                setSearchQuery('');
                                setIsStickySearchActive(true);
                            }
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
                className="flex items-center justify-between w-full bg-white"
              >
                <div className="flex-1 min-w-0 relative group/cat pl-2 sm:pl-0">
                  <Categories selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
                </div>
                <div className="pl-1 sm:pl-4 pr-2 sm:pr-0">
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
          <div className="flex flex-col gap-5 md:gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 group cursor-pointer min-w-0" onClick={() => navigate('/category/recommended')}>
                <h2 className="font-display font-extrabold text-xl sm:text-2xl md:text-3xl text-black whitespace-nowrap truncate">Recommended</h2>
                <div className="flex items-center gap-1 px-3 py-1 bg-[#17294F] text-white rounded-full ml-1 sm:ml-2 flex-shrink-0">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">See more</span>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-3">
                <button 
                  onClick={() => scroll(recommendedRef, 'left')}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 bg-white hover:border-black hover:bg-neutral-50 transition-all active:scale-90"
                  aria-label="Previous Recommended"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => scroll(recommendedRef, 'right')}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 bg-white hover:border-black hover:bg-neutral-50 transition-all active:scale-90"
                  aria-label="Next Recommended"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            
            <div 
              ref={recommendedRef}
              className="flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth"
              style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
            >
              <AnimatePresence mode="popLayout">
                {listingsLoading ? (
                  <ListingCarouselSkeleton prefix="rec" />
                ) : (
                  filteredListings.slice(0, 21).map((listing) => (
                    <div key={listing.id} className={CAROUSEL_ITEM_CLASS}>
                      <ListingCard 
                        listing={listing} 
                        onClick={() => handleListingClick(listing.id)}
                      />
                    </div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {(listingsLoading || filteredListings.length > 0) && (
            <div className="flex flex-col gap-5 md:gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 group cursor-pointer min-w-0" onClick={() => navigate('/category/top-listing')}>
                  <h2 className="font-display font-extrabold text-xl sm:text-2xl md:text-3xl text-black whitespace-nowrap truncate">Top Listing</h2>
                  <div className="flex items-center gap-1 px-3 py-1 bg-[#17294F] text-white rounded-full ml-1 sm:ml-2 flex-shrink-0">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">See more</span>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-3">
                  <button 
                    onClick={() => scroll(topListingsRef, 'left')}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 bg-white hover:border-black hover:bg-neutral-50 transition-all active:scale-90"
                    aria-label="Previous Top Listings"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => scroll(topListingsRef, 'right')}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 bg-white hover:border-black hover:bg-neutral-50 transition-all active:scale-90"
                    aria-label="Next Top Listings"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              <div 
                ref={topListingsRef}
                className="flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth"
                style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
              >
                <AnimatePresence mode="popLayout">
                  {listingsLoading ? (
                    <ListingCarouselSkeleton prefix="top" />
                  ) : (
                    filteredListings.slice(7, 28).map((listing) => (
                      <div key={listing.id} className={CAROUSEL_ITEM_CLASS}>
                        <ListingCard 
                          listing={listing} 
                          onClick={() => handleListingClick(listing.id)}
                        />
                      </div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {(listingsLoading || filteredListings.length > 0) && (
            <div className="flex flex-col gap-5 md:gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 group cursor-pointer min-w-0" onClick={() => navigate('/category/near-msu-iit')}>
                  <h2 className="font-display font-extrabold text-xl sm:text-2xl md:text-3xl text-black whitespace-nowrap truncate">Near MSU-IIT</h2>
                  <div className="flex items-center gap-1 px-3 py-1 bg-[#17294F] text-white rounded-full ml-1 sm:ml-2 flex-shrink-0">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">See more</span>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-3">
                  <button 
                    onClick={() => scroll(msuIitRef, 'left')}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 bg-white hover:border-black hover:bg-neutral-50 transition-all active:scale-90"
                    aria-label="Previous MSU-IIT Listings"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => scroll(msuIitRef, 'right')}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 bg-white hover:border-black hover:bg-neutral-50 transition-all active:scale-90"
                    aria-label="Next MSU-IIT Listings"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              <div 
                ref={msuIitRef}
                className="flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth"
                style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
              >
                <AnimatePresence mode="popLayout">
                  {listingsLoading ? (
                    <ListingCarouselSkeleton prefix="msu" />
                  ) : (
                    filteredListings.slice(14, 35).map((listing) => (
                      <div key={listing.id} className={CAROUSEL_ITEM_CLASS}>
                        <ListingCard 
                          listing={listing} 
                          onClick={() => handleListingClick(listing.id)}
                        />
                      </div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

        </div>

        {filteredListings.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-10 bg-white rounded-3xl mt-8 shadow-sm border border-neutral-100">
            <h2 className="text-2xl font-bold font-display text-black">No listings found</h2>
            <p className="text-neutral-500 mt-2">
              {searchQuery ? `We couldn't find any listings matching "${searchQuery}". Try typing another keyword or clearing search filters.` : "Try choosing another category."}
            </p>
            <button 
              onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
              className="mt-6 px-8 py-3 bg-[#17294F] text-white rounded-full font-bold transition hover:bg-[#17294F]/90 active:scale-95 duration-150"
            >
              Clear all filters & search
            </button>
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
