import React from 'react';
import { motion } from 'motion/react';

interface ListingCardSkeletonProps {
  key?: string | number;
  compact?: boolean;
}

export default function ListingCardSkeleton({ compact }: ListingCardSkeletonProps) {
  if (compact) {
    return (
      <div className="col-span-1 bg-white rounded-xl p-2 sm:p-2.5 shadow-sm border border-gray-100 flex flex-row gap-3 h-[96px] sm:h-[104px] animate-pulse">
        <div className="aspect-[4/3] h-full relative rounded-lg bg-neutral-200 flex-shrink-0"></div>
        <div className="flex-1 py-0.5 flex flex-col justify-between">
          <div>
            <div className="h-4 bg-neutral-200 rounded-md w-3/4 mb-1"></div>
            <div className="h-3 bg-neutral-200 rounded-md w-1/2"></div>
          </div>
          <div className="flex items-center justify-between mt-auto">
            <div className="h-4 bg-neutral-200 rounded-md w-12"></div>
            <div className="h-3 bg-neutral-200 rounded-md w-8"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-1 bg-white rounded-2xl p-2 sm:p-3 shadow-md border border-transparent group animate-pulse">
      <div className="flex flex-col gap-2.5 sm:gap-3 w-full">
        <div className="aspect-[4/3] relative rounded-xl bg-neutral-200"></div>
        <div className="px-1.5 sm:px-1 flex flex-col gap-1">
          <div className="h-5 bg-neutral-200 rounded-md w-4/5 mb-1"></div>
          <div className="flex items-center justify-between gap-1.5 mt-0.5">
            <div className="h-3 bg-neutral-200 rounded-md w-1/2"></div>
            <div className="h-4 bg-neutral-200 rounded-md w-12"></div>
          </div>
          <div className="flex items-center justify-between mt-1 sm:mt-1.5">
            <div className="h-5 bg-neutral-200 rounded-md w-16"></div>
            <div className="h-4 bg-neutral-200 rounded-md w-8"></div>
          </div>
          <div className="flex items-center justify-end mt-2 pt-2 border-t border-gray-50">
            <div className="flex gap-1.5">
              <div className="h-4 bg-neutral-200 rounded-md w-10"></div>
              <div className="h-4 bg-neutral-200 rounded-md w-10"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
