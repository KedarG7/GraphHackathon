import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Network,
  GitBranch,
  Users,
  Box,
  ShieldAlert,
  FileText,
  UploadCloud,
  Terminal,
  Activity,
  ChevronLeft,
  ChevronRight,
  Database,
  Radio,
} from 'lucide-react';
import { checkHealth } from '../api/client';

const navItems = [
  { to: '/overview', label: 'Command Overview', icon: LayoutDashboard },
  { to: '/graph', label: 'Intelligence Graph', icon: Network },
  { to: '/decisions', label: 'Decision Explorer', icon: GitBranch },
  { to: '/people', label: 'People & Organization', icon: Users },
  { to: '/projects', label: 'Projects & Goals', icon: Box },
  { to: '/risks', label: 'Risk Intelligence', icon: ShieldAlert },
  { to: '/documents', label: 'Document Intelligence', icon: FileText },
  { to: '/ingest', label: 'Live Ingestion', icon: UploadCloud },
  { to: '/agent', label: 'Agent Workbench', icon: Terminal },
  { to: '/diagnostics', label: 'System Diagnostics', icon: Activity },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'connected' | 'disconnected' | 'checking'
  const [dbStatus, setDbStatus] = useState('checking');

  useEffect(() => {
    let isMounted = true;

    async function probe() {
      try {
        const res = await checkHealth();
        if (isMounted) {
          if (res?.ok) {
            setConnectionStatus('connected');
            setDbStatus('connected');
          } else {
            setConnectionStatus('degraded');
            setDbStatus('unknown');
          }
        }
      } catch {
        if (isMounted) {
          setConnectionStatus('disconnected');
          setDbStatus('disconnected');
        }
      }
    }

    probe();
    const timer = setInterval(probe, 10000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <aside
      className={`glass-panel border-r border-white/10 flex flex-col transition-all duration-300 relative z-20 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        {!collapsed ? (
          <div className="space-y-0.5 overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-intel animate-pulse flex-shrink-0 shadow-[0_0_10px_#6EE7A8]" />
              <span className="font-mono text-xs font-bold tracking-widest text-green-intel uppercase drop-shadow-[0_0_8px_rgba(110,231,168,0.4)]">
                CBI • CORE
              </span>
            </div>
            <div className="font-bold text-sm tracking-tight text-text-primary uppercase font-mono">
              A.S.K
            </div>
            <div className="text-[10px] font-mono text-text-muted tracking-tight truncate">
              Agentic System of Knowledge
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-green-intel shadow-[0_0_10px_#6EE7A8]" title="A.S.K — Agentic System of Knowledge" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-text-muted hover:text-text-primary p-1 rounded-md hover:bg-white/[0.06] transition-colors border border-transparent hover:border-white/10"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-white/[0.08] text-green-intel border-l-2 border-green-intel shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-md'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="flex-shrink-0 group-hover:scale-105 transition-transform" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Live System Connectivity Telemetry */}
      {!collapsed ? (
        <div className="p-3 border-t border-white/10 bg-black/30 backdrop-blur-md text-[11px] font-mono space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="flex items-center gap-1.5">
              <Database size={12} className="text-cyan-analytical" />
              Graph
            </span>
            <span className="text-text-primary font-bold">company</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-muted">Backend</span>
            <span
              className={`flex items-center gap-1.5 font-bold ${
                connectionStatus === 'connected'
                  ? 'text-green-intel'
                  : connectionStatus === 'checking'
                  ? 'text-amber-tactical'
                  : 'text-red-alert'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-green-intel'
                    : connectionStatus === 'checking'
                    ? 'bg-amber-tactical animate-ping'
                    : 'bg-red-alert'
                }`}
              />
              {connectionStatus === 'connected'
                ? 'CONNECTED'
                : connectionStatus === 'checking'
                ? 'CHECKING...'
                : 'OFFLINE'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-muted">FalkorDB</span>
            <span
              className={`font-bold ${
                dbStatus === 'connected'
                  ? 'text-green-intel'
                  : dbStatus === 'checking'
                  ? 'text-amber-tactical'
                  : 'text-red-alert'
              }`}
            >
              {dbStatus === 'connected' ? 'HEALTHY' : dbStatus === 'checking' ? 'PROBING' : 'OFFLINE'}
            </span>
          </div>

          <div className="flex items-center justify-between text-text-muted pt-1 border-t border-border-default/40">
            <span>Env</span>
            <span className="text-text-primary">production</span>
          </div>
        </div>
      ) : (
        <div className="p-3 border-t border-border-default flex flex-col items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-intel' : 'bg-red-alert'
            }`}
            title={`Backend: ${connectionStatus}`}
          />
        </div>
      )}
    </aside>
  );
}
