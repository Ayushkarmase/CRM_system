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
  Pencil,
  History,
  ArrowRight,
  X,
  FileText,
  Tag,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const TicketDetails = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active tab in activity card: 'notes' | 'logs'
  const [activeTab, setActiveTab] = useState('notes');

  // Note form state
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPriority, setUpdatingPriority] = useState(false);

  // Edit Ticket Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editFormData, setEditFormData] = useState({
    subject: '',
    description: '',
    status: 'Open',
    priority: 'Medium',
    customer_name: '',
    customer_email: '',
  });

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

  const openEditModal = () => {
    if (!ticket) return;
    setEditFormData({
      subject: ticket.subject || '',
      description: ticket.description || '',
      status: ticket.status || 'Open',
      priority: ticket.priority || 'Medium',
      customer_name: ticket.customer_name || '',
      customer_email: ticket.customer_email || '',
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    if (savingEdit) return;
    setIsEditModalOpen(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!ticket) return;

    if (!editFormData.subject.trim()) {
      addToast('Subject is required', 'error');
      return;
    }
    if (!editFormData.description.trim()) {
      addToast('Description is required', 'error');
      return;
    }
    if (!editFormData.customer_name.trim()) {
      addToast('Customer name is required', 'error');
      return;
    }
    if (!editFormData.customer_email.trim() || !editFormData.customer_email.includes('@')) {
      addToast('Valid customer email is required', 'error');
      return;
    }

    try {
      setSavingEdit(true);
      const updated = await ticketApi.updateTicket(ticket.ticket_id, {
        subject: editFormData.subject.trim(),
        description: editFormData.description.trim(),
        status: editFormData.status,
        priority: editFormData.priority,
        customer_name: editFormData.customer_name.trim(),
        customer_email: editFormData.customer_email.trim(),
      });

      setTicket(updated);
      setIsEditModalOpen(false);
      addToast('Ticket updated successfully', 'success');
    } catch (err) {
      console.error('Failed to update ticket:', err);
      const detail = err.response?.data?.detail || 'Failed to update ticket. Please try again.';
      addToast(typeof detail === 'string' ? detail : 'Validation error occurred', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!ticket || newStatus === ticket.status) return;

    try {
      setUpdatingStatus(true);
      const res = await ticketApi.updateTicket(ticket.ticket_id, { status: newStatus });
      setTicket(res);
      addToast(`Status updated to '${newStatus}'`, 'success');
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
      setTicket(res);
      addToast(`Priority updated to '${newPriority}'`, 'success');
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

  const renderFieldBadge = (fieldName) => {
    switch (fieldName) {
      case 'status':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" /> Status
          </span>
        );
      case 'priority':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
            <Tag className="w-3 h-3" /> Priority
          </span>
        );
      case 'subject':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
            <FileText className="w-3 h-3" /> Subject
          </span>
        );
      case 'description':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
            <FileText className="w-3 h-3" /> Description
          </span>
        );
      case 'customer_name':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full">
            <User className="w-3 h-3" /> Customer Name
          </span>
        );
      case 'customer_email':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full">
            <Mail className="w-3 h-3" /> Customer Email
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full">
            {fieldName}
          </span>
        );
    }
  };

  const renderLogChange = (log) => {
    if (log.field_name === 'status') {
      return (
        <div className="flex items-center gap-2 mt-1">
          <StatusBadge status={log.old_value || 'None'} />
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <StatusBadge status={log.new_value || 'None'} />
        </div>
      );
    }

    if (log.field_name === 'priority') {
      return (
        <div className="flex items-center gap-2 mt-1">
          <PriorityBadge priority={log.old_value || 'None'} />
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <PriorityBadge priority={log.new_value || 'None'} />
        </div>
      );
    }

    if (log.field_name === 'description') {
      return (
        <div className="space-y-2 mt-1.5 text-xs">
          <div className="bg-rose-50/70 border border-rose-200/60 rounded-lg p-2.5 text-rose-900">
            <span className="font-semibold text-[10px] uppercase tracking-wider text-rose-600 block mb-1">
              Previous Description:
            </span>
            <p className="whitespace-pre-wrap leading-relaxed line-clamp-3 hover:line-clamp-none transition-all">
              {log.old_value || <span className="italic text-rose-400">Empty</span>}
            </p>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-lg p-2.5 text-emerald-900">
            <span className="font-semibold text-[10px] uppercase tracking-wider text-emerald-600 block mb-1">
              Updated Description:
            </span>
            <p className="whitespace-pre-wrap leading-relaxed line-clamp-3 hover:line-clamp-none transition-all">
              {log.new_value || <span className="italic text-emerald-400">Empty</span>}
            </p>
          </div>
        </div>
      );
    }

    // Default for subject, customer_name, customer_email, etc.
    return (
      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200 font-mono break-all line-through decoration-slate-400">
          {log.old_value || '(empty)'}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="bg-blue-50 text-blue-800 font-semibold px-2.5 py-1 rounded-md border border-blue-200 font-mono break-all">
          {log.new_value || '(empty)'}
        </span>
      </div>
    );
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
          className="inline-flex items-center gap-2 bg-slate-900 text-white font-medium text-sm py-2 px-4 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tickets</span>
        </button>
      </div>
    );
  }

  const notesCount = ticket.notes ? ticket.notes.length : 0;
  const editLogsCount = ticket.edit_logs ? ticket.edit_logs.length : 0;

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
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="font-mono font-bold text-sm bg-slate-100 text-slate-900 px-2.5 py-1 rounded-md border border-slate-200">
              {ticket.ticket_id}
            </span>
            <PriorityBadge priority={ticket.priority} showIcon />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            {ticket.subject}
          </h1>
        </div>

        {/* Status Quick Actions, Edit Button & Dropdown */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
          {/* Edit Ticket Button */}
          <button
            onClick={openEditModal}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 shadow-sm hover:border-slate-400 transition-all active:scale-[0.98]"
            title="Edit ticket subject, description, customer details, status or priority"
          >
            <Pencil className="w-3.5 h-3.5 text-slate-600" />
            <span>Edit Ticket</span>
          </button>

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
        {/* Main Content Column (Issue & Activity/Logs) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Details Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Issue Details</h2>
              <button
                onClick={openEditModal}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Pencil className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
            <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-normal">
              {ticket.description}
            </div>
          </div>

          {/* Activity, Notes & Edit History Card with Tabs */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            {/* Tabs Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('notes')}
                  className={`inline-flex items-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === 'notes'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Internal Notes</span>
                  <span
                    className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === 'notes'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {notesCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('logs')}
                  className={`inline-flex items-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === 'logs'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>Edit Logs & History</span>
                  <span
                    className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === 'logs'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {editLogsCount}
                  </span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT: Internal Notes */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
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
            )}

            {/* TAB CONTENT: Edit Logs / Audit Trail */}
            {activeTab === 'logs' && (
              <div className="space-y-4">
                {ticket.edit_logs && ticket.edit_logs.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 font-medium">
                      Complete chronological audit record of changes made to this ticket:
                    </p>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/40">
                      {ticket.edit_logs.map((log) => (
                        <div
                          key={log.id}
                          className="p-4 bg-white hover:bg-slate-50/80 transition-colors space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {renderFieldBadge(log.field_name)}
                              <span className="text-xs font-medium text-slate-500">updated</span>
                            </div>
                            <span
                              className="text-xs text-slate-500 font-medium"
                              title={parseDate(log.created_at)?.toLocaleString() || ''}
                            >
                              {formatRelativeTime(log.created_at)}
                            </span>
                          </div>

                          {/* Render what it was updated from to what */}
                          <div className="pl-1">{renderLogChange(log)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 space-y-2">
                    <History className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">No edits recorded yet</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Any updates made to this ticket's subject, description, priority, status, or customer info will appear here with before and after values.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info Column */}
        <div className="space-y-6">
          {/* Customer Info Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Customer Information
              </h3>
              <button
                onClick={openEditModal}
                className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                title="Edit Customer Details"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
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
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Ticket Overview
              </h3>
              <button
                onClick={openEditModal}
                className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                title="Edit Ticket Overview"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
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
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Created
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
              <div className="flex justify-between items-center py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <History className="w-3.5 h-3.5 text-slate-400" /> Total Edits
                </span>
                <span className="text-slate-700 font-semibold">
                  {editLogsCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT TICKET MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Ticket <span className="text-slate-500 font-mono text-xs">({ticket.ticket_id})</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Modify ticket properties. All changes will be logged in the audit trail.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                disabled={savingEdit}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Row 1: Customer Name & Customer Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.customer_name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, customer_name: e.target.value })
                    }
                    placeholder="e.g. John Doe"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                    Customer Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={editFormData.customer_email}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, customer_email: e.target.value })
                    }
                    placeholder="e.g. john@example.com"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Status & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                    Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all cursor-pointer"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                    Priority
                  </label>
                  <select
                    value={editFormData.priority}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, priority: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Subject */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.subject}
                  onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                  placeholder="Summary of the customer issue"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                />
              </div>

              {/* Row 4: Description */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Description *
                </label>
                <textarea
                  rows={5}
                  required
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                  placeholder="Detailed description of the customer issue..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={savingEdit}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all"
                >
                  {savingEdit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetails;
