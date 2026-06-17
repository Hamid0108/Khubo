import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Megaphone } from 'lucide-react';

interface AnnouncementsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_ANNOUNCEMENTS = [
  {
    id: 1,
    title: "Welcome to Khubo!",
    message: "We are excited to have you on board. Start exploring properties today.",
    date: "2026-06-01",
    isNew: true
  },
  {
    id: 2,
    title: "New feature: Maps Search",
    message: "You can now search for properties and roommates directly on the map view.",
    date: "2026-05-28",
    isNew: false
  }
];

export function AnnouncementsOverlay({ isOpen, onClose }: AnnouncementsOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-6 border-b border-neutral-100 shrink-0">
              <h3 className="text-xl font-bold font-display flex items-center gap-2">
                <Megaphone size={24} className="text-black" />
                Announcements
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 bg-neutral-50">
              {MOCK_ANNOUNCEMENTS.map((announcement) => (
                <div key={announcement.id} className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm relative overflow-hidden">
                  {announcement.isNew && (
                    <div className="absolute top-0 right-0">
                       <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">New</span>
                    </div>
                  )}
                  <h4 className="text-base font-bold text-neutral-900 mb-1 pr-8">{announcement.title}</h4>
                  <p className="text-neutral-600 text-sm leading-relaxed mb-3">{announcement.message}</p>
                  <p className="text-xs text-neutral-400 font-medium">{new Date(announcement.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
