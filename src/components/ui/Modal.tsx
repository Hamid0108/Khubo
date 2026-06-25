// @context: Generic modal wrapper — animated overlay dialog
// @purpose: Reusable modal with backdrop, animated entrance, focus trap, and configurable width
// @behavior: Uses AnimatePresence for mount/unmount animation; focus trap on open; backdrop click to close
// @dependencies: motion, useFocusTrap, lib/animations (modalBackdrop, modalContent)

import { useFocusTrap } from '../../hooks/useFocusTrap';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export function Modal({ isOpen, onClose, children, maxWidth = 'max-w-lg', className = '' }: ModalProps) {
  const focusTrapRef = useFocusTrap(isOpen);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Modal dialog"
    >
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div
        ref={focusTrapRef}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${maxWidth} bg-white rounded-[2rem] overflow-hidden shadow-2xl z-10 ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
