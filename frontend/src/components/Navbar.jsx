import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { LifeBuoy, Menu, X, Plus, LayoutDashboard, Ticket, Settings, Globe } from 'lucide-react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tickets', label: 'Tickets', icon: Ticket },
    { to: '/integration', label: 'Website Integration', icon: Globe },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 md:hidden">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold">
            <LifeBuoy className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-base leading-tight">DeskFlow</h1>
            <p className="text-[10px] text-slate-500 font-medium">Support Operations</p>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Link
            to="/tickets/new"
            onClick={closeMenu}
            className="flex items-center gap-1 bg-slate-900 text-white text-xs font-medium py-1.5 px-3 rounded-md shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle navigation"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <nav className="bg-white border-b border-slate-200 px-4 py-3 space-y-1 animate-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMenu}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-500" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
