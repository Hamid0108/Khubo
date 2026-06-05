import React from 'react';
import * as Icons from 'lucide-react';
import { CATEGORIES } from '../data/listings';
import { cn } from '../lib/utils';

interface CategoriesProps {
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export default function Categories({ selectedCategory, onSelect }: CategoriesProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="py-2 sm:py-4 bg-white w-full relative">
      <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 md:left-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 flex items-center justify-center bg-white border border-neutral-200 rounded-full text-neutral-500 shadow-sm hover:text-neutral-800 hover:border-neutral-300 active:scale-95 transition-all hidden md:flex"
        aria-label="Scroll left"
      >
        <Icons.ChevronLeft size={16} strokeWidth={2} />
      </button>

      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 md:right-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 flex items-center justify-center bg-white border border-neutral-200 rounded-full text-neutral-500 shadow-sm hover:text-neutral-800 hover:border-neutral-300 active:scale-95 transition-all hidden md:flex"
        aria-label="Scroll right"
      >
        <Icons.ChevronRight size={16} strokeWidth={2} />
      </button>

      <div 
        ref={scrollRef}
        className="flex flex-row items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth pl-4 md:pl-12 py-1 w-full touch-pan-x"
      >
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.label;

          return (
            <button
              key={category.label}
              onClick={() => onSelect(category.label)}
              className={cn(
                "px-2.5 py-1 sm:px-4 sm:py-2 rounded-full border text-[10px] sm:text-xs font-bold sm:tracking-wider uppercase transition-all duration-200 whitespace-nowrap flex-shrink-0 active:scale-95 cursor-pointer",
                isSelected 
                   ? "bg-neutral-900 text-white border-neutral-900 shadow-sm" 
                   : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-800 hover:text-neutral-900"
              )}
            >
              {category.label}
            </button>
          );
        })}
        {/* End Spacer to guarantee the rightmost items can be scrolled into view without clipping */}
        <div className="w-4 md:w-12 h-1 flex-shrink-0" aria-hidden="true" />
      </div>
    </div>
  );
}
