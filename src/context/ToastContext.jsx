// src/context/ToastContext.jsx

import React, { createContext, useState, useCallback } from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast],
  );

  const showSuccess = useCallback(
    (msg, duration) => addToast(msg, "success", duration),
    [addToast],
  );
  const showError = useCallback(
    (msg, duration) => addToast(msg, "error", duration),
    [addToast],
  );
  const showWarning = useCallback(
    (msg, duration) => addToast(msg, "warning", duration),
    [addToast],
  );
  const showInfo = useCallback(
    (msg, duration) => addToast(msg, "info", duration),
    [addToast],
  );

  return (
    <ToastContext.Provider
      value={{
        addToast,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}

      {/* Toast Notification Container Stack */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed top-0 left-0 right-0 z-60 flex flex-col items-center sm:items-end justify-start sm:justify-end space-y-2 p-3 sm:p-6 sm:top-auto sm:left-auto sm:bottom-0"
      >
        {toasts.map((toast) => {
          let Icon = Info;
          let borderStyle = "border-blue-200 dark:border-blue-800/50";
          let bgStyle = "bg-blue-50/95 dark:bg-blue-950/95";
          let iconColor = "text-blue-500 dark:text-blue-400";
          let textColor = "text-blue-900 dark:text-blue-100";

          if (toast.type === "success") {
            Icon = CheckCircle2;
            borderStyle = "border-emerald-200 dark:border-emerald-800/50";
            bgStyle = "bg-emerald-50/95 dark:bg-emerald-950/95";
            iconColor = "text-emerald-500 dark:text-emerald-400";
            textColor = "text-emerald-900 dark:text-emerald-100";
          } else if (toast.type === "error") {
            Icon = AlertCircle;
            borderStyle = "border-rose-200 dark:border-rose-800/50";
            bgStyle = "bg-rose-50/95 dark:bg-rose-950/95";
            iconColor = "text-rose-500 dark:text-rose-400";
            textColor = "text-rose-900 dark:text-rose-100";
          } else if (toast.type === "warning") {
            Icon = AlertTriangle;
            borderStyle = "border-amber-200 dark:border-amber-800/50";
            bgStyle = "bg-amber-50/95 dark:bg-amber-950/95";
            iconColor = "text-amber-500 dark:text-amber-400";
            textColor = "text-amber-900 dark:text-amber-100";
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex w-full max-w-sm items-center justify-between rounded-xl border ${borderStyle} ${bgStyle} p-3.5 sm:p-4 shadow-xl backdrop-blur-md transition-all duration-300 ease-in-out`}
              role="alert"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <Icon className={`h-5 w-5 shrink-0 ${iconColor}`} />
                <p
                  className={`text-xs sm:text-sm font-medium leading-snug ${textColor} wrap-break-word`}
                >
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className={`ml-3 shrink-0 rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/20 transition touch-manipulation min-w-9 min-h-9 flex items-center justify-center ${textColor}`}
                aria-label="Close notification"
              >
                <X className="h-4 w-4 shrink-0" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
