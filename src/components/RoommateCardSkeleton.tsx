import React from 'react';

export default function RoommateCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 flex flex-col h-full animate-pulse text-left">
      {/* Header with Avatar and Basic Info */}
      <div className="flex flex-row items-start gap-4 mb-5">
        <div className="w-16 h-16 rounded-full bg-neutral-200 flex-shrink-0 border-4 border-[#F0F2F5]"></div>
        <div className="flex-1 min-w-0 pt-1">
          <div className="h-5 bg-neutral-200 rounded-md w-3/4 mb-2"></div>
          <div className="flex flex-col gap-1.5">
            <div className="h-3 bg-neutral-200 rounded-md w-5/6"></div>
            <div className="h-3 bg-neutral-200 rounded-md w-1/2"></div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="mb-5 flex-grow">
        <div className="h-4 bg-neutral-200 rounded-md w-full mb-2"></div>
        <div className="h-4 bg-neutral-200 rounded-md w-[90%] mb-2"></div>
        <div className="h-4 bg-neutral-200 rounded-md w-2/3"></div>
      </div>

      {/* Tags Section */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div 
            key={idx} 
            className="h-8 bg-neutral-200 rounded-full w-20"
          ></div>
        ))}
      </div>

      {/* Footer / Budget & Place */}
      <div className="pt-5 border-t border-neutral-100 flex flex-col gap-2 mb-6">
        <div className="h-3.5 bg-neutral-200 rounded-md w-1/2"></div>
        <div className="h-6 bg-neutral-200 rounded-md w-1/3"></div>
      </div>

      {/* Action Button */}
      <div className="w-full h-12 bg-neutral-200 rounded-2xl"></div>
    </div>
  );
}
