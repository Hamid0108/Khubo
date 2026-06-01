import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoCarouselOverlayProps {
  isOpen: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export const PhotoCarouselOverlay: React.FC<PhotoCarouselOverlayProps> = ({
  isOpen,
  images,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Sync currentIndex with initialIndex when gallery opens
  React.useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/0 backdrop-blur-sm flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-2 text-white z-20">
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full transition text-sm"
          >
            <X size={18} />
            <span className="font-medium hidden sm:block">Close</span>
          </button>
          
          <div className="text-xs font-bold tracking-widest bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>

          <div className="w-[60px]" /> {/* Spacer for balance */}
        </div>

        {/* Main Content */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          {/* Controls */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 sm:left-10 z-10 w-14 h-14 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-95 shadow-lg"
                aria-label="Previous image"
              >
                <ChevronLeft size={28} />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-4 sm:right-10 z-10 w-14 h-14 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-95 shadow-lg"
                aria-label="Next image"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          {/* Image Container */}
          <div className="flex-1 flex items-center justify-center p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="shadow-2xl rounded-[2.5rem] overflow-hidden"
              >
                <img
                  src={images[currentIndex]}
                  alt={`Image ${currentIndex + 1}`}
                  className="max-w-[90vw] max-h-[75vh] w-auto h-auto object-contain pointer-events-none select-none"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer / Thumbnail strip */}
        <div className="py-2 bg-gradient-to-t from-black/40 to-transparent flex justify-center z-20">
           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-16 h-12 rounded-md overflow-hidden border-2 transition-all flex-shrink-0 ${
                    idx === currentIndex ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                </button>
              ))}
           </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
