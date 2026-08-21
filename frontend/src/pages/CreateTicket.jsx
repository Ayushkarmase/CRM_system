import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ticketApi } from '../services/api';
import { useToast } from '../components/Toast';
import { ArrowLeft, Loader2, Send } from 'lucide-react';

export const CreateTicket = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: '',
    priority: 'Medium',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Customer name is required';
    }

    if (!formData.customer_email.trim()) {
      newErrors.customer_email = 'Customer email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email.trim())) {
      newErrors.customer_email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Issue title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const newTicket = await ticketApi.createTicket({
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim(),
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
      });

      addToast(`Ticket created successfully — ${newTicket.ticket_id}`, 'success');
      navigate(`/tickets/${newTicket.ticket_id}`);
    } catch (err) {
      console.error('Failed to create ticket:', err);
      const errorMsg =
        err.response?.data?.detail || 'Failed to create support ticket. Please check inputs.';
      addToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        to="/tickets"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to tickets</span>
      </Link>

      {/* Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create a new ticket</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Capture the customer's issue so your team can follow up.
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
        {/* Customer Name */}
        <div>
          <label htmlFor="customer_name" className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
            Customer Name <span className="text-red-500">*</span>
          </label>
          <input
            id="customer_name"
            type="text"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            placeholder="e.g. Rahul Sharma"
            className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all ${
              errors.customer_name ? 'border-red-400 focus:ring-red-500' : 'border-slate-200'
            }`}
          />
          {errors.customer_name && (
            <p className="text-xs text-red-600 mt-1 font-medium">{errors.customer_name}</p>
          )}
        </div>

        {/* Customer Email */}
        <div>
          <label htmlFor="customer_email" className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
            Customer Email <span className="text-red-500">*</span>
          </label>
          <input
            id="customer_email"
            type="email"
            name="customer_email"
            value={formData.customer_email}
            onChange={handleChange}
            placeholder="e.g. rahul@example.com"
            className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all ${
              errors.customer_email ? 'border-red-400 focus:ring-red-500' : 'border-slate-200'
            }`}
          />
          {errors.customer_email && (
            <p className="text-xs text-red-600 mt-1 font-medium">{errors.customer_email}</p>
          )}
        </div>

        {/* Issue Title / Subject */}
        <div>
          <label htmlFor="subject" className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
            Issue Title / Subject <span className="text-red-500">*</span>
          </label>
          <input
            id="subject"
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Brief summary of the issue (e.g. Unable to access my account)"
            className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all ${
              errors.subject ? 'border-red-400 focus:ring-red-500' : 'border-slate-200'
            }`}
          />
          {errors.subject && (
            <p className="text-xs text-red-600 mt-1 font-medium">{errors.subject}</p>
          )}
        </div>

        {/* Priority Selection */}
        <div>
          <label htmlFor="priority" className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
            Priority Level
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all cursor-pointer font-medium"
          >
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
            <option value="Urgent">Urgent Priority</option>
          </select>
        </div>

        {/* Description Textarea */}
        <div>
          <label htmlFor="description" className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide full details of the customer issue..."
            className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all resize-none ${
              errors.description ? 'border-red-400 focus:ring-red-500' : 'border-slate-200'
            }`}
          />
          {errors.description && (
            <p className="text-xs text-red-600 mt-1 font-medium">{errors.description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Link
            to="/tickets"
            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-sm py-2.5 px-5 rounded-lg shadow-sm transition-all active:scale-[0.99]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Create Ticket</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTicket;
