// @context: Toast notification component — individual toast message
// @purpose: Renders a single toast with type-specific icon, message, and close button
// @behavior: Icon and colors depend on toast type (success/info/error/warning); close button calls onClose
// @performance: Stateless display component — no re-render concerns
// @dependencies: motion, lucide-react
// @code-template: Pattern for type-specific UI config maps (icon, bg, textColor per type)

import React from 'react';
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'error' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const config: Record<ToastType, { icon: typeof CheckCircle; bg: string; iconColor: string; textColor: string }> = {
  success: { icon: CheckCircle, bg: 'bg-white border-green-100', iconColor: 'text-green-500', textColor: 'text-green-800' },
  info: { icon: Info, bg: 'bg-white border-blue-100', iconColor: 'text-blue-500', textColor: 'text-blue-800' },
  warning: { icon: AlertTriangle, bg: 'bg-white border-amber-100', iconColor: 'text-amber-500', textColor: 'text-amber-800' },
  error: { icon: XCircle, bg: 'bg-white border-red-100', iconColor: 'text-red-500', textColor: 'text-red-800' },
};

export const Toast = ({ message, type, onClose }: ToastProps) => {
  const { icon: Icon, bg, iconColor, textColor } = config[type];
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border ${bg} ${textColor}`}
    >
      <Icon size={20} className={iconColor} />
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-full ml-auto">
        <X size={16} />
      </button>
    </div>
  );
};
