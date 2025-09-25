'use client';

import React from 'react';
import { oceanTheme, cx } from './theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/** PUBLIC_INTERFACE
 * Button
 * A reusable, accessible button component styled with the Ocean Professional theme.
 * - Supports variants: primary, secondary, ghost, danger
 * - Sizes: sm, md, lg
 * - Loading and disabled states
 * - Optional left/right icons
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  fullWidth,
  leftIcon,
  rightIcon,
  ...rest
}) => {
  const base =
    'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
  const sizes: Record<ButtonSize, string> = {
    sm: 'text-sm px-3 py-1.5 rounded-md',
    md: 'text-sm px-4 py-2 rounded-lg',
    lg: 'text-base px-5 py-2.5 rounded-lg',
  };
  const variants: Record<ButtonVariant, string> = {
    primary: `text-white bg-[${oceanTheme.colors.primary}] hover:bg-[${oceanTheme.colors.primaryHover}] shadow ${oceanTheme.shadow.sm}`,
    secondary: `text-${'gray-900'} bg-[${oceanTheme.colors.secondary}] hover:bg-[${oceanTheme.colors.secondaryHover}]`,
    ghost: 'text-gray-700 bg-transparent hover:bg-gray-50 border border-gray-200',
    danger: `text-white bg-[${oceanTheme.colors.error}] hover:bg-red-600`,
  };

  const disabledStyles =
    'disabled:opacity-60 disabled:cursor-not-allowed disabled:saturate-75';

  const width = fullWidth ? 'w-full' : '';

  return (
    <button
      className={cx(base, sizes[size], variants[variant], disabledStyles, width, className)}
      aria-disabled={disabled || loading}
      {...rest}
      disabled={disabled || loading}
    >
      {(loading || leftIcon) && (
        <span className={cx('mr-2 inline-flex')}>
          {loading ? (
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          ) : (
            leftIcon
          )}
        </span>
      )}
      <span>{children}</span>
      {rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
    </button>
  );
};

export default Button;
