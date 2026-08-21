import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ticketApi } from '../services/api';
import TicketTable from '../components/TicketTable';
import SearchBar from '../components/SearchBar';
import { SkeletonTable } from '../components/Skeleton';
import { Ticket, Clock, CheckCircle, AlertCircle, Plus, ArrowRight, Search, X } from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, open: 0, in_progress: 0, closed: 0 });
  const [recentTickets, setRecentTickets] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [statsData, ticketsData] = await Promise.all([
          ticketApi.getStats(),
          ticketApi.getTickets({ limit: 6 }),
        ]);
        setStats(statsData);
        setRecentTickets(ticketsData.slice(0, 6));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Unable to load queue statistics. Please check your API connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle quick search on Dashboard
  const handleSearchChange = useCallback(async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults(null);
      setSearching(false);
      return;
    }

    try {
      setSearching(true);
      const results = await ticketApi.getTickets({ search: query.trim() });
      setSearchResults(results);
    } catch (err) {
      console.error('Search error on dashboard:', err);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  const statCards = [
    {
      title: 'Total Tickets',
      value: stats.total,
      icon: Ticket,
      bg: 'bg-slate-100 text-slate-700',
    },
    {
      title: 'Open',
      value: stats.open,
      icon: AlertCircle,
      bg: 'bg-amber-100 text-amber-800',
    },
    {
      title: 'In Progress',
      value: stats.in_progress,
      icon: Clock,
      bg: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'Closed',
      value: stats.closed,
      icon: CheckCircle,
      bg: 'bg-emerald-100 text-emerald-800',
    },
  ];

  const displayedTickets = searchResults !== null ? searchResults : recentTickets;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Good morning, Support Team
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Here's what's happening with your support queue.
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

      {/* Error Notice */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-4 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => window.location.reload()}
            className="underline font-medium hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4 Compact Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm hover:border-slate-300 transition-all flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  {loading ? '...' : card.value}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.bg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Tickets / Search Results Section */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="shrink-0">
            <h2 className="text-lg font-bold text-slate-900">
              {searchResults !== null ? `Search Results` : 'Recent Tickets'}
            </h2>
            <p className="text-xs text-slate-500">
              {searchResults !== null
                ? `Found ${searchResults.length} matching ticket(s)`
                : 'Latest activity across active support requests'}
            </p>
          </div>

          {/* Quick Search Bar directly in Recent Tickets header */}
          <div className="flex-1 max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
              placeholder="Search by name, ID, email, or description..."
            />
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
            {searchResults !== null && (
              <button
                onClick={handleClearSearch}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 underline"
              >
                Clear Search
              </button>
            )}
            <Link
              to={searchQuery ? `/tickets?search=${encodeURIComponent(searchQuery)}` : '/tickets'}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              <span>{searchResults !== null ? 'View all results' : 'View all tickets'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {loading || searching ? (
          <SkeletonTable rows={5} />
        ) : displayedTickets.length > 0 ? (
          <TicketTable tickets={displayedTickets} />
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm space-y-2">
            <p className="font-semibold text-slate-700">No tickets found matching "{searchQuery}"</p>
            <p className="text-xs text-slate-500">
              Try searching by customer name, email address, ticket ID (e.g. TKT-001), or issue keywords.
            </p>
            <button
              onClick={handleClearSearch}
              className="mt-2 inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
