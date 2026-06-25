// @context: Horizontal listing carousel — scrollable row of ListingCards
// @purpose: Reusable carousel component with title, arrows, and skeleton loading; used on Home page for sections
// @behavior: Renders listings in horizontal scrollable container; uses sliceStart/sliceEnd for chunking
// @behavior: Shows skeleton cards during loading; prev/next scroll buttons for desktop
// @dependencies: ListingCard, ListingCardSkeleton, Listing type, lucide-react
// @code-template: Pattern for adding new listing sections: <ListingCarousel title="..." listings={...} loading={...} />

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Listing } from '../types';
import ListingCard from './ListingCard';
import ListingCardSkeleton from './ListingCardSkeleton';
import { ListingsPopup } from './ListingsPopup';

interface ListingCarouselProps {
  title: string;
  categoryPath: string;
  listings: Listing[];
  loading: boolean;
  sliceStart: number;
  sliceEnd: number;
  skeletonPrefix: string;
  carouselItemClass: string;
  onListingClick: (id: string) => void;
  onNavigateCategory: (path: string) => void;
}

const CAROUSEL_SCROLLER_CLASS =
  'flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth';

export function ListingCarousel({
  title,
  categoryPath,
  listings,
  loading,
  sliceStart,
  sliceEnd,
  skeletonPrefix,
  carouselItemClass,
  onListingClick,
  onNavigateCategory,
}: ListingCarouselProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [showPopup, setShowPopup] = React.useState(false);

  const scroll = (direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.8;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-2 group cursor-pointer min-w-0"
          onClick={() => setShowPopup(true)}
        >
          <h2 className="font-display font-extrabold text-xl sm:text-2xl md:text-3xl text-black whitespace-nowrap truncate">
            {title}
          </h2>
          <div className="flex items-center gap-1 px-3 py-1 bg-[#17294F] text-white rounded-full ml-1 sm:ml-2 flex-shrink-0">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">
              See more
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 bg-white hover:border-black hover:bg-neutral-50 transition-all active:scale-90"
            aria-label={`Previous ${title}`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 bg-white hover:border-black hover:bg-neutral-50 transition-all active:scale-90"
            aria-label={`Next ${title}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={ref}
        className={CAROUSEL_SCROLLER_CLASS}
        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={`skeleton-${skeletonPrefix}-${i}`} className={carouselItemClass}>
              <ListingCardSkeleton />
            </div>
          ))
        ) : (
          listings.slice(sliceStart, sliceEnd).map((listing) => (
            <div key={listing.id} className={carouselItemClass}>
              <ListingCard
                listing={listing}
                onClick={() => onListingClick(listing.id)}
              />
            </div>
          ))
        )}
      </div>

      <ListingsPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        title={title}
        listings={listings.slice(sliceStart, sliceEnd)}
        onListingClick={onListingClick}
      />
    </div>
  );
}
