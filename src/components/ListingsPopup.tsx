import React from 'react';
import { X } from 'lucide-react';
import { Listing } from '../types';
import { Modal } from './ui/Modal';
import ListingCard from './ListingCard';

interface ListingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  listings: Listing[];
  onListingClick: (id: string) => void;
}

export function ListingsPopup({ isOpen, onClose, title, listings, onListingClick }: ListingsPopupProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-5xl" className="h-[85vh] flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-neutral-100 shrink-0">
        <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500 hover:text-neutral-900"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-neutral-500 text-sm">No listings available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onClick={() => {
                  onListingClick(listing.id);
                  onClose();
                }}
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
