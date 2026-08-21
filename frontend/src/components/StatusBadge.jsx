import React from 'react';

const statusConfig = {
  Open: {
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    label: 'Open',
  },
  'In Progress': {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-600',
    label: 'In Progress',
  },
  Closed: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Closed',
  },
};

export const StatusBadge = ({ status, size = 'sm' }) => {
  const config = statusConfig[status] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    label: status || 'Unknown',
  };

  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${config.bg} ${
        isSmall ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      }`}
    >
      <span className={`rounded-full shrink-0 ${config.dot} ${isSmall ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
