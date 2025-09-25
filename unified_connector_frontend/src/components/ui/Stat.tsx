import React from 'react';
import { Card } from './Card';

type StatProps = {
  label: string;
  value: string | number;
  delta?: string;
  icon?: React.ReactNode;
  className?: string;
};

/**
 * PUBLIC_INTERFACE
 * Metric stat card used on dashboard.
 */
export const Stat: React.FC<StatProps> = ({ label, value, delta, icon, className = '' }) => {
  return (
    <Card className={className}>
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {icon}
          <span>{label}</span>
        </div>
      </div>
      <div className="px-5 pb-5">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-gray-900">{value}</span>
          {delta && <span className="text-xs text-emerald-600">{delta}</span>}
        </div>
      </div>
    </Card>
  );
};

export default Stat;
