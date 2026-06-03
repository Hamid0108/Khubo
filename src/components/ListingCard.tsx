import { Star, ShieldCheck } from 'lucide-react';
import { Listing } from '../types';
import { motion } from 'motion/react';

interface ListingCardProps {
  listing: Listing;
  onClick: () => void;
  compact?: boolean;
}

export default function ListingCard({ listing, onClick, compact }: ListingCardProps) {
  if (compact) {
    return (
      <motion.div 
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        tabIndex={0}
        role="button"
        className="col-span-1 cursor-pointer bg-white rounded-xl p-2 sm:p-2.5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group outline-none focus-visible:ring-2 focus-visible:ring-[#17294F] flex flex-row gap-3 h-[96px] sm:h-[104px]"
      >
        <div className="aspect-[4/3] h-full relative overflow-hidden rounded-lg flex-shrink-0">
          <img
            src={listing.image}
            alt={listing.title}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800';
            }}
            className="object-cover h-full w-full group-hover:scale-105 transition duration-700"
          />
          <div aria-hidden="true" className="absolute top-1 right-1 z-10 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded-md text-white text-[7px] font-bold">
            {listing.date}
          </div>
        </div>
        
        <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-extrabold text-[14px] sm:text-[15px] leading-tight truncate text-[#1a1a1a] mb-0.5">{listing.title}</h3>
            <div className="text-[11px] text-gray-500 font-medium truncate">{listing.location}</div>
          </div>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col">
               <div className="font-display font-extrabold text-[#17294F] text-[14px]">P{listing.price}</div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 bg-amber-50 px-1 py-0.5 rounded-md text-amber-700">
                <Star size={8} className="fill-amber-400 text-amber-400" />
                <span className="text-[9px] font-bold">{listing.rating.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${listing.title} at ${listing.location}. Price P${listing.price} per month. Rating ${listing.rating.toFixed(2)} stars.`}
      className="col-span-1 cursor-pointer bg-white rounded-2xl p-2 sm:p-3 shadow-md hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 group outline-none focus-visible:ring-2 focus-visible:ring-[#17294F] focus-visible:ring-offset-2"
    >
      <div className="flex flex-col gap-2.5 sm:gap-3 w-full">
        <div className="aspect-[4/3] relative overflow-hidden rounded-xl">
          <img
            src={listing.image}
            alt={listing.title}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800';
            }}
            className="object-cover h-full w-full group-hover:scale-105 transition duration-700"
          />
          <div aria-hidden="true" className="absolute top-2.5 right-2.5 z-10 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-[9px] sm:text-[10px] font-bold">
            {listing.date}
          </div>
        </div>
        
        <div className="px-1.5 sm:px-1 flex flex-col gap-1">
          <h3 className="font-display font-extrabold text-[15px] sm:text-[16px] leading-tight truncate text-[#1a1a1a]">{listing.title}</h3>
          
          <div className="flex items-center justify-between gap-1.5 mt-0.5">
            <div className="text-[11px] sm:text-[12px] text-gray-500 font-medium truncate flex-1">{listing.location}</div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100 flex-shrink-0">
               <ShieldCheck size={10} className="fill-blue-600 text-white sm:w-3 sm:h-3" />
               <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-tight">Verified</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-1 sm:mt-1.5">
            <div className="flex items-baseline gap-1">
               <div className="font-display font-extrabold text-[#17294F] text-[15px] sm:text-[17px]">P{listing.price}</div>
               <div className="text-[10px] sm:text-[11px] text-gray-500 font-medium">/month</div>
            </div>
            <div className="flex items-center gap-1">
              <Star size={11} className="fill-amber-400 text-amber-400 sm:w-[13px] sm:h-[13px]" />
              <span className="text-[12px] sm:text-[13px] font-bold text-gray-700">{listing.rating.toFixed(2)}</span>
            </div>
          </div>
          
          <div aria-hidden="true" className="flex items-center justify-end mt-2 pt-2 border-t border-gray-50">
            <div className="flex gap-1.5 overflow-hidden">
              {listing.amenities.slice(0, 2).map((amenity, i) => (
                <span key={i} className="px-2 py-0.5 bg-gray-50 rounded text-[8px] sm:text-[9px] text-gray-500 border border-gray-100 whitespace-nowrap font-medium">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
