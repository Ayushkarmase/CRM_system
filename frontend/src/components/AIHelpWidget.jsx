import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { ticketApi } from '../services/api';

const KNOWLEDGE_BASE_TOPICS = [
  { title: 'How DeskFlow Works', query: 'How does DeskFlow work?' },
  { title: 'Ticket Priority Guide', query: 'Explain ticket priorities' },
  { title: 'Managing Ticket Statuses', query: 'How do I manage ticket statuses?' },
  { title: 'Internal Team Notes', query: 'How do internal team notes work?' },
  { title: 'Search & Filter Operations', query: 'How to search and filter tickets?' },
];

const DEFAULT_GREETING = {
  sender: 'ai',
  text: `Hello! I'm your **DeskFlow Assistant**, powered by the DeskFlow AI Backend API.\n\nI can explain workflows, guide queue triage, or check live database ticket stats (e.g. **What is the status of TKT-001?** or **How many open tickets?**). Select a topic below or ask any question!`,
};

// Helper function to render markdown syntax (**bold** and *italic*) cleanly without raw asterisks
const renderFormattedText = (text, isUser = false) => {
  if (!text) return null;

  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    // Split line by **bold** or *italic* patterns
    const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);

    return (
      <React.Fragment key={lineIdx}>
        {parts.map((part, partIdx) => {
          if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            return (
              <strong
                key={partIdx}
                className={isUser ? 'font-bold text-white' : 'font-bold text-slate-900'}
              >
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
            return (
              <em
                key={partIdx}
                className={isUser ? 'italic text-white/90 font-medium' : 'italic text-slate-700 font-medium'}
              >
                {part.slice(1, -1)}
              </em>
            );
          }
          return part;
        })}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

export const AIHelpWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([DEFAULT_GREETING]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendQueryToBackendAI = async (queryText) => {
    setIsTyping(true);
    try {
      // Call backend REST endpoint POST /api/ai/ask
      const response = await ticketApi.askAI(queryText);
      setMessages((prev) => [...prev, { sender: 'ai', text: response.answer }]);
    } catch (err) {
      console.error('Backend AI error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `I'm here to help with **DeskFlow Operations**.\n\nYou can ask about:\n• **How DeskFlow works**\n• **Ticket priorities (Urgent, High, Medium, Low)**\n• **Updating ticket statuses**\n• **Live ticket IDs (e.g. TKT-001)**`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTopicClick = (topic) => {
    const userMsg = { sender: 'user', text: topic.title };
    setMessages((prev) => [...prev, userMsg]);
    sendQueryToBackendAI(topic.query);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const queryText = inputValue.trim();
    const userMsg = { sender: 'user', text: queryText };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    sendQueryToBackendAI(queryText);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 font-sans">
      {/* Popover Assistant Window (Rendered when open) */}
      {isOpen ? (
        <div className="w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200 max-h-[520px]">
          {/* Assistant Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  DeskFlow AI Assistant
                </h3>
                <p className="text-[11px] text-slate-300 font-medium">FastAPI Backend AI Engine</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close assistant"
              title="Close Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Topic Chips */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {KNOWLEDGE_BASE_TOPICS.map((topic) => (
              <button
                key={topic.title}
                onClick={() => handleTopicClick(topic)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shrink-0 shadow-2xs"
              >
                {topic.title}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 min-h-[220px]">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-6 h-6 bg-slate-900 text-white rounded-md flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white font-medium rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 shadow-2xs rounded-bl-none'
                  }`}
                >
                  <div>{renderFormattedText(msg.text, msg.sender === 'user')}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 pl-8 py-1">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-slate-400 ml-1">DeskFlow AI thinking...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask any question about DeskFlow or tickets..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-all shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        /* Floating Trigger Button (Rendered ONLY when popover is closed) */
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm py-3 px-4 rounded-full shadow-lg transition-all active:scale-95 group border border-slate-800"
        >
          <Sparkles className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform" />
          <span>Ask DeskFlow AI</span>
        </button>
      )}
    </div>
  );
};

export default AIHelpWidget;
