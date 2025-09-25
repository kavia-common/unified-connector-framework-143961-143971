import React from 'react';
import { oceanTheme, cx } from './theme';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'neutral';
  label?: string;
  className?: string;
}

/** PUBLIC_INTERFACE
 * Spinner
 * An accessible loading spinner with Ocean theme colors and sizes.
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  label = 'Loading...',
  className,
}) => {
  const sizeMap = { xs: 12, sm: 16, md: 20, lg: 28 };
  const dim = sizeMap[size];

  const colorClass =
    color === 'secondary'
      ? oceanTheme.colors.secondary
      : color === 'neutral'
      ? '#6B7280'
      : oceanTheme.colors.primary;

  return (
    <div className={cx('inline-flex items-center', className)} role="status" aria-live="polite" aria-busy="true">
      <svg
        className="animate-spin"
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="4" fill="none" />
        <path d="M4 12a8 8 0 018-8" stroke={colorClass} strokeWidth="4" strokeLinecap="round" />
      </svg>
      {label && <span className="ml-2 text-sm text-gray-600">{label}</span>}
    </div>
  );
};

export default Spinner;
