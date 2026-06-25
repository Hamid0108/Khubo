// @context: Properties modal — landlord's property overview
// @purpose: Shows property statistics with seeded random status/occupancy data for each listing
// @behavior: Uses seededRandom for deterministic pseudo-random values per listing ID
// @behavior: Shows listing status badge (Active/Review/Maintenance) and occupancy info
// @performance: useMemo ensures stats are computed only when listings change
// @dependencies: Listing type, lucide-react
// @known-issues: Uses Math.sin for seeded random (was previously Math.random during render)

import React, { useMemo } from 'react';

import { X, Star } from 'lucide-react';
import { Listing } from '../types';

interface PropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  listings: Listing[];
}

const sampleListings: Listing[] = [
  {
    id: 'sample-1',
    title: 'Sunset Boarding House',
    location: 'Santiago, Iligan City',
    description: 'A cozy boarding house with modern amenities.',
    price: 4500,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
    gallery: [],
    category: 'Boarding House',
    date: '2026-01-15',
    amenities: ['Wifi', 'Water', 'Electricity'],
    reviews: [],
  },
  {
    id: 'sample-2',
    title: 'City View Studio',
    location: 'Pala-o, Iligan City',
    description: 'Spacious studio apartment with city views.',
    price: 6000,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
    gallery: [],
    category: 'Studio',
    date: '2026-02-01',
    amenities: ['Wifi', 'AC', 'Parking'],
    reviews: [],
  },
  {
    id: 'sample-3',
    title: 'Student Dorm',
    location: 'Tibanga, Iligan City',
    description: 'Affordable dormitory near the university.',
    price: 2500,
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80&w=800',
    gallery: [],
    category: 'Dormitory',
    date: '2026-03-10',
    amenities: ['Wifi', 'Water'],
    reviews: [],
  },
  {
    id: 'sample-4',
    title: 'Riverside Apartment',
    location: 'Bulua, Iligan City',
    description: 'Peaceful apartment near the river.',
    price: 7500,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
    gallery: [],
    category: 'Apartment',
    date: '2026-04-05',
    amenities: ['Wifi', 'AC', 'Water', 'Parking'],
    reviews: [],
  },
];

const statuses = ['Active', 'Review', 'Maintenance'];

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export function PropertiesModal({ isOpen, onClose, listings }: PropertiesModalProps) {
  if (!isOpen) return null;

  const displayListings = listings.length === 0 ? sampleListings : listings;

  const propertyStats = useMemo(() =>
    displayListings.map((_, index) => {
      const occupied = Math.floor(seededRandom(index * 2) * 10);
      const total = occupied + Math.floor(seededRandom(index * 2 + 1) * 5) + 1;
      return { status: statuses[index % 3], occupied, total };
    }),
    [displayListings]
  );

  return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl h-[80vh] bg-white rounded-[2rem] overflow-hidden shadow-2xl z-10 flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-neutral-100 shrink-0">
              <h2 className="text-xl font-bold text-neutral-900">Properties</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500 hover:text-neutral-900"
              >
                <X size={20} />
              </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <div className="overflow-x-auto w-full p-1 h-full">
              <table className="w-full text-left border-collapse border-spacing-y-2">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/50">
                    <th className="p-4 pl-6 w-12 text-neutral-500 font-bold text-sm">
                      No.
                    </th>
                    <th className="p-4 text-neutral-500 font-bold text-sm">Property</th>
                    <th className="p-4 text-neutral-500 font-bold text-sm">Location</th>
                    <th className="p-4 text-neutral-500 font-bold text-sm">Category</th>
                    <th className="p-4 text-neutral-500 font-bold text-sm">Price</th>
                    <th className="p-4 text-neutral-500 font-bold text-sm">Rating</th>
                    <th className="p-4 text-neutral-500 font-bold text-sm">Status</th>
                    <th className="p-4 text-neutral-500 font-bold text-sm">Vacancy</th>
                  </tr>
                </thead>
                <tbody>
                  {displayListings.map((listing, index) => {
                    const { status, occupied, total } = propertyStats[index];

                    return (
                      <tr 
                        key={listing.id} 
                        className={`${index !== displayListings.length - 1 ? 'border-b border-neutral-50' : ''} hover:bg-neutral-50/50 transition-colors`}
                      >
                        <td className="p-4 pl-6 text-neutral-500 font-medium">
                          {index + 1}
                        </td>
                        <td className="p-4 font-bold text-[#0A2B4E] whitespace-nowrap">{listing.title}</td>
                        <td className="p-4 text-neutral-500 font-medium whitespace-nowrap">{listing.location}</td>
                        <td className="p-4 text-neutral-500 font-medium whitespace-nowrap">{listing.category}</td>
                        <td className="p-4 font-medium text-neutral-600 whitespace-nowrap">
                          ₱{listing.price.toLocaleString()}
                        </td>
                        <td className="p-4 font-medium whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-bold text-neutral-700">{listing.rating.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="p-4 font-medium whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            status === 'Active' ? 'bg-green-100 text-green-700' :
                            status === 'Review' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="p-4 font-medium whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            occupied === total ? 'bg-red-100 text-red-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {occupied}/{total}
                          </span>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  );
}
