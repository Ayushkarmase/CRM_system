import React from 'react';
import { Ticket, SearchX, AlertTriangle, Plus } from 'lucide-react';

export const EmptyState = ({
  type = 'no-tickets',
  title,
  description,
  actionText,
  onAction,
}) => {
  const defaults = {
    'no-tickets': {
      icon: Ticket,
      title: 'No tickets yet',
      description: 'Create your first support ticket to start managing customer requests.',
      actionText: '+ New Ticket',
    },
    'no-results': {
      icon: SearchX,
      title: 'No tickets found',
      description: 'Try changing your search keywords or resetting your status filter.',
      actionText: 'Reset Filters',
    },
    error: {
      icon: AlertTriangle,
      title: 'Unable to load tickets',
      description: 'Please check your backend connection and try again.',
      actionText: 'Retry Connection',
    },
  };

  const current = defaults[type] || defaults['no-tickets'];
  const Icon = current.icon;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm my-6">
      <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1.5">{title || current.title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">{description || current.description}</p>

      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm py-2 px-4 rounded-lg shadow-sm transition-all active:scale-95"
        >
          {type === 'no-tickets' && <Plus className="w-4 h-4" />}
          <span>{actionText || current.actionText}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
