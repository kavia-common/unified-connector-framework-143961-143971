'use client';

import React from 'react';
import { theme, cx } from './theme';
import Spinner from './Spinner';

export interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  gradient?: boolean;
  children?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

/**
 * PUBLIC_INTERFACE
 * Card
 * A surface container with rounded corners, subtle shadows and optional gradient header.
 */
export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  actions,
  footer,
  gradient = false,
  children,
  loading = false,
  className,
}) => {
  return (
    <section
      className={cx('w-full overflow-hidden', className)}
      style={{
        background: theme.colors.surface,
        borderRadius: theme.radius.lg,
        boxShadow: theme.shadow.md,
        border: `1px solid ${theme.colors.border}`,
        transition: theme.transition.slow,
      }}
    >
      {(title || actions) && (
        <div
          className={cx('px-5 py-4 flex items-start md:items-center justify-between gap-3', gradient && 'bg-gradient-to-br')}
          style={
            gradient
              ? { backgroundImage: `linear-gradient(to bottom right, ${theme.colors.gradientFrom}, ${theme.colors.surface})` }
              : {}
          }
        >
          <div>
            {title && <h3 className="text-base font-semibold" style={{ color: theme.colors.text }}>{title}</h3>}
            {subtitle && <p className="text-sm mt-0.5" style={{ color: theme.colors.textMuted }}>{subtitle}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      <div className="px-5 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner label="Loading content..." />
          </div>
        ) : (
          children
        )}
      </div>
      {footer && <div className="px-5 py-3 border-t" style={{ borderColor: theme.colors.border }}>{footer}</div>}
    </section>
  );
};

export default Card;
