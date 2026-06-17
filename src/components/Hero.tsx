import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Megaphone, Calendar as CalendarIcon, ChevronDown, Wallet, X, Clock, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { DateScrollPicker } from './DateScrollPicker';
import SearchDropdown from './SearchDropdown';
import { AnnouncementsOverlay } from './AnnouncementsOverlay';

interface HeroProps {
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  isSearchActive?: boolean;
  setIsSearchActive?: (active: boolean) => void;
  onOpenMobileSearch?: () => void;
  suppressDropdown?: boolean;
  selectedLocation?: string;
  setSelectedLocation?: (val: string) => void;
  selectedDates?: string;
  setSelectedDates?: (val: string) => void;
  selectedBudget?: string;
  setSelectedBudget?: (val: string) => void;
}

export default function Hero({
  searchQuery = '',
  setSearchQuery = () => {},
  isSearchActive = false,
  setIsSearchActive = () => {},
  onOpenMobileSearch = () => {},
  suppressDropdown = false,
  selectedLocation = '',
  setSelectedLocation = () => {},
  selectedDates = '',
  setSelectedDates = () => {},
  selectedBudget = '',
  setSelectedBudget = () => {}
}: HeroProps) {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState<'location' | 'dates' | 'budget' | 'general' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [hideDropdown, setHideDropdown] = useState(false);
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false);

  useEffect(() => {
    if (isSearchActive) {
      setHideDropdown(false);
    }
  }, [isSearchActive]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (suppressDropdown) {
      setActiveDropdown(null);
      setIsSearchActive(false);
    }
  }, [suppressDropdown, setIsSearchActive]);

  const toggleDropdown = (dropdown: 'location' | 'dates' | 'budget' | 'general') => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <div className="relative h-[22vh] sm:h-[45vh] min-h-[240px] sm:min-h-[350px] w-full z-50">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1600')" }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 max-w-[2520px] mx-auto h-full px-4 md:px-12">
        {/* Top bar with Search - Absolute to not affect centering of main content */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between py-4 md:py-6 px-4 md:px-12 gap-4 z-20">
          <button aria-label="Home" className="flex items-center justify-center overflow-hidden w-10 h-10 md:w-16 md:h-16 transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 rounded-xl">
            <img 
               src="/khubo Logo.png" 
               alt="Khubo Logo" 
               className="w-full h-full object-contain"
               referrerPolicy="no-referrer"
            />
          </button>

          <button 
            aria-label="Announcements" 
            onClick={() => setIsAnnouncementsOpen(true)}
            className="flex items-center justify-center w-10 h-10 md:w-16 md:h-16 bg-transparent text-white transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full"
          >
            <Megaphone className="w-5 h-5 md:w-8 md:h-8" />
          </button>
        </div>

        {/* Center Content - Perfectly symmetrical */}
        <div className="flex flex-col items-center justify-center text-center h-full pt-8 md:pt-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-row items-center justify-center gap-x-4 md:gap-x-6 text-white px-4"
          >
            <span className="font-noto-serif italic text-xl sm:text-2xl md:text-[35px] tracking-[0.2em] md:tracking-[0.3em] opacity-80 whitespace-nowrap">
              WELCOME TO
            </span>
            <span className="font-roboto font-bold text-2xl sm:text-3xl md:text-[35px] tracking-[0.1em]">
               KHUBO
            </span>
          </motion.h1>

          <div className="relative mt-5 md:mt-12 w-full flex justify-center animate-fade-in" ref={dropdownRef}>
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.4 }}
               className="bg-white/10 backdrop-blur-md border border-white/20 p-1.5 md:p-2 rounded-full flex items-center text-white shadow-2xl w-[98%] max-w-[450px] md:max-w-[700px] lg:max-w-[820px] relative z-[95] transition-all duration-300 pointer-events-auto cursor-default"
            >
              {isSearchActive ? (
                <>
                  <div className="flex-1 flex items-center pl-4 md:pl-6 pr-0 py-0 w-full">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setHideDropdown(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setHideDropdown(true);
                          setIsSearchActive(false);
                        }
                      }}
                      placeholder="what are you looking for?"
                      className="w-full bg-transparent border-none outline-none text-xs sm:text-sm md:text-base font-bold text-white placeholder:text-white/50 focus:ring-0 p-0"
                      autoFocus
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')} 
                        className="p-1 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                        aria-label="Clear search"
                      >
                        <X className="w-4 h-4 text-white/80" />
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setIsSearchActive(false);
                      }}
                      className="bg-[#17294F] p-2 md:p-4 rounded-full transition-all duration-200 shadow-lg ml-0.5 md:ml-1.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white flex-shrink-0 flex items-center justify-center cursor-pointer"
                      aria-label="Search"
                    >
                      <Search size={16} className="text-white group-hover:stroke-[3px] transition-all md:hidden" />
                      <Search size={22} className="text-white group-hover:stroke-[3px] transition-all hidden md:block" />
                    </button>
                  </div>
                  {!suppressDropdown && !hideDropdown && (
                    <SearchDropdown
                      searchQuery={searchQuery}
                      setSearchQuery={(val) => {
                         setSearchQuery(val);
                         setHideDropdown(true);
                      }}
                      onClose={() => {
                        setHideDropdown(true);
                        setIsSearchActive(false);
                      }}
                    />
                  )}
                </>
              ) : (
                <>
                  {/* Location Section */}
                  <div className="flex-[1.2] min-w-0">
                    <div 
                      role="button" 
                      tabIndex={0} 
                      aria-label="Location: Location"
                      onClick={() => toggleDropdown('location')}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggleDropdown('location'))}
                      className={`w-full flex items-center justify-between px-1.5 md:pl-6 md:pr-4 py-2.5 md:py-3.5 transition-all cursor-pointer group select-none focus-visible:outline-none ${
                        activeDropdown === 'location' 
                        ? 'bg-white rounded-full text-[#17294F] relative z-[60] shadow-[0_-5px_10px_rgba(0,0,0,0.05)] md:shadow-md' 
                        : 'hover:bg-white/5 rounded-full'
                      }`}
                    >
                      <div className="flex items-center gap-1 md:gap-3 min-w-0">
                        <MapPin className={`${activeDropdown === 'location' ? 'text-[#2252D6]' : 'text-[#2252D6]'} flex-shrink-0 w-3 h-3 md:w-[16px] md:h-[16px]`} />
                        <span className={`text-[10px] md:text-base font-bold truncate md:whitespace-nowrap ${activeDropdown === 'location' ? 'text-neutral-900' : 'text-white'}`}>
                          {selectedLocation || 'Location'}
                        </span>
                        {selectedLocation && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLocation('');
                              setSearchQuery('');
                            }}
                            className="p-0.5 hover:bg-white/20 rounded-full text-white/85 ml-1 flex-shrink-0 z-[70] cursor-pointer pointer-events-auto"
                          >
                            <X size={12} className={activeDropdown === 'location' ? 'text-neutral-900' : 'text-white'} />
                          </button>
                        )}
                      </div>
                      <ChevronDown className={`flex-shrink-0 opacity-50 group-hover:opacity-100 transition-all w-3 h-3 md:w-4 md:h-4 ${activeDropdown === 'location' ? 'rotate-180 text-neutral-950' : ''}`} />
                    </div>

                    <AnimatePresence>
                      {activeDropdown === 'location' && (
                        <motion.div
                          initial={{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }}
                          animate={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
                          exit={{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }}
                          transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
                          className="absolute top-[100%] mt-2 left-0 w-full bg-white rounded-2xl md:rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] md:shadow-xl border border-neutral-100 p-3 md:p-6 z-50 text-left"
                        >
                          <div className="space-y-3 md:space-y-4">
                            <div>
                              <div className="flex items-center px-2.5 py-2 block bg-neutral-100 rounded-xl mb-2 focus-within:ring-2 focus-within:ring-[#2252D6]/20 transition-all cursor-text" onClick={(e) => { e.stopPropagation(); (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus(); }}>
                                <Search className="w-3.5 h-3.5 md:w-4 md:h-4 text-neutral-400 mr-1.5 flex-shrink-0" />
                                <input 
                                  type="text"
                                  placeholder="Search..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="w-full bg-transparent border-none outline-none text-xs md:text-sm font-medium text-neutral-900 placeholder:text-neutral-400 p-0 focus:ring-0"
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
                                    className="w-full flex items-center gap-2 md:gap-3 p-1.5 md:p-2 rounded-xl hover:bg-neutral-50 transition-colors group"
                                  >
                                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-[#2252D6]/10 flex items-center justify-center text-[#2252D6] group-hover:bg-[#2252D6] group-hover:text-white transition-all flex-shrink-0">
                                      <MapPin size={12} className="md:w-3.5 md:h-3.5" />
                                    </div>
                                    <span className="font-medium text-neutral-800 text-xs md:text-sm whitespace-nowrap">{loc}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="w-[1px] h-5 md:h-8 bg-white/20" />

                  {/* Dates Section */}
                  <div className="flex-1 min-w-0">
                    <div 
                      role="button" 
                      tabIndex={0} 
                      aria-label="Add dates"
                      onClick={() => toggleDropdown('dates')}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggleDropdown('dates'))}
                      className={`w-full flex items-center justify-between px-1.5 md:pl-6 md:pr-4 py-2.5 md:py-3.5 transition-all cursor-pointer group select-none focus-visible:outline-none ${
                        activeDropdown === 'dates' 
                        ? 'bg-white rounded-full text-[#17294F] relative z-[60] shadow-[0_-5px_10px_rgba(0,0,0,0.05)] md:shadow-md' 
                        : 'hover:bg-white/5 rounded-full'
                      }`}
                    >
                      <div className="flex items-center gap-1 md:gap-3 min-w-0">
                        <CalendarIcon className="text-[#2252D6] flex-shrink-0 w-3 h-3 md:w-[16px] md:h-[16px]" />
                        <span className={`text-[10px] md:text-base font-bold truncate md:whitespace-nowrap ${activeDropdown === 'dates' ? 'text-neutral-900' : 'text-white'}`}>
                          {selectedDates || 'Dates'}
                        </span>
                        {selectedDates && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDates('');
                              setSearchQuery('');
                            }}
                            className="p-0.5 hover:bg-white/20 rounded-full text-white/85 ml-1 flex-shrink-0 z-[70] cursor-pointer pointer-events-auto"
                          >
                            <X size={12} className={activeDropdown === 'dates' ? 'text-neutral-900' : 'text-white'} />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronDown className={`flex-shrink-0 opacity-50 group-hover:opacity-100 transition-all w-3 h-3 md:w-4 md:h-4 ${activeDropdown === 'dates' ? 'rotate-180 text-neutral-950' : ''}`} />
                      </div>
                    </div>

                    <AnimatePresence>
                      {activeDropdown === 'dates' && (
                        <motion.div
                          initial={{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }}
                          animate={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
                          exit={{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }}
                          transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
                          className="absolute top-[100%] mt-2 left-0 w-full bg-white rounded-2xl md:rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] md:shadow-xl border border-neutral-100 overflow-hidden z-50 text-left"
                        >
                          <DateScrollPicker 
                            viewportHeight={132} 
                            onMonthClick={(m) => {
                              setSelectedDates(m);
                              setSearchQuery(searchQuery ? `${searchQuery} in ${m}` : m);
                              setActiveDropdown(null);
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="w-[1px] h-5 md:h-8 bg-white/20" />

                  {/* Budget Section */}
                  <div className="flex-1 min-w-0">
                    <div 
                      role="button" 
                      tabIndex={0} 
                      aria-label="Add budget"
                      onClick={() => toggleDropdown('budget')}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggleDropdown('budget'))}
                      className={`w-full flex items-center justify-between px-1.5 md:pl-6 md:pr-4 py-2.5 md:py-3.5 transition-all cursor-pointer group select-none focus-visible:outline-none ${
                        activeDropdown === 'budget' 
                        ? 'bg-white rounded-full text-[#17294F] relative z-[60] shadow-[0_-5px_10px_rgba(0,0,0,0.05)] md:shadow-md' 
                        : 'hover:bg-white/5 rounded-full'
                      }`}
                    >
                      <div className="flex items-center gap-1 md:gap-3 min-w-0">
                        <Wallet className="text-[#2252D6] flex-shrink-0 w-3 h-3 md:w-[16px] md:h-[16px]" />
                        <span className={`text-[10px] md:text-base font-bold truncate md:whitespace-nowrap ${activeDropdown === 'budget' ? 'text-neutral-900' : 'text-white'}`}>
                          {selectedBudget || 'Budget'}
                        </span>
                        {selectedBudget && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBudget('');
                              setSearchQuery('');
                            }}
                            className="p-0.5 hover:bg-white/20 rounded-full text-white/85 ml-1 flex-shrink-0 z-[70] cursor-pointer pointer-events-auto"
                          >
                            <X size={12} className={activeDropdown === 'budget' ? 'text-neutral-900' : 'text-white'} />
                          </button>
                        )}
                      </div>
                      <ChevronDown className={`flex-shrink-0 opacity-50 group-hover:opacity-100 transition-all w-3 h-3 md:w-4 md:h-4 ${activeDropdown === 'budget' ? 'rotate-180 text-neutral-950' : ''}`} />
                    </div>

                    <AnimatePresence>
                      {activeDropdown === 'budget' && (
                        <motion.div
                          initial={{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }}
                          animate={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
                          exit={{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }}
                          transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
                          className="absolute top-[100%] mt-2 left-0 w-full bg-white rounded-2xl md:rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] md:shadow-xl border border-neutral-100 p-3 md:p-6 z-50 text-left"
                        >
                          <div className="space-y-2 md:space-y-3">
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
                                  <span className="font-medium text-neutral-900 text-xs md:text-sm">{range.label}</span>
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
                      e.preventDefault();
                      e.stopPropagation();
                      setSearchQuery('');
                      setIsSearchActive(true);
                      setActiveDropdown(null);
                    }}
                    aria-label="Search" 
                    className="bg-[#17294F] p-2 md:p-4 rounded-full transition-all duration-200 shadow-lg ml-0.5 md:ml-1.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white flex-shrink-0"
                  >
                    <Search size={16} className="text-white group-hover:stroke-[3px] transition-all md:hidden" />
                    <Search size={22} className="text-white group-hover:stroke-[3px] transition-all hidden md:block" />
                  </button>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      <AnnouncementsOverlay isOpen={isAnnouncementsOpen} onClose={() => setIsAnnouncementsOpen(false)} />
    </div>
  );
}

const Sparkles = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M3 5h4"/><path d="M21 17v4"/><path d="M19 19h4"/>
  </svg>
);

