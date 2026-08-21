import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ticketApi } from '../services/api';
import TicketTable from '../components/TicketTable';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import { SkeletonTable } from '../components/Skeleton';
import { Plus, RefreshCw } from 'lucide-react';

export const Tickets = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, in_progress: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state initialized from URL params or defaults
  const statusFilter = searchParams.get('status') || 'All';
  const priorityFilter = searchParams.get('priority') || 'All';
  const searchQuery = searchParams.get('search') || '';

  const fetchTicketsAndStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [ticketsData, statsData] = await Promise.all([
        ticketApi.getTickets({
          status: statusFilter,
          priority: priorityFilter,
          search: searchQuery,
        }),
        ticketApi.getStats(),
      ]);
      setTickets(ticketsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Unable to load tickets. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, searchQuery]);

  useEffect(() => {
    fetchTicketsAndStats();
  }, [fetchTicketsAndStats]);

  // Update URL search parameters helper
  const updateParam = (key, value) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (!value || value === 'All') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
      return newParams;
    });
  };

  const handleStatusChange = (newStatus) => updateParam('status', newStatus);
  const handlePriorityChange = (newPriority) => updateParam('priority', newPriority);
  const handleSearchChange = (newSearch) => updateParam('search', newSearch);
  const handleClearSearch = () => updateParam('search', '');

  const resetAllFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Tickets</h1>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">
            Manage and track customer support requests.
          </p>
        </div>
        <Link
          to="/tickets/new"
          className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-2.5 px-4 rounded-lg shadow-sm transition-all active:scale-[0.99] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Ticket</span>
        </Link>
      </div>

      {/* Toolbar: Search + Refresh */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={handleClearSearch}
          placeholder="Search tickets by customer, email, ID or issue..."
        />
        <button
          onClick={fetchTicketsAndStats}
          className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg shadow-sm hover:bg-slate-50 transition-colors self-end sm:self-auto"
          title="Refresh Ticket List"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Status & Priority Filter Bar */}
      <FilterBar
        status={statusFilter}
        onStatusChange={handleStatusChange}
        priority={priorityFilter}
        onPriorityChange={handlePriorityChange}
        counts={stats}
      />

      {/* Error state */}
      {error && (
        <EmptyState
          type="error"
          title="Unable to load tickets"
          description={error}
          onAction={fetchTicketsAndStats}
        />
      )}

      {/* Content View */}
      {!error && (
        <>
          {loading ? (
            <SkeletonTable rows={8} />
          ) : tickets.length > 0 ? (
            <TicketTable tickets={tickets} />
          ) : searchQuery || statusFilter !== 'All' || priorityFilter !== 'All' ? (
            <EmptyState
              type="no-results"
              title="No tickets found"
              description="No support requests match your search or filter criteria."
              actionText="Reset Filters"
              onAction={resetAllFilters}
            />
          ) : (
            <EmptyState
              type="no-tickets"
              title="No tickets yet"
              description="Create your first support ticket to start managing customer requests."
              actionText="+ New Ticket"
              onAction={() => (window.location.href = '/tickets/new')}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Tickets;
