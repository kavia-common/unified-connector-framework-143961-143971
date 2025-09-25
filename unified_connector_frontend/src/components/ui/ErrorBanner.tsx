'use client';

import React from 'react';
import { oceanTheme, cx } from './theme';
import Button from './Button';

export interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}

/** PUBLIC_INTERFACE
 * ErrorBanner
 * Prominent error display bar with optional retry and dismiss actions.
 * Uses Ocean Professional error colors and soft background.
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
        background: oceanTheme.colors.errorBg,
        borderColor: oceanTheme.colors.error,
        boxShadow: oceanTheme.shadow.sm,
      }}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <svg width="20" height="20" viewBox="0 0 24 24" className="mt-0.5 shrink-0" aria-hidden="true">
          <path fill={oceanTheme.colors.error} d="M12 2L1 21h22L12 2zm1 15h-2v2h2v-2zm0-8h-2v6h2V9z"/>
        </svg>
        <div>
          <div className="text-sm font-semibold" style={{ color: oceanTheme.colors.text }}>
            {title}
          </div>
          <div className="text-sm mt-0.5" style={{ color: oceanTheme.colors.subtleText }}>
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
              <path fill={oceanTheme.colors.error} d="M18.3 5.71L12 12.01l-6.29-6.3L4.3 7.12 10.6 13.4l-6.3 6.29 1.42 1.42L12 14.83l6.29 6.29 1.42-1.41-6.3-6.29 6.3-6.29z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorBanner;
