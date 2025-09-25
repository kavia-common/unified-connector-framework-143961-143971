'use client';

import React, { useEffect, useRef } from 'react';
import { oceanTheme, cx } from './theme';
import Button from './Button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showClose?: boolean;
  footer?: React.ReactNode;
}

/** PUBLIC_INTERFACE
 * Modal
 * Accessible modal dialog with overlay, keyboard/ESC close, and focus management.
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
  footer,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Basic focus trap: focus container on open
  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  const sizeClass =
    size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-desc' : undefined}
    >
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cx(
          'relative w-full mx-4',
          sizeClass,
          'bg-white rounded-xl shadow-2xl outline-none'
        )}
        style={{ boxShadow: oceanTheme.shadow.lg }}
      >
        {(title || showClose) && (
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: oceanTheme.colors.border }}>
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold" style={{ color: oceanTheme.colors.text }}>
                {title}
              </h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                aria-label="Close modal"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#6B7280" d="M18.3 5.71L12 12.01l-6.29-6.3L4.3 7.12 10.6 13.4l-6.3 6.29 1.42 1.42L12 14.83l6.29 6.29 1.42-1.41-6.3-6.29 6.3-6.29z"/>
                </svg>
              </button>
            )}
          </div>
        )}
        {description && (
          <div id="modal-desc" className="px-5 pt-3 text-sm text-gray-600">
            {description}
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
        <div className="px-5 py-3 border-t bg-gray-50/60 rounded-b-xl" style={{ borderColor: oceanTheme.colors.border }}>
          {footer ?? (
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button variant="primary" onClick={onClose}>OK</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
