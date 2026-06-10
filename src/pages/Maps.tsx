import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useListings } from '../hooks/useListings';
import ListingCard from '../components/ListingCard';
import ListingCardSkeleton from '../components/ListingCardSkeleton';
import Navbar from '../components/Navbar';
import { Search, MapPin, SlidersHorizontal, ChevronLeft, ChevronRight, ArrowLeft, MoreHorizontal, Map as MapIcon, X, Calendar as CalendarIcon, Wallet, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { Listing } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { DateScrollPicker } from '../components/DateScrollPicker';
import SearchDropdown from '../components/SearchDropdown';

function parseSearchQuery(query: string) {
  let tempQuery = query.toLowerCase();
  let parsedLocation = '';
  let parsedDates = '';
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
  }

  // 2. Parse Dates (Months)
  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  for (const month of months) {
    if (tempQuery.includes(month)) {
      parsedDates = month.charAt(0).toUpperCase() + month.slice(1);
      tempQuery = tempQuery.replace(new RegExp(month, 'gi'), '');
      break;
    }
  }

  // 3. Parse Budget
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
    dates: parsedDates,
    budget: parsedBudget,
    cleanQuery
  };
}

export default function Maps() {
  const { listings: LISTINGS, loading } = useListings();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
  const [activeDropdown, setActiveDropdown] = useState<'location' | 'dates' | 'budget' | 'general' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const markers = useRef<{ [key: string]: maptilersdk.Marker }>({});

  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDates, setSelectedDates] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');

  useEffect(() => {
    if (!searchQuery) return;

    const parsed = parseSearchQuery(searchQuery);
    let updated = false;

    if (parsed.location && parsed.location !== selectedLocation) {
      setSelectedLocation(parsed.location);
      updated = true;
    }
    if (parsed.dates && parsed.dates !== selectedDates) {
      setSelectedDates(parsed.dates);
      updated = true;
    }
    if (parsed.budget && parsed.budget !== selectedBudget) {
      setSelectedBudget(parsed.budget);
      updated = true;
    }

    if (parsed.location || parsed.dates || parsed.budget) {
      if (searchQuery !== parsed.cleanQuery) {
        setSearchQuery(parsed.cleanQuery);
      }
    }
  }, [searchQuery, selectedLocation, selectedDates, selectedBudget]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setIsSearchActive(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (dropdown: 'location' | 'dates' | 'budget' | 'general') => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleSelectListing = (id: string) => {
    const listing = LISTINGS?.find(l => l.id === id);
    if (listing) {
      handleListingClick(listing);
    }
    setActiveDropdown(null);
    setIsSearchActive(false);
  };

  const filteredListings = useMemo(() => {
    const dataListings = LISTINGS || [];
    let result = [...dataListings];

    // Filter by Location
    if (selectedLocation) {
      result = result.filter(listing => 
        listing.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    // Filter by Budget Range
    if (selectedBudget) {
      if (selectedBudget === '₱1k - ₱3k') {
        result = result.filter(listing => listing.price >= 1000 && listing.price <= 3000);
      } else if (selectedBudget === '₱3k - ₱5k') {
        result = result.filter(listing => listing.price >= 3000 && listing.price <= 5000);
      } else if (selectedBudget === '₱5k+') {
        result = result.filter(listing => listing.price >= 5000);
      }
    }

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(listing => 
        listing.title.toLowerCase().includes(query) ||
        listing.location.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.category.toLowerCase().includes(query) ||
        listing.price.toString().includes(query)
      );
    }

    return result.filter(l => l.lat && l.lng); // Only show listings with coordinates
  }, [searchQuery, LISTINGS, selectedLocation, selectedBudget]);

  const updateMarkers = React.useCallback(() => {
    if (!map.current) return;

    // Remove existing markers
    (Object.values(markers.current) as maptilersdk.Marker[]).forEach(marker => marker.remove());
    markers.current = {};

    filteredListings.forEach(listing => {
      if (listing.lat && listing.lng) {
        const el = document.createElement('div');
        el.className = 'custom-marker';
        const isActive = selectedListing === listing.id;
        
        el.innerHTML = `
          <div style="cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <div style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));">
              <svg width="44" height="52" viewBox="0 0 44 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Outer Glow/Border -->
                <path d="M22 1C10.4 1 1 10.4 1 22C1 34.5 22 51 22 51C22 51 43 34.5 43 22C43 10.4 33.6 1 22 1Z" fill="white" fill-opacity="0.2"/>
                <path d="M22 2C11 2 2 11 2 22C2 34 22 50 22 50C22 50 42 34 42 22C42 11 33 2 22 2Z" fill="white" stroke="white" stroke-width="2"/>
                <!-- Main Navy Background -->
                <path d="M22 3C11.5 3 3 11.5 3 22C3 33.5 22 49 22 49C22 49 41 33.5 41 22C41 11.5 32.5 3 22 3Z" fill="${isActive ? '#000' : '#17294F'}"/>
                <!-- Center White Circle -->
                <circle cx="22" cy="22" r="13" fill="white"/>
                <!-- House Icon -->
                <path d="M22 14L15 19.5V28.5H19.5V23.5H24.5V28.5H29V19.5L22 14Z" fill="${isActive ? '#000' : '#17294F'}"/>
              </svg>
            </div>
            <div style="
              background: ${isActive ? '#000' : '#17294F'};
              color: white;
              padding: 4px 10px;
              border-radius: 12px;
              font-family: inherit;
              font-weight: 400;
              font-size: 11px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              white-space: nowrap;
              border: 1.5px solid white;
            ">
              ₱${(listing.price / 1000).toFixed(1)}k
            </div>
          </div>
        `;

        const marker = new maptilersdk.Marker({ element: el })
          .setLngLat([listing.lng, listing.lat])
          .addTo(map.current!);

        el.addEventListener('click', () => {
          setSelectedListing(listing.id);
          if (window.innerWidth >= 768) {
            const element = document.getElementById(`listing-${listing.id}`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });

        markers.current[listing.id] = marker;
      }
    });
  }, [filteredListings, selectedListing]);

  const updateMarkersRef = useRef(updateMarkers);
  useEffect(() => {
    updateMarkersRef.current = updateMarkers;
  }, [updateMarkers]);

  useEffect(() => {
    if (map.current) return;

    const apiKey = import.meta.env.VITE_MAPTILER_API_KEY || 'JNCQIsX7HW4jPDQX491R';
    maptilersdk.config.apiKey = apiKey || '';

    map.current = new maptilersdk.Map({
      container: mapContainer.current!,
      style: maptilersdk.MapStyle.STREETS,
      center: [124.2442, 8.2415], // Iligan City center
      zoom: 13,
      navigationControl: false,
      geolocateControl: false,
    });

    // Intercept and resolve missing style images to suppress MapTiler road/space warnings in console
    map.current.on('styleimagemissing', (e: any) => {
      try {
        if (e && e.id && map.current) {
          const width = 1;
          const height = 1;
          const data = new Uint8Array([0, 0, 0, 0]);
          map.current.addImage(e.id, { width, height, data });
        }
      } catch (err) {
        // ignore any errors adding dummy fallback
      }
    });

    map.current.on('load', () => {
      updateMarkersRef.current();
    });
  }, []);

  useEffect(() => {
    // If map exists, we need to tell it to resize when sidebar collapses/expands
    if (map.current) {
      setTimeout(() => {
        map.current?.resize();
      }, 305); // slightly more than the transition duration
    }
  }, [isSidebarCollapsed]);

  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  const handleListingClick = (listing: Listing) => {
    setSelectedListing(listing.id);
    if (listing.lat && listing.lng && map.current) {
      map.current.flyTo({
        center: [listing.lng, listing.lat],
        zoom: 16,
        duration: 1500
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white relative">
      <button 
        onClick={() => navigate(-1)}
        className="md:hidden absolute top-[76px] left-3 z-[60] w-10 h-10 flex items-center justify-center bg-white shadow-md pointer-events-auto active:scale-90 transition-transform rounded-full border border-neutral-100"
        aria-label="Go back"
      >
        <ArrowLeft size={20} className="text-neutral-900" />
      </button>

      {/* Search Header */}
      <div className="flex items-center justify-center md:justify-between px-3 md:px-8 py-2.5 border-b border-neutral-100/50 bg-white/80 backdrop-blur-xl sticky top-0 z-40 shadow-sm gap-2 sm:gap-3">
        
        {/* Back Button */}
        <div className="hidden md:flex flex-1 justify-start">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-1 md:-ml-2 rounded-full hover:bg-neutral-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={24} className="text-neutral-900" />
          </button>
        </div>
        
        <div className="flex-[3] flex justify-center min-w-0 w-full">
          <div ref={dropdownRef} className="bg-white border border-neutral-200 p-1.5 sm:p-2 md:p-2 rounded-full flex items-center h-[46px] sm:h-[52px] md:h-[56px] text-neutral-800 shadow-lg w-full sm:max-w-[480px] md:max-w-[650px] lg:max-w-[750px] transition-all relative z-40 pointer-events-auto cursor-default">
            {isSearchActive ? (
              <>
                <div className="flex-1 flex items-center pl-4 md:pl-5 pr-0 py-0 w-full min-w-0">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIsSearchActive(false);
                      }
                    }}
                    placeholder="Search rooms, location..."
                    className="w-full bg-transparent border-none outline-none text-xs sm:text-sm font-bold text-neutral-800 placeholder:text-neutral-400 focus:ring-0 p-0"
                    autoFocus
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')} 
                      className="p-1 hover:bg-neutral-100 rounded-full transition-colors flex-shrink-0 mr-2"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5 text-neutral-500" />
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => {
                    setIsSearchActive(false);
                  }}
                  className="bg-[#17294F] p-2 sm:p-3 md:p-3 rounded-full transition-all duration-200 shadow-md ml-1 sm:ml-2 md:ml-2 group flex-shrink-0 flex items-center justify-center cursor-pointer relative z-[70]"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px] md:w-[18px] md:h-[18px] text-white group-hover:stroke-[3px] transition-all" />
                </button>
                <SearchDropdown
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onClose={() => setIsSearchActive(false)}
                  onSelectListing={(id) => handleSelectListing(id)}
                />
              </>
            ) : (
              <>
                {/* Location Section */}
                <div className="flex-[1.2] min-w-0">
                  <div 
                    role="button" 
                    onClick={() => toggleDropdown('location')}
                    className={`w-full min-w-0 flex items-center justify-between px-1.5 sm:px-3 md:pl-5 md:pr-3 py-1.5 md:py-2 transition cursor-pointer group text-black focus-visible:outline-none ${
                        activeDropdown === 'location' 
                        ? 'bg-neutral-100 rounded-full text-[#17294F] shadow-sm relative z-[60]' 
                        : 'hover:bg-neutral-50 rounded-full'
                    }`}
                  >
                    <div className="flex items-center gap-1 md:gap-3 min-w-0">
                      <MapPin className="w-3.5 h-3.5 md:w-5 md:h-5 text-[#2252D6] flex-shrink-0" />
                      <span className="text-[10px] sm:text-sm md:text-base font-semibold truncate">
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
                          <X size={12} />
                        </button>
                      )}
                    </div>
                    <ChevronDown className={`w-3 h-3 md:w-3.5 md:h-3.5 opacity-40 group-hover:opacity-100 flex-shrink-0 ml-0.5 md:ml-1 transition-all ${activeDropdown === 'location' ? 'rotate-180 opacity-100' : ''}`} />
                  </div>
                  
                  <AnimatePresence>
                    {activeDropdown === 'location' && (
                      <motion.div
                        initial={{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }}
                        animate={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
                        exit={{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }}
                        transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
                        className="absolute top-[100%] mt-2 left-0 w-full bg-white rounded-2xl md:rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] md:shadow-xl border border-neutral-100 p-4 z-50 text-left"
                      >
                        <div className="space-y-4">
                          <div>
                              <div className="flex items-center px-4 py-2 bg-neutral-100 rounded-xl mb-3 focus-within:ring-2 focus-within:ring-[#2252D6]/20 transition-all cursor-text" onClick={(e) => { e.stopPropagation(); (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus(); }}>
                                <Search className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
                                <input 
                                  type="text"
                                  placeholder="Search location..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="w-full bg-transparent border-none outline-none text-sm font-medium text-neutral-900 placeholder:text-neutral-400 p-0 focus:ring-0"
                                />
                              </div>
                            <div className="space-y-1">
                              {['Iligan City', 'Cagayan de Oro', 'Butuan City'].map((loc) => (
                                <button 
                                  key={loc}
                                  onClick={() => {
                                    setSelectedLocation(loc);
                                    setSearchQuery(loc);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 transition-colors group/item"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-[#2252D6]/10 flex items-center justify-center text-[#2252D6] group-hover/item:bg-[#2252D6] group-hover/item:text-white transition-all">
                                    <MapPin size={14} />
                                  </div>
                                  <span className="font-bold text-neutral-800 text-sm">{loc}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="w-[1px] h-5 md:h-6 bg-neutral-300" />

                {/* Dates Section */}
                <div className="flex-1 min-w-0">
                  <div 
                    role="button" 
                    onClick={() => toggleDropdown('dates')}
                    className={`w-full min-w-0 flex items-center justify-between px-1.5 sm:px-3 md:pl-5 md:pr-3 py-1.5 md:py-2 transition cursor-pointer group text-black focus-visible:outline-none ${
                        activeDropdown === 'dates' 
                        ? 'bg-neutral-100 rounded-full text-[#17294F] shadow-sm relative z-[60]' 
                        : 'hover:bg-neutral-50 rounded-full'
                    }`}
                  >
                    <div className="flex items-center gap-1 md:gap-3 min-w-0">
                      <CalendarIcon className="w-3.5 h-3.5 md:w-5 md:h-5 text-[#2252D6] flex-shrink-0" />
                      <span className="text-[10px] sm:text-sm md:text-base font-semibold truncate">
                        {selectedDates || 'Dates'}
                      </span>
                      {selectedDates && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDates('');
                            setSearchQuery('');
                          }}
                          className="p-0.5 hover:bg-neutral-200 rounded-full text-neutral-500 ml-1 flex-shrink-0 z-[70] cursor-pointer pointer-events-auto"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                    <ChevronDown className={`w-3 h-3 md:w-3.5 md:h-3.5 opacity-40 group-hover:opacity-100 flex-shrink-0 ml-0.5 md:ml-1 transition-all ${activeDropdown === 'dates' ? 'rotate-180 opacity-100' : ''}`} />
                  </div>

                  <AnimatePresence>
                    {activeDropdown === 'dates' && (
                      <motion.div
                        initial={{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }}
                        animate={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
                        exit={{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }}
                        transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
                        className="absolute top-[100%] mt-2 left-0 w-full bg-white rounded-2xl md:rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] md:shadow-xl border border-neutral-100 overflow-hidden z-50 text-left"
                      >
                        <DateScrollPicker 
                          viewportHeight={132} 
                          onMonthClick={(m) => {
                            setSelectedDates(m);
                            setSearchQuery(prev => prev ? `${prev} in ${m}` : m);
                            setActiveDropdown(null);
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="w-[1px] h-5 md:h-6 bg-neutral-300" />

                {/* Budget Section */}
                <div className="flex-1 min-w-0">
                  <div 
                    role="button" 
                    onClick={() => toggleDropdown('budget')}
                    className={`w-full min-w-0 flex items-center justify-between px-1.5 sm:px-3 md:pl-5 md:pr-3 py-1.5 md:py-2 transition cursor-pointer group text-black focus-visible:outline-none ${
                        activeDropdown === 'budget' 
                        ? 'bg-neutral-100 rounded-full text-[#17294F] shadow-sm relative z-[60]' 
                        : 'hover:bg-neutral-50 rounded-full'
                    }`}
                  >
                    <div className="flex items-center gap-1 md:gap-3 min-w-0">
                      <Wallet className="w-3.5 h-3.5 md:w-5 md:h-5 text-[#2252D6] flex-shrink-0" />
                      <span className="text-[10px] sm:text-sm md:text-base font-semibold truncate">
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
                          <X size={12} />
                        </button>
                      )}
                    </div>
                    <ChevronDown className={`w-3 h-3 md:w-3.5 md:h-3.5 opacity-40 group-hover:opacity-100 flex-shrink-0 ml-0.5 md:ml-1 transition-all ${activeDropdown === 'budget' ? 'rotate-180 opacity-100' : ''}`} />
                  </div>

                  <AnimatePresence>
                    {activeDropdown === 'budget' && (
                      <motion.div
                        initial={{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }}
                        animate={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
                        exit={{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }}
                        transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
                        className="absolute top-[100%] mt-2 left-0 w-full bg-white rounded-2xl md:rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] md:shadow-xl border border-neutral-100 p-4 z-50 text-left"
                      >
                        <div className="space-y-3">
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
                                  setActiveDropdown(null);
                                }}
                                className="flex flex-col px-3 py-2.5 rounded-lg bg-transparent hover:bg-neutral-100 transition-all text-left w-full"
                              >
                                <span className="font-bold text-neutral-900 text-sm">{range.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                    setIsSearchActive(true);
                    setActiveDropdown(null);
                  }} 
                  className="bg-[#17294F] p-2 sm:p-3 md:p-3 rounded-full transition-all duration-200 shadow-md ml-1 sm:ml-2 md:ml-2 group flex-shrink-0 flex items-center justify-center cursor-pointer relative z-[70]"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px] md:w-[18px] md:h-[18px] text-white group-hover:stroke-[3px] transition-all" />
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="hidden md:flex flex-1 justify-end min-w-0">
          <button className="p-2.5 border border-neutral-200 rounded-full hover:bg-neutral-50 transition flex-shrink-0">
            <SlidersHorizontal size={18} />
          </button>
        </div>
        <button className="hidden sm:block md:hidden p-2.5 border border-neutral-200 rounded-full hover:bg-neutral-50 transition flex-shrink-0 flex-1 justify-end max-w-fit">
          <SlidersHorizontal size={18} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar - Scrollable Listings */}
        <div className={`hidden md:block transition-all duration-300 h-full overflow-hidden border-r border-neutral-100 bg-white z-20 flex-shrink-0 ${isSidebarCollapsed ? 'w-0' : 'md:portrait:w-[330px] md:landscape:w-[420px] lg:w-[480px]'}`}>
          <div className="w-full md:portrait:w-[330px] md:landscape:w-[420px] lg:w-[480px] h-full overflow-y-auto p-4 flex flex-col gap-6">


            <div className="flex flex-col gap-3">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={`skeleton-map-${i}`} className="transition-all duration-300 rounded-xl">
                    <ListingCardSkeleton compact={true} />
                  </div>
                ))
              ) : filteredListings.length > 0 ? (
                filteredListings.map((listing) => (
                  <div 
                    key={listing.id} 
                    id={`listing-${listing.id}`}
                    className={`transition-all duration-300 rounded-xl cursor-pointer ${selectedListing === listing.id ? 'ring-2 ring-[#17294F] ring-offset-2' : ''}`}
                    // eslint-disable-next-line react-hooks/refs
                    onClick={() => handleListingClick(listing)}
                  >
                    <ListingCard 
                      listing={listing}
                      onClick={() => navigate(`/listing/${listing.id}`)}
                      compact={true}
                    />
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={32} className="text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-bold">No listings here</h3>
                  <p className="text-neutral-500 text-sm mt-1">Try adjusting your filters or area</p>
                </div>
              )}
            </div>
            
            <div className="h-12" />
          </div>
        </div>

        {/* Desktop Collapse Toggle Button */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`hidden md:flex items-center justify-center absolute top-1/2 z-30 bg-white border border-neutral-200 w-6 h-14 rounded-r-xl shadow-md hover:bg-neutral-50 transition-all duration-300 -translate-y-1/2 transform ${isSidebarCollapsed ? 'left-0' : 'md:portrait:left-[330px] md:landscape:left-[420px] lg:left-[480px]'}`}
        >
          {isSidebarCollapsed ? (
            <ChevronRight size={16} className="text-neutral-500" />
          ) : (
            <ChevronLeft size={16} className="text-neutral-500" />
          )}
        </button>

        {/* Right Map */}
        <div className="flex-1 h-full relative">
          <div ref={mapContainer} className="w-full h-full" />
          
          <div className="hidden md:flex absolute bottom-10 right-10 flex-col gap-2 z-10">
            <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden divide-y divide-neutral-100 flex flex-col">
               <button className="p-3 hover:bg-neutral-50 transition font-bold text-neutral-600" onClick={() => map.current?.zoomIn()}>+</button>
               <button className="p-3 hover:bg-neutral-50 transition font-bold text-neutral-600" onClick={() => map.current?.zoomOut()}>−</button>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Scrollable Listings Overlay */}
        <div className="md:hidden absolute bottom-6 left-0 right-0 z-40 px-4 pb-0">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {filteredListings.map((listing) => (
              <div 
                key={listing.id} 
                id={`mobile-listing-${listing.id}`}
                className="snap-center shrink-0 w-full flex justify-center"
                onClick={() => {
                  setSelectedListing(listing.id);
                  if (listing.lat && listing.lng && map.current) {
                    map.current.flyTo({ center: [listing.lng, listing.lat], zoom: 16 });
                  }
                }}
              >
                <div className={`w-full [@media(max-height:600px)_and_(orientation:landscape)]:max-w-[340px] transition-all duration-300 rounded-[1.5rem] bg-white shadow-2xl ${selectedListing === listing.id ? 'ring-2 ring-[#17294F] scale-[1.02]' : 'scale-100'}`}>
                  <ListingCard 
                    listing={listing}
                    onClick={() => navigate(`/listing/${listing.id}`)}
                    compact={true}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
