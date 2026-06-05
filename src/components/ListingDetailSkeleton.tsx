import React from 'react';

export default function ListingDetailSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50 md:bg-white pb-32 animate-pulse">
       {/* Desktop Header Skeleton */}
       <div className="hidden md:block sticky top-0 z-50 bg-white/80 border-b border-gray-100">
        <div className="max-w-[2520px] mx-auto xl:px-12 md:px-12 sm:px-4 px-4 h-16 flex items-center justify-between">
            <div className="w-10 h-10 bg-neutral-200 rounded-full"></div>
            <div className="flex items-center gap-4"></div>
        </div>
      </div>

       {/* Mobile Header Image Skeleton */}
       <div className="md:hidden relative h-[55vh] w-full overflow-hidden bg-neutral-200"></div>

      <main className="max-w-[2520px] mx-auto xl:px-12 md:px-12 sm:px-4 px-0 pb-24 md:pb-12 relative md:static mt-0">
        <div className="px-4 sm:px-0">
          
          {/* Desktop Gallery Grid Skeleton */}
          <div className="hidden md:block relative group mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[300px] md:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-sm">
                <div className="md:col-span-2 md:row-span-2 relative overflow-hidden bg-neutral-200"></div>
                {Array.from({length: 4}).map((_, i) => (
                    <div key={i} className="hidden md:block relative overflow-hidden bg-neutral-200"></div>
                ))}
            </div>
          </div>

          {/* Desktop Title Bar Skeleton */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2 pt-4">
            <div className="h-8 md:h-10 bg-neutral-200 rounded w-3/4 md:w-1/2"></div>
            <div className="hidden md:flex items-center shrink-0">
               <div className="h-8 bg-neutral-200 rounded w-20"></div>
            </div>
          </div>

          {/* Content Section Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 pb-32">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center pb-8 border-b border-gray-100">
                <div className="w-full">
                  <div className="h-6 bg-neutral-200 rounded w-48 mb-2"></div>
                </div>
              </div>
              
              <div className="py-10 border-b border-gray-100">
                <div className="h-6 bg-neutral-200 rounded w-32 mb-6"></div>
                <div className="flex flex-col gap-3">
                   <div className="h-4 bg-neutral-200 rounded w-full"></div>
                   <div className="h-4 bg-neutral-200 rounded w-full"></div>
                   <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                </div>
              </div>

              {/* Highlights */}
              <div className="py-12 border-b border-gray-100">
                <div className="h-6 bg-neutral-200 rounded w-48 mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 mb-10">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="flex gap-4 items-center">
                      <div className="w-11 h-11 rounded-full bg-neutral-200 flex-shrink-0"></div>
                      <div className="h-4 bg-neutral-200 rounded w-32"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block relative mt-8 lg:mt-0 lg:col-span-1">
              <div className="sticky top-28 bg-white border border-neutral-200 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-8 bg-neutral-200 rounded w-24"></div>
                  <div className="h-4 bg-neutral-200 rounded w-16"></div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="h-12 bg-neutral-200 rounded-xl w-full"></div>
                  <div className="h-12 bg-neutral-200 rounded-xl w-full"></div>
                  <div className="h-12 bg-neutral-300 rounded-xl w-full mt-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
