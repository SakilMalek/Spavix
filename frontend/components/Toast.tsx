import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose?: () => void;
}

const Toast = ({ message, type, duration = 4000, onClose }: ToastProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration === 0) return;

    const timer = setTimeout(() => {
      setIsExiting(true);
      if (onClose) {
        setTimeout(onClose, 300);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle style={{ width: '1.25rem', height: '1.25rem' }} />;
      case 'error':
        return <AlertCircle style={{ width: '1.25rem', height: '1.25rem' }} />;
      case 'warning':
        return <AlertTriangle style={{ width: '1.25rem', height: '1.25rem' }} />;
      default:
        return <Info style={{ width: '1.25rem', height: '1.25rem' }} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return { bg: '#dcfce7', border: '#86efac', text: '#166534', icon: '#16a34a' };
      case 'error':
        return { bg: '#fee2e2', border: '#fca5a5', text: '#7f1d1d', icon: '#dc2626' };
      case 'warning':
        return { bg: '#fef3c7', border: '#fcd34d', text: '#78350f', icon: '#f59e0b' };
      default:
        return { bg: '#dbeafe', border: '#93c5fd', text: '#1e3a8a', icon: '#3b82f6' };
    }
  };

  const colors = getColors();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem 1.25rem',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.5rem',
        color: colors.text,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        animation: isExiting ? 'slideOut 0.3s ease-out' : 'slideIn 0.3s ease-out',
        minWidth: '300px',
        maxWidth: '500px',
      }}
    >
      <div style={{ color: colors.icon }}>{getIcon()}</div>
      <p style={{ flex: 1, margin: 0, fontSize: '0.95rem', fontWeight: '500' }}>{message}</p>
      <button
        onClick={() => {
          setIsExiting(true);
          if (onClose) {
            setTimeout(onClose, 300);
          }
        }}
        style={{
          background: 'none',
          border: 'none',
          color: colors.text,
          cursor: 'pointer',
          padding: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.7,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.7';
        }}
      >
        <X style={{ width: '1rem', height: '1rem' }} />
      </button>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleAddToast = (event: CustomEvent) => {
      const { message, type, duration } = event.detail;
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    };

    window.addEventListener('addToast', handleAddToast as EventListener);
    return () => window.removeEventListener('addToast', handleAddToast as EventListener);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export const showToast = (message: string, type: ToastType = 'info', duration?: number) => {
  const event = new CustomEvent('addToast', {
    detail: { message, type, duration },
  });
  window.dispatchEvent(event);
};
