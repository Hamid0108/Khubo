// @context: Stat card detail modal — separated from Profile.tsx
// @purpose: Generic overlay for stat card detail views (Saved, Reservation, Roommate, Invitation)
// @behavior: Shows title and placeholder content; currently empty/detailed view placeholder
// @dependencies: motion, lucide-react
// @known-issues: Content is a placeholder — no real data shown yet


import { X, ArrowUpRight } from 'lucide-react';

interface Props {
  title: string | null;
  onClose: () => void;
}

export default function StatCardModal({ title, onClose }: Props) {
  if (!title) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div
        className="relative w-full max-w-5xl h-[80vh] bg-white rounded-[2rem] overflow-hidden shadow-2xl z-10 flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 shrink-0">
          <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500 hover:text-neutral-900"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 space-y-4">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
              <ArrowUpRight className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-lg">
              Detailed view for <strong>{title}</strong> is currently empty.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
