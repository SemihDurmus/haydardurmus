import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
}

interface ConfirmContextValue {
  /** Promise-based replacement for window.confirm — resolves true on confirm. */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components -- context hook lives with its provider (same pattern as AuthContext)
export function useConfirm(): ConfirmContextValue {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>');
  return ctx;
}

interface PendingConfirm {
  options: ConfirmOptions;
  resolve: (result: boolean) => void;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setPending({ options, resolve })),
    [],
  );

  const settle = (result: boolean) => {
    pending?.resolve(result);
    setPending(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Modal
        isOpen={pending !== null}
        onClose={() => settle(false)}
        title={pending?.options.title}
        size="sm"
      >
        <p className="mb-6 text-body-sm text-text-secondary">{pending?.options.message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={() => settle(false)}>
            {pending?.options.cancelLabel}
          </Button>
          <Button variant="primary" size="sm" onClick={() => settle(true)}>
            {pending?.options.confirmLabel}
          </Button>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}
