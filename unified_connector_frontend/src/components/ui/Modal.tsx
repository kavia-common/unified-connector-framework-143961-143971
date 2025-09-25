'use client';

import React, { useEffect } from 'react';
import { theme, cx } from './theme';

type ModalSize = 'sm' | 'md' | 'lg';

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  size?: ModalSize;
  children?: React.ReactNode;
};

/**
 * PUBLIC_INTERFACE
 * Modal with overlay, ESC close, and footer slot using Ocean Professional theme.
 */
export const Modal: React.FC<ModalProps> = ({ open, onClose, title, description, footer, size = 'md', children }) => {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  if (!open) return null;

  const width = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={cx('relative w-full', width, 'rounded-xl bg-white shadow-lg border')}
        style={{ borderColor: theme.colors.border }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {(title || description) && (
          <div className="px-5 py-4 border-b" style={{ borderColor: theme.colors.border }}>
            {title && <h3 id="modal-title" className="text-base font-semibold text-gray-900">{title}</h3>}
            {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t bg-gray-50" style={{ borderColor: theme.colors.border }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
