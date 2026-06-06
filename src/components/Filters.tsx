import React, { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, ChevronDown, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface FiltersProps {
  onFilterChange: (filters: FilterState) => void;
  currentFilters: FilterState;
}

export interface FilterState {
  minPrice: number;
  maxPrice: number;
  minRating: number;
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'rating';
}

export default function Filters({ onFilterChange, currentFilters }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReset = () => {
    onFilterChange({
      minPrice: 0,
      maxPrice: 50000,
      minRating: 0,
      sortBy: 'relevance'
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-center p-2.5 sm:p-3 rounded-xl border border-neutral-200 hover:border-black transition-all bg-white shadow-sm relative",
          isOpen && "border-black ring-1 ring-black"
        )}
        aria-label="Filters"
      >
        <SlidersHorizontal className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] text-neutral-700" strokeWidth={2} />
        {Object.values(currentFilters).some((v, i) => {
          if (i === 0) return v !== 0;
          if (i === 1) return v !== 50000;
          if (i === 2) return v !== 0;
          if (i === 3) return v !== 'relevance';
          return false;
        }) && (
          <span className="w-2.5 h-2.5 bg-[#2252D6] rounded-full absolute top-1.5 right-1.5 border-[2px] border-white" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
            className="absolute right-0 mt-2 w-[320px] md:w-[400px] bg-white rounded-2xl shadow-2xl border border-neutral-100 z-50 p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Filters</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-neutral-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-8">
              {/* Sort By */}
              <div>
                <label className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3 block">Sort By</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'relevance', label: 'Relevance' },
                    { id: 'price-low', label: 'Price: Low' },
                    { id: 'price-high', label: 'Price: High' },
                    { id: 'rating', label: 'Rating' }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => onFilterChange({ ...currentFilters, sortBy: option.id as any })}
                      className={cn(
                        "px-4 py-2 rounded-lg border text-sm font-medium transition-all text-center",
                        currentFilters.sortBy === option.id 
                          ? "bg-black text-white border-black" 
                          : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3 block">Price Range (Monthly)</label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <span className="text-[10px] text-neutral-400 font-bold block mb-1">MIN</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold">P</span>
                      <input
                        type="number"
                        value={currentFilters.minPrice}
                        onChange={(e) => onFilterChange({ ...currentFilters, minPrice: Number(e.target.value) })}
                        className="w-full pl-7 pr-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-neutral-400 font-bold block mb-1">MAX</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold">P</span>
                      <input
                        type="number"
                        value={currentFilters.maxPrice}
                        onChange={(e) => onFilterChange({ ...currentFilters, maxPrice: Number(e.target.value) })}
                        className="w-full pl-7 pr-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Minimum Rating */}
              <div>
                <label className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3 block">Minimum Rating</label>
                <div className="flex items-center justify-between gap-2 bg-neutral-50 p-1 rounded-xl">
                  {[0, 3, 4, 4.5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => onFilterChange({ ...currentFilters, minRating: rating })}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                        currentFilters.minRating === rating 
                          ? "bg-white shadow-sm text-black ring-1 ring-black/5" 
                          : "text-neutral-500 hover:text-black"
                      )}
                    >
                      {rating === 0 ? 'Any' : `${rating}+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between">
              <button 
                onClick={handleReset}
                className="text-sm font-bold underline hover:text-neutral-600 transition"
              >
                Clear all
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
              >
                Show Results
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
