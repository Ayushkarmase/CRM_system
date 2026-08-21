import React from 'react';
import { Filter } from 'lucide-react';

export const FilterBar = ({
  status = 'All',
  onStatusChange,
  priority = 'All',
  onPriorityChange,
  counts = {},
}) => {
  const statusOptions = [
    { key: 'All', label: 'All', count: counts.total },
    { key: 'Open', label: 'Open', count: counts.open },
    { key: 'In Progress', label: 'In Progress', count: counts.in_progress },
    { key: 'Closed', label: 'Closed', count: counts.closed },
  ];

  const priorityOptions = ['All', 'Low', 'Medium', 'High', 'Urgent'];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
      {/* Status Tab Pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {statusOptions.map((opt) => {
          const isSelected = status.toLowerCase() === opt.key.toLowerCase();
          return (
            <button
              key={opt.key}
              onClick={() => onStatusChange(opt.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{opt.label}</span>
              {opt.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${
                    isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {opt.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Priority Dropdown */}
      <div className="flex items-center gap-2 px-2 shrink-0">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">Priority:</span>
        <select
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs sm:text-sm rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
        >
          <option value="All">All Priorities</option>
          {priorityOptions.slice(1).map((p) => (
            <option key={p} value={p}>
              {p} Priority
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
