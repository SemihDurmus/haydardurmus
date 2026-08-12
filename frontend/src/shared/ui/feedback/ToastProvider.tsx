import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';

const TOAST_DURATION_MS = 4000;

type ToastVariant = 'success' | 'error';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  /** Show a transient notification (bottom-right, auto-dismissed). */
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components -- context hook lives with its provider (same pattern as AuthContext)
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, variant: ToastVariant = 'success') => {
    idRef.current += 1;
    const id = idRef.current;
    setToasts((ts) => [...ts, { id, message, variant }]);
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), TOAST_DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-4 right-4 z-[1400] flex w-72 flex-col gap-2"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              role="status"
              className={`border px-4 py-3 text-body-sm shadow-md ${
                toast.variant === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-border bg-white text-text-primary'
              }`}
            >
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
