import React, { useState } from 'react';
import { X, Star, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Listing } from '../types';

interface ListingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
}

const statuses = ['Active', 'Review', 'Maintenance'];

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export function ListingDetailModal({ isOpen, onClose, listing }: ListingDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen) return null;

  const fallbackImages = [
    'https://images.unsplash.com/photo-1555819485-99aaa4aee26b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
  ];

  let images = listing.gallery?.length > 0 ? listing.gallery : [listing.image];
  if (images.length < 4) {
    images = [...images, ...fallbackImages.slice(0, 4 - images.length)];
  }

  const status = statuses[Math.abs(listing.id.charCodeAt(0)) % 3];

  const prevImage = () => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const nextImage = () => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl h-[85vh] bg-white rounded-[2rem] overflow-hidden shadow-2xl z-10 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 shrink-0">
          <h2 className="text-xl font-bold text-neutral-900 truncate pr-4">{listing.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500 hover:text-neutral-900 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Image Gallery */}
          <div className="relative w-full h-[280px] md:h-[360px] bg-neutral-100 shrink-0">
            <img
              src={images[currentImageIndex]}
              alt={listing.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition active:scale-90"
                >
                  <ChevronLeft size={20} className="text-neutral-900" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition active:scale-90"
                >
                  <ChevronRight size={20} className="text-neutral-900" />
                </button>
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Details */}
          <div className="p-6 space-y-6">
            {/* Title & Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-2xl font-bold text-[#0A2B4E]">{listing.title}</h3>
              <span className={`self-start px-3 py-1 rounded-full text-xs font-bold ${
                status === 'Active' ? 'bg-green-100 text-green-700' :
                status === 'Review' ? 'bg-blue-100 text-blue-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {status}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-neutral-500">
              <MapPin size={18} className="shrink-0" />
              <span className="font-medium">{listing.location}</span>
            </div>

            {/* Price & Rating Row */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#17294F]">₱{listing.price.toLocaleString()}</span>
                <span className="text-sm font-medium text-neutral-500">/month</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 rounded-full border border-neutral-100">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-bold text-neutral-800">{listing.rating.toFixed(1)}</span>
                <span className="text-sm text-neutral-400">({listing.reviews.length} reviews)</span>
              </div>
            </div>

            {/* Category & Availability */}
            <div className="flex flex-wrap gap-3">
              <div className="px-4 py-2 bg-neutral-50 rounded-xl border border-neutral-100">
                <span className="text-[11px] font-black text-neutral-400 uppercase tracking-widest block mb-0.5">Category</span>
                <span className="text-sm font-bold text-neutral-800">{listing.category}</span>
              </div>
              <div className="px-4 py-2 bg-neutral-50 rounded-xl border border-neutral-100">
                <span className="text-[11px] font-black text-neutral-400 uppercase tracking-widest block mb-0.5">Availability</span>
                <span className="text-sm font-bold text-neutral-800">{listing.date}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-2">Description</h4>
              <p className="text-neutral-700 leading-relaxed">{listing.description}</p>
            </div>

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div>
                <h4 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-3">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-neutral-50 border border-neutral-100 rounded-full text-sm font-bold text-neutral-700"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Preview */}
            {listing.reviews.length > 0 && (
              <div>
                <h4 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-3">Recent Reviews</h4>
                <div className="space-y-3">
                  {listing.reviews.slice(0, 3).map((review, idx) => (
                    <div key={idx} className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={review.userImage}
                          alt={review.userName}
                          className="w-8 h-8 rounded-full object-cover bg-neutral-200"
                        />
                        <div>
                          <span className="text-sm font-bold text-neutral-900">{review.userName}</span>
                          <div className="flex items-center gap-1">
                            <Star size={10} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-bold text-neutral-600">{review.rating}</span>
                          </div>
                        </div>
                        <span className="text-xs text-neutral-400 ml-auto">{review.date}</span>
                      </div>
                      <p className="text-sm text-neutral-600 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
