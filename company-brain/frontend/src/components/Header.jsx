import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Bell,
  Shield,
  Circle,
  User,
  Activity,
  Layers,
} from 'lucide-react';
import { checkHealth } from '../api/client';
import { demoData } from '../mock/data';

const routeTitles = {
  '/overview': { title: 'Command Overview', section: 'EXECUTIVE INTELLIGENCE' },
  '/graph': { title: 'Intelligence Graph Explorer', section: 'GRAPH REASONING' },
  '/decisions': { title: 'Decision Explorer', section: 'PROVENANCE & AUDIT' },
  '/people': { title: 'People & Organization', section: 'STRUCTURAL ANALYSIS' },
  '/projects': { title: 'Projects & Goals', section: 'PORTFOLIO IMPACT' },
  '/risks': { title: 'Risk Intelligence', section: 'DEPENDENCY EXPOSURE' },
  '/documents': { title: 'Document Intelligence', section: 'SOURCE EVIDENCE' },
  '/ingest': { title: 'Live Ingestion Workstation', section: 'KNOWLEDGE STREAM' },
  '/agent': { title: 'Agent Investigation Workbench', section: 'EVIDENCE-FIRST REASONING' },
  '/diagnostics': { title: 'System Diagnostics & Telemetry', section: 'INFRASTRUCTURE' },
};

export default function Header({ toggleDrawer, drawerOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isHealthy, setIsHealthy] = useState(true);

  const currentRoute = routeTitles[location.pathname] || {
    title: 'Command Center',
    section: 'CBI INTELLIGENCE',
  };

  useEffect(() => {
    checkHealth()
      .then((res) => setIsHealthy(!!res?.ok))
      .catch(() => setIsHealthy(false));
  }, [location.pathname]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setGlobalSearch(val);
    if (!val.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const q = val.toLowerCase();
    const hits = [];

    // search people
    demoData.people.forEach((p) => {
      if (p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q)) {
        hits.push({ type: 'Person', label: p.name, sub: p.role, path: '/people' });
      }
    });

    // search projects
    demoData.projects.forEach((pr) => {
      if (pr.name.toLowerCase().includes(q)) {
        hits.push({ type: 'Project', label: pr.name, sub: pr.team, path: '/projects' });
      }
    });

    // search decisions
    demoData.decisions.forEach((d) => {
      if (d.summary.toLowerCase().includes(q) || d.id.toLowerCase().includes(q)) {
        hits.push({ type: 'Decision', label: `${d.id}: ${d.summary}`, sub: d.maker, path: '/decisions' });
      }
    });

    // search risks
    demoData.risks.forEach((r) => {
      if (r.description.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)) {
        hits.push({ type: 'Risk', label: `${r.id}: ${r.description}`, sub: r.severity, path: '/risks' });
      }
    });

    setSearchResults(hits.slice(0, 6));
    setShowResults(true);
  };

  const handleSelectHit = (hit) => {
    setShowResults(false);
    setGlobalSearch('');
    navigate(hit.path);
  };

  return (
    <header className="h-14 glass-panel border-b border-white/10 px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Module Breadcrumb & Title */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-text-muted uppercase">
            <span>CBI</span>
            <span>/</span>
            <span className="text-cyan-analytical drop-shadow-[0_0_8px_rgba(93,214,245,0.4)]">
              {currentRoute.section}
            </span>
          </div>
          <h1 className="text-sm font-bold tracking-tight text-text-primary">
            {currentRoute.title}
          </h1>
        </div>
      </div>

      {/* Center: Global Graph Entity Search */}
      <div className="relative flex-1 max-w-md hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          type="text"
          placeholder="Global entity lookup (Person, Project, Decision, Risk)..."
          value={globalSearch}
          onChange={handleSearch}
          onFocus={() => globalSearch.trim() && setShowResults(true)}
          className="w-full glass-input rounded-md pl-9 pr-4 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-all"
        />

        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 glass-panel-elevated border border-white/10 rounded-lg shadow-2xl py-1 z-50 overflow-hidden divide-y divide-white/5">
            {searchResults.map((hit, i) => (
              <div
                key={i}
                onClick={() => handleSelectHit(hit)}
                className="px-3 py-2 hover:bg-white/[0.06] cursor-pointer flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-medium text-text-primary">{hit.label}</span>
                  <div className="text-[10px] text-text-muted">{hit.sub}</div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded glass-pill-cyan">
                  {hit.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Tools & Identity */}
      <div className="flex items-center gap-4">
        {/* Backend Heartbeat */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              isHealthy ? 'bg-green-intel shadow-[0_0_8px_#6EE7A8]' : 'bg-red-alert animate-ping shadow-[0_0_8px_#FF6577]'
            }`}
          />
          <span className="hidden sm:inline text-text-muted text-[11px]">
            {isHealthy ? 'API ONLINE' : 'API OFFLINE'}
          </span>
        </div>

        {/* Evidence Drawer Toggle */}
        <button
          onClick={toggleDrawer}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium border transition-all ${
            drawerOpen
              ? 'glass-pill-green shadow-[0_0_15px_rgba(110,231,168,0.2)]'
              : 'glass-card text-text-secondary hover:text-text-primary'
          }`}
          title="Toggle Context & Evidence Drawer"
        >
          <Layers size={14} />
          <span className="hidden sm:inline">Context Drawer</span>
        </button>

        {/* Analyst Identity */}
        <div className="flex items-center gap-2 pl-3 border-l border-white/10">
          <div className="w-7 h-7 rounded-full bg-white/[0.08] border border-green-intel/40 flex items-center justify-center font-mono text-[11px] font-bold text-green-intel shadow-[0_0_10px_rgba(110,231,168,0.2)]">
            SC
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-medium text-text-primary leading-tight">Sarah Chen</div>
            <div className="text-[10px] font-mono text-cyan-analytical">Lead Investigator</div>
          </div>
        </div>
      </div>
    </header>
  );
}
