import React from 'react';
import { oceanTheme, cx } from './theme';
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

/** PUBLIC_INTERFACE
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
        background: oceanTheme.colors.surface,
        borderRadius: oceanTheme.radius.lg,
        boxShadow: oceanTheme.shadow.md,
        border: `1px solid ${oceanTheme.colors.border}`,
      }}
    >
      {(title || actions) && (
        <div
          className={cx('px-5 py-4 flex items-start md:items-center justify-between gap-3', gradient && 'bg-gradient-to-br')}
          style={gradient ? { backgroundImage: 'linear-gradient(to bottom right, rgba(59,130,246,0.08), #ffffff)' } : {}}
        >
          <div>
            {title && <h3 className="text-base font-semibold" style={{ color: oceanTheme.colors.text }}>{title}</h3>}
            {subtitle && <p className="text-sm mt-0.5" style={{ color: oceanTheme.colors.subtleText }}>{subtitle}</p>}
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
      {footer && <div className="px-5 py-3 border-t" style={{ borderColor: oceanTheme.colors.border }}>{footer}</div>}
    </section>
  );
};

export default Card;
