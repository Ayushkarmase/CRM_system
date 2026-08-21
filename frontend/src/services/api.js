import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const ticketApi = {
  // Get live queue stats (Total, Open, In Progress, Closed)
  getStats: async () => {
    const response = await api.get('/api/tickets/stats');
    return response.data;
  },

  // Get list of tickets with optional search, status, and priority filters
  getTickets: async ({ status = '', search = '', priority = '' } = {}) => {
    const params = {};
    if (status && status !== 'All') params.status = status;
    if (priority && priority !== 'All') params.priority = priority;
    if (search && search.trim()) params.search = search.trim();

    const response = await api.get('/api/tickets', { params });
    return response.data;
  },

  // Get single ticket detail by TKT-XXX ID
  getTicket: async (ticketId) => {
    const response = await api.get(`/api/tickets/${ticketId}`);
    return response.data;
  },

  // Create a new support ticket
  createTicket: async (ticketData) => {
    const response = await api.post('/api/tickets', ticketData);
    return response.data;
  },

  // Update ticket status or priority
  updateTicket: async (ticketId, updateData) => {
    const response = await api.put(`/api/tickets/${ticketId}`, updateData);
    return response.data;
  },

  // Add internal note to a ticket
  addNote: async (ticketId, noteText) => {
    const response = await api.post(`/api/tickets/${ticketId}/notes`, { note_text: noteText });
    return response.data;
  },

  // Ask DeskFlow AI Operational Assistant
  askAI: async (question) => {
    const response = await api.post('/api/ai/ask', { question });
    return response.data;
  },
};

export default api;
