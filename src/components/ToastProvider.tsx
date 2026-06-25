// @context: Toast notification context — global toast management
// @purpose: Provides showToast, notification list, and clear functionality app-wide via React context
// @behavior: Toast auto-dismiss after 3s; notifications persist until cleared; portal-based rendering
// @dependencies: Toast, NotificationDialog, createPortal, AnimatePresence

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastType } from './Toast';
import { NotificationDialog } from './NotificationDialog';
import { createPortal } from 'react-dom';

export interface NotificationItem {
  id: number;
  message: string;
  type: ToastType;
  timestamp: Date;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  notifications: NotificationItem[];
  clearNotifications: () => void;
  openNotifications: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<{ id: number; message: string; type: ToastType }[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setNotifications((prev) => [{ id, message, type, timestamp: new Date() }, ...prev]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, notifications, clearNotifications, openNotifications: () => setIsDialogOpen(true) }}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
            {toasts.map((toast) => (
              <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))} />
            ))}
        </div>,
        document.body
      )}
      {createPortal(
        <NotificationDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          notifications={notifications}
          onClear={clearNotifications}
        />,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
