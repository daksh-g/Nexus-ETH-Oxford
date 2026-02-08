import { Outlet, useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { Activity, Shield, Sparkles, Radio, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { to: '/demo', icon: Radio, label: 'Overview' },
  { to: '/pulse', icon: Activity, label: 'Pulse' },
  { to: '/alerts', icon: Shield, label: 'Alerts' },
  { to: '/ask', icon: Sparkles, label: 'Ask NEXUS' },
];

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  // Demo view is full-screen, no layout
  if (location.pathname === '/demo' || location.pathname === '/') {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-screen sticky top-0 bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden"
          >
            {/* Logo */}
            <div className="px-4 py-5 flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-mono text-sm font-bold tracking-wider text-foreground">NEXUS</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                  activeClassName="bg-sidebar-accent text-primary font-medium"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-sidebar-border">
              <div className="text-[9px] text-mono text-muted-foreground">
                <span className="text-primary">●</span> Meridian Technologies
              </div>
              <div className="text-[9px] text-muted-foreground">24 nodes · 7 active alerts</div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-12 border-b border-border flex items-center px-4 gap-3 shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-foreground transition-colors">
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <div className="text-[10px] text-mono text-muted-foreground uppercase tracking-wider">
            {navItems.find(n => location.pathname.startsWith(n.to))?.label || 'NEXUS'}
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
