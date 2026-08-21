import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ticketApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { useToast } from '../components/Toast';
import { formatRelativeTime, formatDateTime, parseDate } from '../components/TicketTable';
import {
  ArrowLeft,
  Mail,
  User,
  Clock,
  MessageSquare,
  Send,
  Loader2,
  Calendar,
  ChevronDown,
  CheckCircle2,
  Play,
  RotateCcw,
} from 'lucide-react';

export const TicketDetails = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Note form state
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPriority, setUpdatingPriority] = useState(false);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ticketApi.getTicket(ticketId);
      setTicket(data);
    } catch (err) {
      console.error('Error loading ticket:', err);
      setError(`Ticket '${ticketId}' was not found or could not be loaded.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId]);

  const handleStatusChange = async (newStatus) => {
    if (!ticket || newStatus === ticket.status) return;

    try {
      setUpdatingStatus(true);
      const res = await ticketApi.updateTicket(ticket.ticket_id, { status: newStatus });
      setTicket((prev) => ({
        ...prev,
        status: res.status,
        updated_at: res.updated_at,
      }));
      addToast(`Status updated to '${res.status}'`, 'success');
    } catch (err) {
      console.error('Failed to update status:', err);
      addToast('Failed to update status. Please try again.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    if (!ticket || newPriority === ticket.priority) return;

    try {
      setUpdatingPriority(true);
      const res = await ticketApi.updateTicket(ticket.ticket_id, { priority: newPriority });
      setTicket((prev) => ({
        ...prev,
        priority: res.priority,
        updated_at: res.updated_at,
      }));
      addToast(`Priority updated to '${res.priority}'`, 'success');
    } catch (err) {
      console.error('Failed to update priority:', err);
      addToast('Failed to update priority.', 'error');
    } finally {
      setUpdatingPriority(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    try {
      setAddingNote(true);
      const newNote = await ticketApi.addNote(ticket.ticket_id, noteText.trim());
      setTicket((prev) => ({
        ...prev,
        notes: [...(prev.notes || []), newNote],
        updated_at: new Date().toISOString(),
      }));
      setNoteText('');
      addToast('Internal note saved', 'success');
    } catch (err) {
      console.error('Failed to add note:', err);
      addToast('Failed to save note. Try again.', 'error');
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-4 w-24 bg-slate-200 rounded" />
        <div className="h-10 bg-slate-200 rounded w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="h-40 bg-slate-200 rounded-xl" />
            <div className="h-60 bg-slate-200 rounded-xl" />
          </div>
          <div className="h-60 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4 shadow-sm my-12">
        <h2 className="text-xl font-bold text-slate-900">Ticket Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'The requested ticket does not exist.'}</p>
        <button
          onClick={() => navigate('/tickets')}
          className="inline-flex items-center gap-2 bg-slate-900 text-white font-medium text-sm py-2 px-4 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tickets</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Nav Back */}
      <Link
        to="/tickets"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to tickets</span>
      </Link>

      {/* Main Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="font-mono font-bold text-sm bg-slate-100 text-slate-900 px-2.5 py-1 rounded-md border border-slate-200">
              {ticket.ticket_id}
            </span>
            <PriorityBadge priority={ticket.priority} showIcon />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{ticket.subject}</h1>
        </div>

        {/* Status Quick Actions & Dropdown Selector */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
          {ticket.status === 'Open' && (
            <button
              onClick={() => handleStatusChange('In Progress')}
              disabled={updatingStatus}
              className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-2 rounded-lg border border-blue-200 transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>In Progress</span>
            </button>
          )}
          {ticket.status !== 'Closed' ? (
            <button
              onClick={() => handleStatusChange('Closed')}
              disabled={updatingStatus}
              className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-2 rounded-lg border border-emerald-200 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Close Ticket</span>
            </button>
          ) : (
            <button
              onClick={() => handleStatusChange('Open')}
              disabled={updatingStatus}
              className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-2 rounded-lg border border-amber-200 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reopen Ticket</span>
            </button>
          )}

          <div className="relative">
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updatingStatus}
              className="appearance-none bg-slate-50 border border-slate-300 font-semibold text-xs sm:text-sm rounded-lg px-3 py-2 pr-8 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer disabled:opacity-50"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column (Issue & Notes) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Details Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Issue Details
            </h2>
            <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-normal">
              {ticket.description}
            </div>
          </div>

          {/* Activity / Internal Notes Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <h2 className="text-base font-bold text-slate-900">Activity & Internal Notes</h2>
              </div>
              <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                {ticket.notes ? ticket.notes.length : 0} notes
              </span>
            </div>

            {/* Notes List */}
            <div className="space-y-4">
              {ticket.notes && ticket.notes.length > 0 ? (
                ticket.notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-slate-50 border border-slate-200/70 rounded-lg p-4 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span className="font-semibold text-slate-700">Internal Team Note</span>
                      <span title={parseDate(note.created_at)?.toLocaleString() || ''}>
                        {formatRelativeTime(note.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 whitespace-pre-wrap">{note.note_text}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic text-center py-4">
                  No internal notes added yet. Add a note below to keep the team informed.
                </p>
              )}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="pt-2 space-y-3">
              <label htmlFor="note_text" className="block text-xs font-bold uppercase text-slate-700">
                Add an internal note...
              </label>
              <textarea
                id="note_text"
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write an internal note for your team (visible only to support staff)..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={addingNote || !noteText.trim()}
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-sm py-2 px-4 rounded-lg shadow-sm transition-all"
                >
                  {addingNote ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Add Note</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Info Column */}
        <div className="space-y-6">
          {/* Customer Info Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Customer Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-sm font-semibold text-slate-900">
                  {ticket.customer_name}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href={`mailto:${ticket.customer_email}`}
                  className="text-sm text-blue-600 hover:underline font-medium truncate"
                  title="Send email to customer"
                >
                  {ticket.customer_email}
                </a>
              </div>
            </div>
          </div>

          {/* Ticket Information Metadata */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Ticket Overview
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Status</span>
                <StatusBadge status={ticket.status} />
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Priority</span>
                <select
                  value={ticket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  disabled={updatingPriority}
                  className="text-xs border border-slate-200 rounded px-2 py-1 font-semibold text-slate-800 bg-slate-50 cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Timestamp
                </span>
                <span className="text-slate-700 font-medium">
                  {formatDateTime(ticket.created_at)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Last Updated
                </span>
                <span className="text-slate-700 font-medium">
                  {formatRelativeTime(ticket.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
