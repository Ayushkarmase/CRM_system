import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { Mail, ChevronRight, Copy, Check, Filter, ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';

// Robust UTC Date parser for ISO strings lacking timezone designator
export const parseDate = (dateString) => {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  let str = String(dateString).trim();
  if (!str) return null;
  if (str.includes('T') && !str.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(str)) {
    str += 'Z';
  } else if (!str.includes('T') && !str.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(str)) {
    str = str.replace(' ', 'T') + 'Z';
  }
  const date = new Date(str);
  return isNaN(date.getTime()) ? null : date;
};

export const formatRelativeTime = (dateString) => {
  const date = parseDate(dateString);
  if (!date) return '';
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.max(1, Math.floor(diffInSeconds / 60))}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Format full date and time helper
export const formatDateTime = (dateString) => {
  const date = parseDate(dateString);
  if (!date) return '';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const TicketTable = ({
  tickets = [],
  statusFilter: propStatusFilter = 'All',
  priorityFilter: propPriorityFilter = 'All',
  onStatusChange,
  onPriorityChange,
}) => {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(propStatusFilter);
  const [selectedPriority, setSelectedPriority] = useState(propPriorityFilter);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = latest ticket number first
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);

  useEffect(() => {
    setSelectedStatus(propStatusFilter);
  }, [propStatusFilter]);

  useEffect(() => {
    setSelectedPriority(propPriorityFilter);
  }, [propPriorityFilter]);

  const handleCopy = (e, ticketId) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ticketId);
    setCopiedId(ticketId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (selectedStatus && selectedStatus.toLowerCase() !== 'all') {
      if (ticket.status?.toLowerCase() !== selectedStatus.toLowerCase()) return false;
    }
    if (selectedPriority && selectedPriority.toLowerCase() !== 'all') {
      if (ticket.priority?.toLowerCase() !== selectedPriority.toLowerCase()) return false;
    }
    return true;
  });

  const getTicketNum = (ticket) => {
    if (ticket.id != null) return Number(ticket.id);
    const match = String(ticket.ticket_id || '').match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const numA = getTicketNum(a);
    const numB = getTicketNum(b);
    return sortOrder === 'desc' ? numB - numA : numA - numB;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
              <th className="py-3 px-4">
                <button
                  type="button"
                  onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                  className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors uppercase font-semibold text-xs tracking-wider group cursor-pointer"
                  title={sortOrder === 'desc' ? 'Sorted: Latest First (Click to switch to Oldest First)' : 'Sorted: Oldest First (Click to switch to Latest First)'}
                >
                  <span>Ticket #</span>
                  {sortOrder === 'desc' ? (
                    <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  <span className="text-[10px] font-medium lowercase text-blue-700 bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 rounded ml-0.5">
                    {sortOrder === 'desc' ? 'latest first' : 'oldest first'}
                  </span>
                </button>
              </th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Subject</th>
              
              {/* Status Header with Filter Icon */}
              <th className="py-3 px-4 relative">
                <div
                  className="inline-flex items-center gap-1.5 cursor-pointer select-none group"
                  onClick={() => {
                    setIsStatusDropdownOpen(!isStatusDropdownOpen);
                    setIsPriorityDropdownOpen(false);
                  }}
                >
                  <span>Status</span>
                  <button
                    type="button"
                    className={`p-1 rounded transition-colors ${
                      selectedStatus !== 'All'
                        ? 'text-blue-600 bg-blue-100 font-bold'
                        : 'text-slate-400 group-hover:text-slate-700 hover:bg-slate-200'
                    }`}
                    title="Filter by: Open, In Progress, Closed"
                  >
                    <Filter className="w-3.5 h-3.5" />
                  </button>
                  {selectedStatus !== 'All' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                </div>

                {/* Filter Dropdown Popover */}
                {isStatusDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsStatusDropdownOpen(false)}
                    />
                    <div className="absolute left-3 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 font-normal normal-case text-xs">
                      <div className="px-3 py-1.5 font-bold text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">
                        Filter by Status
                      </div>
                      {['All', 'Open', 'In Progress', 'Closed'].map((st) => {
                        const isSelected = selectedStatus.toLowerCase() === st.toLowerCase();
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStatus(st);
                              setIsStatusDropdownOpen(false);
                              if (onStatusChange) onStatusChange(st);
                            }}
                            className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between transition-colors ${
                              isSelected ? 'font-bold text-blue-600 bg-blue-50/60' : 'text-slate-700'
                            }`}
                          >
                            <span>{st === 'All' ? 'All Statuses' : st}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </th>

              {/* Priority Header with Filter Icon */}
              <th className="py-3 px-4 relative">
                <div
                  className="inline-flex items-center gap-1.5 cursor-pointer select-none group"
                  onClick={() => {
                    setIsPriorityDropdownOpen(!isPriorityDropdownOpen);
                    setIsStatusDropdownOpen(false);
                  }}
                >
                  <span>Priority</span>
                  <button
                    type="button"
                    className={`p-1 rounded transition-colors ${
                      selectedPriority !== 'All'
                        ? 'text-blue-600 bg-blue-100 font-bold'
                        : 'text-slate-400 group-hover:text-slate-700 hover:bg-slate-200'
                    }`}
                    title="Filter by priority: Low, Medium, High, Urgent"
                  >
                    <Filter className="w-3.5 h-3.5" />
                  </button>
                  {selectedPriority !== 'All' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                </div>

                {/* Priority Filter Dropdown Popover */}
                {isPriorityDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsPriorityDropdownOpen(false)}
                    />
                    <div className="absolute left-3 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 font-normal normal-case text-xs">
                      <div className="px-3 py-1.5 font-bold text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">
                        Filter by Priority
                      </div>
                      {['All', 'Low', 'Medium', 'High', 'Urgent'].map((pr) => {
                        const isSelected = selectedPriority.toLowerCase() === pr.toLowerCase();
                        return (
                          <button
                            key={pr}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPriority(pr);
                              setIsPriorityDropdownOpen(false);
                              if (onPriorityChange) onPriorityChange(pr);
                            }}
                            className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between transition-colors ${
                              isSelected ? 'font-bold text-blue-600 bg-blue-50/60' : 'text-slate-700'
                            }`}
                          >
                            <span>{pr === 'All' ? 'All Priorities' : pr}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </th>

              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {sortedTickets.map((ticket) => (
              <tr
                key={ticket.ticket_id}
                onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                {/* Ticket ID */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 font-mono text-xs text-slate-900 font-semibold">
                    <span>{ticket.ticket_id}</span>
                    <button
                      onClick={(e) => handleCopy(e, ticket.ticket_id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 transition-opacity"
                      title="Copy Ticket ID"
                    >
                      {copiedId === ticket.ticket_id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </td>

                {/* Customer */}
                <td className="py-3.5 px-4 max-w-[180px] truncate">
                  <div className="text-slate-900 font-medium truncate">{ticket.customer_name}</div>
                  <div className="text-slate-500 text-xs flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3 shrink-0 text-slate-400" />
                    <span className="truncate">{ticket.customer_email}</span>
                  </div>
                </td>

                {/* Subject */}
                <td className="py-3.5 px-4 max-w-xs">
                  <div className="text-slate-900 font-medium truncate group-hover:text-blue-600 transition-colors">
                    {ticket.subject}
                  </div>
                  <div className="text-slate-500 text-xs truncate max-w-sm font-normal">
                    {ticket.description}
                  </div>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <StatusBadge status={ticket.status} />
                </td>

                {/* Priority */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <PriorityBadge priority={ticket.priority} showIcon />
                </td>

                {/* Timestamp */}
                <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-xs">
                  <span title={parseDate(ticket.created_at)?.toLocaleString() || ''}>
                    {formatDateTime(ticket.created_at)}
                  </span>
                </td>

                {/* Action Arrow */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all inline-block" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden divide-y divide-slate-100">
        {sortedTickets.map((ticket) => (
          <div
            key={ticket.ticket_id}
            onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}
            className="p-4 hover:bg-slate-50 transition-colors cursor-pointer space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                {ticket.ticket_id}
              </span>
              <div className="flex items-center gap-1.5">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-1">
                {ticket.subject}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{ticket.description}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-50">
              <span className="font-medium text-slate-700">{ticket.customer_name}</span>
              <span>{formatDateTime(ticket.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketTable;
