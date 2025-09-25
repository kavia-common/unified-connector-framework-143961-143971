import React from 'react';
import Badge from './Badge';

/**
 * PUBLIC_INTERFACE
 * Section header with title, subtitle, and optional meta badge.
 */
export const SectionHeader: React.FC<{
  title: string;
  subtitle?: string;
  meta?: string;
  cta?: React.ReactNode;
}> = ({ title, subtitle, meta, cta }) => {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {meta && <Badge color="primary">{meta}</Badge>}
        </div>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {cta}
    </div>
  );
};

export default SectionHeader;
