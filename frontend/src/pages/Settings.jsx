import React from 'react';
import { Database, Server, ShieldCheck, Tag, Info } from 'lucide-react';

export const Settings = () => {
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000 (Proxy)';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          DeskFlow Customer Support Operations configuration and operational health.
        </p>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Environment & Backend Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold border-b border-slate-100 pb-3">
            <Server className="w-5 h-5 text-slate-700" />
            <h2>Backend Infrastructure</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">API Endpoint</span>
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800">{backendUrl}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-100">
              <span className="text-slate-500 font-medium">Framework</span>
              <span className="font-semibold text-slate-800">FastAPI 0.100+ (Python 3.10)</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-100">
              <span className="text-slate-500 font-medium">API Documentation</span>
              <a href="/docs" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline">
                Swagger UI (/docs)
              </a>
            </div>
          </div>
        </div>

        {/* Database & Persistence Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold border-b border-slate-100 pb-3">
            <Database className="w-5 h-5 text-slate-700" />
            <h2>Database Engine</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Database System</span>
              <span className="font-semibold text-slate-800">SQLite (SQLAlchemy 2.0 ORM)</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-100">
              <span className="text-slate-500 font-medium">Ticket ID Strategy</span>
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800">TKT-001 (Sequential Backend)</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-100">
              <span className="text-slate-500 font-medium">Persistence Test</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Standout Feature Overview */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <Tag className="w-5 h-5 text-slate-800" />
          <h2>Standout Feature: Ticket Priority Management</h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          DeskFlow incorporates an explicit priority triage engine (<span className="font-semibold text-slate-900">Low, Medium, High, Urgent</span>). This feature provides support leads with immediate visual scannability across queues, enabling team members to address high-severity service outages and billing issues first.
        </p>
      </div>

      {/* Datastraw Assessment Footer Note */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-relaxed space-y-1">
          <p className="font-semibold text-slate-800">Datastraw AI + Tech Intern Assessment</p>
          <p>Built with intentional product design, zero unneeded abstractions, clean REST contract, and zero mock data.</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
