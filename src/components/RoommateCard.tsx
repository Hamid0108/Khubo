import React from 'react';
import { MapPin, GraduationCap } from 'lucide-react';
import { Roommate } from '../types';
import { motion } from 'motion/react';

interface RoommateCardProps {
  roommate: Roommate;
  onProfileClick: (roommate: Roommate) => void;
  actionLabel?: string;
}

export default function RoommateCard({ roommate, onProfileClick, actionLabel = "Apply as Roommate" }: RoommateCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={() => onProfileClick(roommate)}
      className="bg-white rounded-2xl p-6 md:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 flex flex-col h-full transition-all duration-300 cursor-pointer"
    >
      {/* Header with Avatar and Basic Info */}
      <div className="flex flex-row items-start text-left gap-4 mb-5">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-100 flex-shrink-0 border-4 border-[#F0F2F5] shadow-inner">
          <img 
            src={roommate.image} 
            alt={roommate.name} 
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${roommate.name}&backgroundColor=b6e3f4`;
            }}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <h3 className="font-roboto font-black text-lg text-neutral-900 leading-tight mb-1 tracking-tight truncate">{roommate.name}</h3>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-neutral-600 font-bold text-[10px]">
              <GraduationCap size={14} className="text-[#17294F]" />
              <span className="truncate">{roommate.university} | {roommate.age}yrs | {roommate.gender}</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-400 font-black text-[9px] uppercase tracking-wider">
              <MapPin size={10} className="text-red-500" />
              <span className="truncate">{roommate.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="mb-5 flex-grow">
        <p className="text-neutral-700 text-sm leading-relaxed font-medium font-roboto italic opacity-90 line-clamp-3">
          "{roommate.bio}"
        </p>
      </div>

      {/* Tags Section */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {roommate.tags.map((tag, idx) => (
          <span 
            key={idx} 
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-black rounded-full text-[11px] sm:text-[13px] font-bold border border-black tracking-tight hover:bg-neutral-50 transition-colors cursor-default whitespace-nowrap"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer / Budget & Place */}
      <div className="pt-5 border-t border-neutral-100 flex flex-col gap-1 mb-6">
        <span className="text-[11px] font-black text-neutral-900 uppercase tracking-wide opacity-80 truncate">{roommate.preferredPlace}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-neutral-900">{roommate.budgetRange}</span>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">/monthly</span>
        </div>
      </div>

      {/* Action Button */}
      <button className="w-full py-3.5 bg-[#17294F] text-white rounded-2xl font-black text-xs uppercase tracking-[0.1em] transition-all hover:bg-[#1e325c] active:scale-95 shadow-md">
        {actionLabel}
      </button>
    </motion.div>
  );
}
