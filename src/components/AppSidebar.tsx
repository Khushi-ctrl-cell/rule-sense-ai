import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Shield, AlertTriangle, BarChart3, FileText, 
  Settings, Cpu, Network, Beaker, Menu, X, Activity, Zap, ShieldCheck,
  Brain, Briefcase, PieChart
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/rules', icon: Shield, label: 'Rule Engine' },
  { to: '/nl-rules', icon: Brain, label: 'AI Rule Creator' },
  { to: '/violations', icon: AlertTriangle, label: 'Violations' },
  { to: '/cases', icon: Briefcase, label: 'Cases' },
  { to: '/risk', icon: BarChart3, label: 'Risk Scores' },
  { to: '/rule-analytics', icon: PieChart, label: 'Rule Analytics' },
  { to: '/audit', icon: FileText, label: 'Audit Trail' },
  { to: '/simulator', icon: Beaker, label: 'Simulator' },
  { to: '/network', icon: Network, label: 'Network Graph' },
  { to: '/benchmarks', icon: Zap, label: 'Benchmarks' },
  { to: '/data-integrity', icon: ShieldCheck, label: 'Data Integrity' },
  { to: '/architecture', icon: Cpu, label: 'Architecture' },
];

export default function AppSidebar({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const SidebarContent = () => (
    <nav className="flex flex-col gap-1 px-3 py-2">
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => setMobileOpen(false)}
          className={`sidebar-link ${location.pathname === item.to ? 'active' : ''}`}
        >
          <item.icon className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{item.label}</span>}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-sidebar-border transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
        style={{ background: 'var(--gradient-sidebar)' }}
      >
        <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
          <Activity className="w-5 h-5 text-primary shrink-0" />
          {!collapsed && (
            <span className="font-bold text-sm gradient-text tracking-tight">PS3 Compliance</span>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-muted-foreground hover:text-foreground">
            <Menu className="w-4 h-4" />
          </button>
        </div>
        <SidebarContent />
        <div className="mt-auto p-3 border-t border-sidebar-border">
          <NavLink to="/settings" onClick={() => setMobileOpen(false)}
            className={`sidebar-link ${location.pathname === '/settings' ? 'active' : ''}`}>
            <Settings className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </NavLink>
        </div>
      </aside>

      {/* Mobile header + overlay */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button onClick={() => setMobileOpen(true)} className="text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <Activity className="w-5 h-5 text-primary" />
          <span className="font-bold text-sm gradient-text">PS3 Compliance</span>
        </header>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                onClick={() => setMobileOpen(false)} />
              <motion.aside initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
                transition={{ type: 'spring', damping: 25 }}
                className="md:hidden fixed left-0 top-0 bottom-0 w-60 z-50 border-r border-sidebar-border flex flex-col"
                style={{ background: 'var(--gradient-sidebar)' }}>
                <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
                  <Activity className="w-5 h-5 text-primary" />
                  <span className="font-bold text-sm gradient-text">PS3 Compliance</span>
                  <button onClick={() => setMobileOpen(false)} className="ml-auto text-muted-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <SidebarContent />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
