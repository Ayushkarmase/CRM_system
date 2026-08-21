import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Ticket, Plus, Settings, LifeBuoy, Globe } from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tickets', label: 'Tickets', icon: Ticket },
    { to: '/integration', label: 'Website Integration', icon: Globe },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col shrink-0 hidden md:flex z-20 overflow-y-auto">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold shadow-sm group-hover:bg-blue-600 transition-colors">
            <LifeBuoy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight tracking-tight text-lg">DeskFlow</h1>
            <p className="text-xs text-slate-500 font-medium">Customer Support Operations</p>
          </div>
        </Link>
      </div>

      {/* Quick Action Button */}
      <div className="px-4 py-4">
        <Link
          to="/tickets/new"
          className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm py-2.5 px-4 rounded-lg shadow-sm transition-all active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          <span>New Ticket</span>
        </Link>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 text-slate-500" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Operational Footer / Workspace Badge */}
      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700">Support Queue Active</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Datastraw AI + Tech Assessment</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
