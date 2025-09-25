'use client';

import React from 'react';
import { theme, cx } from './theme';
import Button from './Button';

export interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}

/**
 * PUBLIC_INTERFACE
 * Error banner with improved contrast and icon treatment.
 */
export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  onDismiss,
  compact = false,
}) => {
  return (
    <div
      className={cx(
        'w-full border',
        'flex items-start md:items-center justify-between gap-3',
        compact ? 'px-3 py-2 rounded-md' : 'px-4 py-3 rounded-lg',
      )}
      style={{
        background: 'rgba(239, 68, 68, 0.08)',
        borderColor: theme.colors.error,
        boxShadow: theme.shadow.sm,
      }}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full"
          style={{ background: '#FEE2E2', color: theme.colors.error }}
          aria-hidden
        >
          !
        </span>
        <div>
          <div className="text-sm font-semibold" style={{ color: theme.colors.text }}>
            {title}
          </div>
          <div className="text-sm mt-0.5" style={{ color: theme.colors.textMuted }}>
            {message}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onRetry && (
          <Button size="sm" variant="primary" onClick={onRetry}>
            Retry
          </Button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 rounded-md hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
            aria-label="Dismiss"
            title="Dismiss"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill={theme.colors.error} d="M18.3 5.71L12 12.01l-6.29-6.3L4.3 7.12 10.6 13.4l-6.3 6.29 1.42 1.42L12 14.83l6.29 6.29 1.42-1.41-6.3-6.29 6.3-6.29z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorBanner;
