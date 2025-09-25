'use client';

import React from 'react';
import { theme, cx } from './theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * PUBLIC_INTERFACE
 * Premium button with Ocean Professional styling and smooth transitions.
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
    'inline-flex items-center justify-center font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
  const sizes: Record<ButtonSize, string> = {
    sm: 'text-xs px-3 py-1.5 rounded-md',
    md: 'text-sm px-4 py-2 rounded-lg',
    lg: 'text-sm px-5 py-2.5 rounded-lg',
  };
  const variants: Record<ButtonVariant, string> = {
    primary: `text-white shadow ${className || ''}`,
    secondary: `text-white shadow ${className || ''}`,
    ghost: `text-gray-700 bg-transparent hover:bg-gray-100 focus-visible:ring-gray-300 ${className || ''}`,
    danger: `text-white bg-red-500 hover:bg-red-600 focus-visible:ring-red-300 ${className || ''}`,
    outline: `text-[${theme.colors.primary}] border border-[${theme.colors.border}] bg-white hover:bg-blue-50/50 focus-visible:ring-blue-300 ${className || ''}`,
  };

  const styleByVariant: React.CSSProperties =
    variant === 'primary'
      ? { backgroundColor: theme.colors.primary }
      : variant === 'secondary'
      ? { backgroundColor: theme.colors.secondary }
      : {};

  const hoverStyle: React.CSSProperties =
    variant === 'primary'
      ? { transition: theme.transition.base }
      : variant === 'secondary'
      ? { transition: theme.transition.base }
      : {};

  const disabledStyles = 'disabled:opacity-60 disabled:cursor-not-allowed disabled:saturate-75';
  const width = fullWidth ? 'w-full' : '';

  return (
    <button
      className={cx(base, sizes[size], variants[variant], disabledStyles, width)}
      style={{
        ...styleByVariant,
        borderRadius: theme.radius.lg,
        ...hoverStyle,
      }}
      aria-disabled={disabled || loading}
      disabled={disabled || loading}
      {...rest}
    >
      {(loading || leftIcon) && (
        <span className="mr-2 inline-flex">
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
