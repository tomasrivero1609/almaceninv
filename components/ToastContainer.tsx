"use client";

import { Toast } from './Toast';
import ToastComponent from './Toast';

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-20 right-4 z-50 flex flex-col items-end"
      role="region"
      aria-label="Notificaciones"
    >
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onClose={() => onClose(toast.id)} />
      ))}
    </div>
  );
}

