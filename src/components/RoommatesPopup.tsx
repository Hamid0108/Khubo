import React from 'react';
import { X } from 'lucide-react';
import { Roommate } from '../types';
import { Modal } from './ui/Modal';
import RoommateCard from './RoommateCard';

interface RoommatesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  roommates: Roommate[];
  onProfileClick: (roommate: Roommate) => void;
  actionLabel?: string;
}

export function RoommatesPopup({ isOpen, onClose, title, roommates, onProfileClick, actionLabel }: RoommatesPopupProps) {
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
        {roommates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-neutral-500 text-sm">No roommates available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {roommates.map((roommate) => (
              <RoommateCard
                key={roommate.id}
                roommate={roommate}
                onProfileClick={(r) => {
                  onProfileClick(r);
                  onClose();
                }}
                actionLabel={actionLabel}
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
