import React from 'react';

const priorityConfig = {
  Urgent: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    indicator: '🔴',
    label: 'Urgent',
  },
  High: {
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    indicator: '🟠',
    label: 'High',
  },
  Medium: {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    indicator: '🟡',
    label: 'Medium',
  },
  Low: {
    bg: 'bg-slate-50 text-slate-600 border-slate-200',
    indicator: '⚪',
    label: 'Low',
  },
};

export const PriorityBadge = ({ priority, showIcon = false, size = 'sm' }) => {
  const config = priorityConfig[priority] || priorityConfig.Medium;
  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded border ${config.bg} ${
        isSmall ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      }`}
    >
      {showIcon && <span className="text-[10px]">{config.indicator}</span>}
      <span>{config.label}</span>
    </span>
  );
};

export default PriorityBadge;
