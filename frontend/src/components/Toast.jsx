import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => {
          let Icon = CheckCircle2;
          let iconColor = 'text-success';
          if (toast.type === 'error') {
            Icon = AlertCircle;
            iconColor = 'text-danger';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            iconColor = 'text-warning';
          } else if (toast.type === 'info') {
            Icon = Info;
            iconColor = 'text-cyan';
          }

          return (
            <div key={toast.id} className={`toast-item toast-${toast.type} animate-fade-in`}>
              <Icon size={18} className={iconColor} />
              <span className="toast-message">{toast.message}</span>
              <button 
                onClick={() => removeToast(toast.id)} 
                className="toast-close"
                aria-label="Dismiss toast"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        .toast-container {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          z-index: 9999;
          pointer-events: none;
        }

        .toast-item {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          min-width: 280px;
          max-width: 420px;
          color: var(--text-primary);
          font-size: 0.85rem;
          backdrop-filter: blur(10px);
        }

        .toast-item.toast-success {
          border-left: 4px solid var(--color-success);
        }

        .toast-item.toast-error {
          border-left: 4px solid var(--color-danger);
        }

        .toast-item.toast-warning {
          border-left: 4px solid var(--color-warning);
        }

        .toast-item.toast-info {
          border-left: 4px solid var(--accent-cyan);
        }

        .toast-message {
          flex: 1;
          font-weight: 500;
        }

        .toast-close {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .toast-close:hover {
          color: var(--text-primary);
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
