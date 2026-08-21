import React from 'react';

export const SkeletonRow = () => (
  <div className="flex items-center justify-between p-4 border-b border-slate-100 animate-pulse">
    <div className="flex items-center gap-4 flex-1">
      <div className="h-4 w-16 bg-slate-200 rounded" />
      <div className="space-y-2 flex-1 max-w-sm">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="h-6 w-20 bg-slate-200 rounded-full" />
      <div className="h-6 w-16 bg-slate-100 rounded" />
    </div>
  </div>
);

export const SkeletonCard = () => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm animate-pulse space-y-3">
    <div className="flex justify-between items-center">
      <div className="h-4 w-14 bg-slate-200 rounded" />
      <div className="h-5 w-20 bg-slate-200 rounded-full" />
    </div>
    <div className="h-5 bg-slate-200 rounded w-4/5" />
    <div className="h-4 bg-slate-100 rounded w-1/2" />
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden shadow-sm">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonRow key={i} />
    ))}
  </div>
);

export default SkeletonTable;
