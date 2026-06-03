import React from 'react';

export default function ListingDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="max-w-[2520px] mx-auto xl:px-32 md:px-12 sm:px-4 px-4 pt-4 md:pt-8 pb-32">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="h-8 bg-neutral-200 rounded w-1/2 md:w-1/3"></div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="h-4 bg-neutral-200 rounded w-24"></div>
            <div className="h-4 bg-neutral-200 rounded w-32"></div>
            <div className="hidden sm:block h-4 bg-neutral-200 rounded w-20"></div>
          </div>
        </div>

        {/* Hero Image Skeleton */}
        <div className="relative aspect-[4/3] md:aspect-[2/1] rounded-2xl overflow-hidden bg-neutral-200 mb-8"></div>

        {/* Content Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-16">
          {/* Main Info */}
          <div className="flex flex-col gap-8">
            <div className="flex items-start justify-between border-b border-neutral-200 pb-6">
              <div className="flex-1">
                <div className="h-6 bg-neutral-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-64"></div>
              </div>
              <div className="w-12 h-12 rounded-full bg-neutral-200 ml-4 flex-shrink-0"></div>
            </div>
            
            {/* Highlights */}
            <div className="flex flex-col gap-6 py-2 border-b border-neutral-200 pb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4">
                  <div className="w-6 h-6 rounded bg-neutral-200 flex-shrink-0"></div>
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="h-5 bg-neutral-200 rounded w-32"></div>
                    <div className="h-4 bg-neutral-200 rounded w-full max-w-[300px]"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block relative">
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
    </div>
  );
}
