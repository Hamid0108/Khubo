import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Shield, Star, Sparkles, MapPin, Globe, Mic, Delete, CornerDownLeft, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSearchHistory } from '../hooks/useSearchHistory';

interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  defaultTab?: 'properties' | 'roommates';
}

export default function MobileSearchOverlay({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  defaultTab = 'properties'
}: MobileSearchOverlayProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { addSearch } = useSearchHistory();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [activeTab, setActiveTab] = useState<'properties' | 'roommates'>(defaultTab);
  const inputRef = useRef<HTMLInputElement>(null);
  const [shiftActive, setShiftActive] = useState(false);
  const [showSymbols, setShowSymbols] = useState(false);

  // Sync with prop when opened
  useEffect(() => {
    if (isOpen) {
      setLocalQuery(searchQuery);
      // Determine initial tab from route path
      if (location.pathname.includes('roommate')) {
        setActiveTab('roommates');
      } else {
        setActiveTab('properties');
      }
      
      // Auto-focus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, searchQuery, location.pathname]);

  if (!isOpen) return null;

  // Curated lists based on tab
  const propertySuggestions = [
    'MSU-IIT near',
    'cheap boarding house',
    'studio room with aircon',
    'Iligan city cabins',
    'bedspace under 2000',
    'ladies only dormitory'
  ];

  const roommateSuggestions = [
    'neat student roommate',
    'tidy study companion',
    'MSU-IIT engineering student',
    'quiet boarder',
    'non-smoker roommate',
    'Iligan clean flatmate'
  ];

  const suggestions = activeTab === 'properties' ? propertySuggestions : roommateSuggestions;

  const handleSearchSubmit = (queryToSubmit: string) => {
    addSearch(queryToSubmit);
    setSearchQuery(queryToSubmit);
    onClose();

    // Check if we need to redirect pages
    if (activeTab === 'properties') {
      if (location.pathname !== '/' && location.pathname !== '') {
        navigate('/', { replace: true });
        // Give route a moment to mount and scroll
        setTimeout(() => {
          const anchor = document.getElementById('search-results-anchor');
          anchor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else {
        const anchor = document.getElementById('search-results-anchor');
        anchor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      if (!location.pathname.includes('roommate')) {
        navigate('/roommate-finder', { replace: true });
        setTimeout(() => {
          const anchor = document.getElementById('roommate-results-anchor');
          anchor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else {
        const anchor = document.getElementById('roommate-results-anchor');
        anchor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleSuggestionClick = (phrase: string) => {
    setLocalQuery(phrase);
    handleSearchSubmit(phrase);
  };

  const clearSearch = () => {
    setLocalQuery('');
  };

  // Keyboard simulator typing helper
  const handleVirtualKeyPress = (key: string) => {
    if (key === 'space') {
      setLocalQuery(prev => prev + ' ');
    } else if (key === 'backspace') {
      setLocalQuery(prev => prev.slice(0, -1));
    } else if (key === 'return' || key === 'search') {
      handleSearchSubmit(localQuery);
    } else if (key === 'shift') {
      setShiftActive(!shiftActive);
    } else if (key === '123' || key === 'ABC') {
      setShowSymbols(!showSymbols);
    } else {
      let char = key;
      if (shiftActive) {
        char = key.toUpperCase();
        setShiftActive(false); // standard iOS tap logic
      }
      setLocalQuery(prev => prev + char);
    }
  };

  // Standard QWERTY layout matching high-fidelity iOS simulator keyboard
  const keyboardRows = showSymbols ? [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['-', '/', ':', ';', '(', ')', '₱', '&', '@', '"'],
    ['shift', '.', ',', '?', '!', '\'', 'backspace'],
    ['ABC', 'globe', 'space', '.', 'return']
  ] : [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
    ['123', 'globe', 'space', '@', '.', 'return']
  ];

  return (
    <div id="mobile-search-overlay-container" className="fixed inset-0 bg-white z-[100] flex flex-col md:hidden animate-fade-in select-none">
      {/* Top Status Bar Filler to replicate screen */}
      <div className="h-2 bg-[#F9F9F9]" />

      {/* Styled Header with back button on the left and input - layout matching request */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white border-b border-neutral-100 flex-shrink-0">
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-neutral-100 active:bg-neutral-200 rounded-full transition-all flex-shrink-0 text-neutral-800"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>
        
        <div className="flex-1 bg-neutral-100 rounded-full flex items-center px-3.5 py-2 border border-neutral-200/50">
          <Search className="w-4 h-4 text-neutral-500 mr-2 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit(localQuery);
              }
            }}
            placeholder={activeTab === 'properties' ? "Search cabins, rooms, location..." : "Search roommates, school, tags..."}
            className="w-full bg-transparent border-none outline-none text-sm font-bold text-neutral-900 placeholder:text-neutral-400 focus:ring-0 p-0"
          />
          {localQuery && (
            <button
              onClick={clearSearch}
              className="p-1 hover:bg-neutral-200 rounded-full transition-colors ml-1 flex-shrink-0"
              aria-label="Clear term"
            >
              <X className="w-3.5 h-3.5 text-neutral-500 font-bold" />
            </button>
          )}
        </div>
      </div>


      {/* Scrollable Suggestions List */}
      <div className="flex-1 overflow-y-auto bg-white px-4 py-2">
        {localQuery && (
          <div className="mb-4">
            <span className="text-[11px] font-black uppercase tracking-widest text-neutral-400 pl-2">Press enter to search</span>
            <button
              onClick={() => handleSearchSubmit(localQuery)}
              className="w-full mt-2 flex items-center gap-3.5 p-3 rounded-2xl hover:bg-neutral-50 border border-dashed border-[#2252D6]/20 bg-[#2252D6]/5 transition-colors text-left group"
            >
              <div className="w-9 h-9 rounded-full bg-[#2252D6]/10 flex items-center justify-center text-[#2252D6] flex-shrink-0">
                <Search size={16} />
              </div>
              <div>
                <span className="font-extrabold text-neutral-800 text-sm">Search for "{localQuery}"</span>
                <p className="text-xs text-neutral-500 mt-0.5">Filter results instantly across Khabo {activeTab}</p>
              </div>
            </button>
          </div>
        )}

        <div className="space-y-1 mb-6">
          <span className="text-[11px] font-black uppercase tracking-widest text-neutral-400 pl-2">Popular Suggestions</span>
          {suggestions.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(phrase)}
              className="w-full flex items-center gap-3.5 py-3 px-2 rounded-2xl hover:bg-neutral-50 transition-colors text-left border-b border-neutral-50 group"
            >
              <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 group-hover:bg-[#2252D6]/10 group-hover:text-[#2252D6] transition-all flex-shrink-0">
                <Search size={14} />
              </div>
              <span className="font-semibold text-neutral-700 text-sm group-hover:text-[#17294F] transition-colors truncate">
                {phrase}
              </span>
            </button>
          ))}
        </div>

        {/* Tips section */}
        <div className="rounded-2xl bg-neutral-50 p-4 border border-neutral-100 flex gap-3 text-neutral-500">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0 mt-0.5">
            <Sparkles size={14} />
          </div>
          <div>
            <h4 className="font-bold text-xs text-neutral-800">Khubo Native Search</h4>
            <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">Type names, location (e.g., Iligan, MSU-IIT), prices, or specific terms to discover beautiful rooms or ideal student flatmates immediately.</p>
          </div>
        </div>
      </div>

      {/* Simulated Interactive iOS QWERTY Keyboard - MATCHES SCREENSHOT EXACTLY */}
      <div className="bg-[#D1D4D9] p-1 pb-safe-bottom flex-shrink-0 select-none">
        <div className="space-y-1.5 py-1 px-1">
          {keyboardRows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-1.5 w-full">
              {row.map((key, keyIdx) => {
                // Determine layout styles
                let widthClass = 'flex-1';
                let content: React.ReactNode = key;
                let bgClass = 'bg-white active:bg-neutral-200 text-neutral-900 shadow-[0_1px_0_rgba(0,0,0,0.3)]';

                if (key === 'shift') {
                  widthClass = 'w-10 sm:w-12 max-w-[48px]';
                  bgClass = shiftActive ? 'bg-white text-blue-600 shadow-md font-bold' : 'bg-neutral-100/80 active:bg-neutral-200 text-neutral-700 shadow-[0_1px_0_rgba(0,0,0,0.3)]';
                  content = <span className="text-sm">⇧</span>;
                } else if (key === 'backspace') {
                  widthClass = 'w-10 sm:w-12 max-w-[48px]';
                  bgClass = 'bg-neutral-100/80 active:bg-neutral-200 text-neutral-700 shadow-[0_1px_0_rgba(0,0,0,0.3)]';
                  content = <Delete className="w-4 h-4 text-neutral-700" />;
                } else if (key === 'space') {
                  widthClass = 'w-2/5 max-w-[200px] flex-[3]';
                  content = <span className="text-xs uppercase text-neutral-400">space</span>;
                } else if (key === '123' || key === 'ABC') {
                  widthClass = 'w-12 sm:w-14 max-w-[56px]';
                  bgClass = 'bg-neutral-100/80 text-neutral-900 font-medium text-xs shadow-[0_1px_0_rgba(0,0,0,0.3)]';
                } else if (key === 'globe') {
                  widthClass = 'w-9 sm:w-10 max-w-[40px]';
                  bgClass = 'bg-neutral-100/80 text-neutral-700 shadow-[0_1px_0_rgba(0,0,0,0.3)]';
                  content = <Globe className="w-4 h-4" />;
                } else if (key === 'return') {
                  widthClass = 'w-16 sm:w-20 max-w-[80px] flex-[1.2]';
                  bgClass = 'bg-[#2252D6] active:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-[0_1px_0_rgba(0,0,0,0.3)]';
                  content = <div className="flex items-center justify-center gap-0.5"><span className="text-[10px]">Go</span><CornerDownLeft className="w-3 h-3" /></div>;
                }

                return (
                  <button
                    key={keyIdx}
                    onClick={() => handleVirtualKeyPress(key)}
                    className={`${widthClass} ${bgClass} h-11 rounded-md flex items-center justify-center font-bold text-sm transition-all duration-75 select-none touch-manipulation`}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        {/* iOS bar visualizer spacer */}
        <div className="h-6 flex items-center justify-center pb-1">
          <div className="w-32 h-1 bg-black/40 rounded-full" />
        </div>
      </div>
    </div>
  );
}
