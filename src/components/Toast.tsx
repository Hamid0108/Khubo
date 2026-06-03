import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border ${
        type === 'success' ? 'bg-white border-green-100 text-green-800' : 'bg-white border-blue-100 text-blue-800'
      }`}
    >
      {type === 'success' ? <CheckCircle size={20} className="text-green-500" /> : <Info size={20} className="text-blue-500" />}
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-full">
        <X size={16} />
      </button>
    </motion.div>
  );
};
