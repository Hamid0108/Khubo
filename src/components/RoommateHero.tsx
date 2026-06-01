import { Search, MapPin, Megaphone, Calendar as CalendarIcon, ChevronDown, Wallet, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import RoommateSearchDropdown from './RoommateSearchDropdown';

interface RoommateHeroProps {
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  isSearchActive?: boolean;
  setIsSearchActive?: (active: boolean) => void;
  onOpenMobileSearch?: () => void;
  onSelectRoommate?: (roommate: any) => void;
  suppressDropdown?: boolean;
}

export default function RoommateHero({
  searchQuery = '',
  setSearchQuery = () => {},
  isSearchActive = false,
  setIsSearchActive = () => {},
  onOpenMobileSearch = () => {},
  onSelectRoommate,
  suppressDropdown = false
}: RoommateHeroProps) {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState<'location' | 'budget' | 'general' | null>(null);
  const [hideDropdown, setHideDropdown] = useState(false);

  useEffect(() => {
    if (suppressDropdown) {
      setActiveDropdown(null);
      setIsSearchActive(false);
    }
  }, [suppressDropdown, setIsSearchActive]);

  useEffect(() => {
    if (isSearchActive) {
      setHideDropdown(false);
    }
  }, [isSearchActive]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (dropdown: 'location' | 'budget' | 'general') => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <div className="relative h-[22vh] sm:h-[45vh] min-h-[240px] sm:min-h-[350px] w-full z-50">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1600')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 max-w-[2520px] mx-auto h-full px-4 md:px-12">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between py-4 md:py-6 px-4 md:px-12 gap-4 z-20">
          <button 
            aria-label="Home" 
            onClick={() => navigate('/')} 
            className="flex items-center justify-center overflow-hidden w-10 h-10 md:w-16 md:h-16 transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 rounded-xl"
          >
            <img 
              src="/Khuno Logo.png" 
              alt="Khubo Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </button>

          <button className="flex items-center justify-center w-10 h-10 md:w-16 md:h-16 bg-transparent text-white hover:scale-105 active:scale-95 transition-transform">
            <Megaphone className="w-5 h-5 md:w-8 md:h-8" />
          </button>
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-center justify-center text-center h-full pt-8 md:pt-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-baseline gap-3 md:gap-4"
          >
            <h1 className="font-noto-serif italic text-white text-xl sm:text-2xl md:text-[35px] tracking-tight leading-tight">
              The Smarter Way to Share
            </h1>
            <p className="text-white/70 font-roboto font-bold text-[10px] md:text-base tracking-[0.3em] uppercase">
              by <span className="text-white">KHUBO</span>
            </p>
          </motion.div>

           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.4 }}
             className="mt-5 md:mt-12 bg-white/10 backdrop-blur-md border border-white/20 p-1.5 md:p-2 rounded-full flex items-center text-white shadow-2xl w-[98%] max-w-[450px] md:max-w-[700px] lg:max-w-[820px] dropdown-container relative z-40 pointer-events-auto cursor-default"
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
                  <RoommateSearchDropdown
                    searchQuery={searchQuery}
                    setSearchQuery={(val) => {
                       setSearchQuery(val);
                       setHideDropdown(true);
                    }}
                    onClose={() => {
                      setHideDropdown(true);
                      setIsSearchActive(false);
                    }}
                    onSelectRoommate={onSelectRoommate}
                  />
                )}
              </>
            ) : (
              <>
                <div className="flex-[1.2] min-w-0">
                  <div 
                    role="button" 
                    tabIndex={0} 
                    aria-label="Location: Location"
                    onClick={() => toggleDropdown('location')}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggleDropdown('location'))}
                    className={`w-full flex items-center justify-between px-1.5 md:pl-6 md:pr-4 py-2.5 md:py-3.5 transition-all cursor-pointer group focus-visible:outline-none ${
                        activeDropdown === 'location' 
                        ? 'bg-white rounded-full text-[#17294F] relative z-[60] shadow-[0_-5px_10px_rgba(0,0,0,0.05)] md:shadow-md' 
                        : 'hover:bg-white/5 rounded-full'
                      }`}
                  >
                    <div className="flex items-center gap-1 md:gap-3 min-w-0">
                      <MapPin className="text-[#2252D6] flex-shrink-0 w-3 h-3 md:w-[16px] md:h-[16px]" />
                      <span className={`text-[10px] md:text-base font-bold truncate md:whitespace-nowrap ${activeDropdown === 'location' ? 'text-neutral-900' : 'text-white'}`}>Location</span>
                    </div>
                    <ChevronDown className={`flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity w-3 h-3 md:w-4 md:h-4 ml-1 ${activeDropdown === 'location' ? 'rotate-180 text-neutral-900' : ''}`} />
                  </div>

                  <AnimatePresence>
                    {activeDropdown === 'location' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-[100%] mt-2 left-0 w-full bg-white rounded-2xl md:rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] md:shadow-xl border border-neutral-100 p-4 z-50 text-left"
                      >
                        <div className="space-y-4">
                          <div>
                              <div className="flex items-center px-4 py-2 bg-neutral-100 rounded-xl mb-3 focus-within:ring-2 focus-within:ring-[#2252D6]/20 transition-all cursor-text" onClick={(e) => { e.stopPropagation(); (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus(); }}>
                                <Search className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
                                <input 
                                  type="text"
                                  placeholder="Search location..."
                                  className="w-full bg-transparent border-none outline-none text-sm font-medium text-neutral-900 placeholder:text-neutral-400 p-0 focus:ring-0"
                                />
                              </div>
                            <div className="space-y-1">
                              {['Iligan City', 'Cagayan de Oro', 'Butuan City'].map((loc) => (
                                <button 
                                  key={loc}
                                  onClick={() => { setActiveDropdown(null); navigate('/roommate-finder'); }}
                                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 transition-colors group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-[#2252D6]/10 flex items-center justify-center text-[#2252D6] group-hover:bg-[#2252D6] group-hover:text-white transition-all">
                                    <MapPin size={14} />
                                  </div>
                                  <span className="font-medium text-neutral-800 text-sm">{loc}</span>
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

                <div className="flex-1 min-w-0">
                  <div 
                    role="button" 
                    tabIndex={0} 
                    aria-label="Add budget"
                    onClick={() => toggleDropdown('budget')}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggleDropdown('budget'))}
                    className={`w-full flex items-center justify-between px-1.5 md:pl-6 md:pr-4 py-2.5 md:py-3.5 transition-all cursor-pointer group focus-visible:outline-none ${
                        activeDropdown === 'budget' 
                        ? 'bg-white rounded-full text-[#17294F] relative z-[60] shadow-[0_-5px_10px_rgba(0,0,0,0.05)] md:shadow-md' 
                        : 'hover:bg-white/5 rounded-full'
                      }`}
                  >
                    <div className="flex items-center gap-1 md:gap-3 min-w-0">
                      <Wallet className="text-[#2252D6] flex-shrink-0 w-3 h-3 md:w-[16px] md:h-[16px]" />
                      <span className={`text-[10px] md:text-base font-bold truncate md:whitespace-nowrap ${activeDropdown === 'budget' ? 'text-neutral-900' : 'text-white'}`}>Budget</span>
                    </div>
                    <ChevronDown className={`flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity w-3 h-3 md:w-4 md:h-4 ml-1 ${activeDropdown === 'budget' ? 'rotate-180 text-neutral-900' : ''}`} />
                  </div>

                  <AnimatePresence>
                    {activeDropdown === 'budget' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-[100%] mt-2 left-0 w-full bg-white rounded-2xl md:rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] md:shadow-xl border border-neutral-100 p-4 z-50 text-left"
                      >
                        <div className="space-y-3">
                          <div className="relative mb-3">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">₱</span>
                            <input 
                              type="text"
                              placeholder="Any budget..."
                              className="w-full bg-neutral-100 border-none rounded-xl py-2.5 pl-8 pr-4 text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#2252D6]/20 transition-all placeholder:text-neutral-400"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="grid grid-cols-1 gap-1">
                            {[
                              { label: '₱1k - ₱3k' },
                              { label: '₱3k - ₱5k' },
                              { label: '₱5k+' }
                            ].map((range) => (
                              <button 
                                key={range.label}
                                onClick={() => { setActiveDropdown(null); navigate('/roommate-finder'); }}
                                className="flex flex-col p-3 rounded-xl bg-neutral-50 border border-neutral-100 hover:border-[#17294F]/30 hover:bg-white transition-all text-left"
                              >
                                <span className="font-medium text-neutral-900 text-sm">{range.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                 <button 
                  aria-label="Search" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (window.innerWidth < 768) {
                      onOpenMobileSearch();
                    } else {
                      setSearchQuery('');
                      setIsSearchActive(true);
                    }
                  }}
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
  );
}
