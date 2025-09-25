import React from 'react';
import { theme } from './theme';

type BadgeProps = {
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'neutral';
  className?: string;
};

/**
 * PUBLIC_INTERFACE
 * Small badge for status and meta labels with Ocean Professional palette.
 */
export const Badge: React.FC<BadgeProps> = ({ children, color = 'neutral', className = '' }) => {
  const map: Record<NonNullable<BadgeProps['color']>, string> = {
    primary: `bg-blue-50 text-blue-700 border-blue-200`,
    secondary: `bg-amber-50 text-amber-700 border-amber-200`,
    success: `bg-emerald-50 text-emerald-700 border-emerald-200`,
    error: `bg-red-50 text-red-700 border-red-200`,
    neutral: `bg-gray-50 text-gray-700 border-gray-200`,
  };
  return (
    <span
      className={['inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium', map[color], className].join(' ')}
      style={{ transition: theme.transition.base }}
    >
      {children}
    </span>
  );
};

export default Badge;
