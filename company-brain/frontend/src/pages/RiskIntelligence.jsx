import { useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Shield,
  Target,
  Box,
  X,
  Search,
  Filter,
  ChevronRight,
  ArrowRight,
  GitBranch,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { demoData } from '../mock/data';

const severityBadge = {
  High: 'bg-red-alert/15 text-red-alert border-red-alert/40',
  Medium: 'bg-amber-tactical/15 text-amber-tactical border-amber-tactical/40',
  Low: 'bg-green-intel/15 text-green-intel border-green-intel/40',
};

const statusBadge = {
  open: 'bg-red-alert/10 text-red-alert border-red-alert/30',
  mitigated: 'bg-green-intel/10 text-green-intel border-green-intel/30',
};

export default function RiskIntelligence() {
  const [selectedRisk, setSelectedRisk] = useState(demoData.risks[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  // Metrics computation
  const totalRisks = demoData.risks.length;
  const openHigh = demoData.risks.filter(
    (r) => r.severity === 'High' && r.status === 'open'
  ).length;
  const openCount = demoData.risks.filter((r) => r.status === 'open').length;
  const projectsAtRisk = new Set(
    demoData.risks.filter((r) => r.status === 'open').map((r) => r.project)
  ).size;

  const filteredRisks = useMemo(() => {
    return demoData.risks.filter((r) => {
      const matchSearch =
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.project.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSev = severityFilter === 'all' || r.severity === severityFilter;
      const matchStat = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchSev && matchStat;
    });
  }, [searchQuery, severityFilter, statusFilter]);

  // Contextual items for selected risk
  const threatenedProject = useMemo(() => {
    if (!selectedRisk) return null;
    return demoData.projects.find((p) => p.name === selectedRisk.project);
  }, [selectedRisk]);

  const threatenedGoals = useMemo(() => {
    if (!selectedRisk) return [];
    return demoData.goals.filter((g) => g.projects?.includes(selectedRisk.project));
  }, [selectedRisk]);

  const relatedDecisions = useMemo(() => {
    if (!selectedRisk) return [];
    return demoData.decisions.filter((d) => d.project === selectedRisk.project);
  }, [selectedRisk]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Risk Intelligence Command
            </h1>
            <span className="px-2 py-0.5 text-xs font-mono font-medium tracking-wide uppercase bg-amber-tactical/15 text-amber-tactical border border-amber-tactical/30 rounded">
              Demo Data
            </span>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Analyze graph risk paths (Risk → THREATENS → Project → SUPPORTS → Goal) and detect stale evidence vulnerabilities.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-panel-bg border border-border-default rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-text-muted text-xs font-mono">
            <span>TOTAL RISKS</span>
            <Shield className="w-4 h-4 text-cyan-analytical" />
          </div>
          <div className="text-2xl font-bold font-mono text-text-primary">{totalRisks}</div>
          <p className="text-[11px] text-text-muted">Recorded in graph</p>
        </div>

        <div className="bg-panel-bg border border-red-alert/40 rounded-lg p-4 space-y-1 bg-red-alert/5">
          <div className="flex items-center justify-between text-red-alert text-xs font-mono">
            <span>HIGH SEVERITY OPEN</span>
            <ShieldAlert className="w-4 h-4 text-red-alert" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-alert">{openHigh}</div>
          <p className="text-[11px] text-red-alert/80">Immediate attention needed</p>
        </div>

        <div className="bg-panel-bg border border-border-default rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-text-muted text-xs font-mono">
            <span>TOTAL OPEN</span>
            <AlertTriangle className="w-4 h-4 text-amber-tactical" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-tactical">{openCount}</div>
          <p className="text-[11px] text-text-muted">Unmitigated risks</p>
        </div>

        <div className="bg-panel-bg border border-border-default rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-text-muted text-xs font-mono">
            <span>PROJECTS AT RISK</span>
            <Box className="w-4 h-4 text-green-intel" />
          </div>
          <div className="text-2xl font-bold font-mono text-green-intel">{projectsAtRisk}</div>
          <p className="text-[11px] text-text-muted">Portfolio exposure</p>
        </div>
      </div>

      {/* Severity distribution bar */}
      <div className="bg-panel-bg border border-border-default rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-text-muted">
          <span>RISK SEVERITY DISTRIBUTION</span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-alert" /> High (2)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-tactical" /> Medium (1)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-intel" /> Low (1)
            </span>
          </div>
        </div>
        <div className="w-full h-2.5 rounded-full bg-surface-elevated overflow-hidden flex">
          <div className="h-full bg-red-alert w-1/2" title="High (50%)" />
          <div className="h-full bg-amber-tactical w-1/4" title="Medium (25%)" />
          <div className="h-full bg-green-intel w-1/4" title="Low (25%)" />
        </div>
      </div>

      {/* Main Grid: Table + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table (Left) */}
        <div className="lg:col-span-7 bg-panel-bg border border-border-default rounded-lg overflow-hidden space-y-3">
          <div className="p-4 border-b border-border-default flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search risks, IDs, projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-elevated border border-border-default rounded-md pl-9 pr-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green-intel"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-surface-elevated border border-border-default rounded-md px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-green-intel"
              >
                <option value="all">All Severities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface-elevated border border-border-default rounded-md px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-green-intel"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="mitigated">Mitigated</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-default/60 bg-bg-secondary text-[11px] font-mono uppercase tracking-wider text-text-muted">
                  <th className="py-2.5 px-4">ID</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4">Threatened Project</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/40 text-sm">
                {filteredRisks.map((r) => {
                  const isSelected = selectedRisk?.id === r.id;
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRisk(r)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-surface-elevated border-l-2 border-l-red-alert'
                          : 'hover:bg-surface-elevated/50'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-red-alert text-xs">
                        {r.id}
                      </td>
                      <td className="py-3 px-3 font-medium text-text-primary max-w-xs">
                        {r.description}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono border ${
                            severityBadge[r.severity] || severityBadge.Low
                          }`}
                        >
                          {r.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono uppercase border ${
                            statusBadge[r.status] || statusBadge.open
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-cyan-analytical">
                        {r.project}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel (Right) */}
        <div className="lg:col-span-5 bg-panel-bg border border-border-default rounded-lg p-5 space-y-5">
          {selectedRisk ? (
            <>
              <div className="border-b border-border-default pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-lg font-bold text-red-alert">
                    {selectedRisk.id}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-mono border ${
                        severityBadge[selectedRisk.severity] || severityBadge.Low
                      }`}
                    >
                      {selectedRisk.severity} Severity
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-mono uppercase border ${
                        statusBadge[selectedRisk.status] || statusBadge.open
                      }`}
                    >
                      {selectedRisk.status}
                    </span>
                  </div>
                </div>
                <h2 className="text-base font-bold text-text-primary leading-snug">
                  {selectedRisk.description}
                </h2>
              </div>

              {/* Threatened Project */}
              <div className="bg-surface-elevated/70 border border-border-default rounded-md p-3 space-y-1.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-cyan-analytical" />
                  Threatened Project (Edge: THREATENS)
                </div>
                <div className="text-sm font-semibold text-text-primary flex items-center justify-between">
                  <span>{selectedRisk.project}</span>
                  <span className="text-xs text-text-muted font-mono">
                    {threatenedProject?.team}
                  </span>
                </div>
              </div>

              {/* Threatened Goals Chain */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-green-intel" />
                  Goals Exposed via Project Impact Chain
                </div>
                {threatenedGoals.length > 0 ? (
                  <div className="space-y-2">
                    {threatenedGoals.map((g) => (
                      <div
                        key={g.id}
                        className="p-2.5 rounded bg-surface-elevated border border-green-intel/20 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-green-intel">{g.id}</span>
                          <span className="font-mono text-text-muted">{g.quarter}</span>
                        </div>
                        <p className="font-medium text-text-primary">{g.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted italic bg-surface-elevated/40 p-2.5 rounded">
                    No direct top-level goal linked to this project in current graph data.
                  </p>
                )}
              </div>

              {/* Related Decisions */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-amber-tactical" />
                  Related Project Decisions ({relatedDecisions.length})
                </div>
                {relatedDecisions.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => navigate('/decisions')}
                    className="p-2.5 rounded bg-surface-elevated border border-border-default hover:border-amber-tactical/50 cursor-pointer text-xs space-y-1 transition-colors"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="font-bold text-cyan-analytical">{d.id}</span>
                      <span className="text-text-muted">{d.date}</span>
                    </div>
                    <div className="font-medium text-text-primary">{d.summary}</div>
                  </div>
                ))}
              </div>

              {/* Investigate Action */}
              <button
                onClick={() =>
                  navigate(
                    `/agent?q=${encodeURIComponent(
                      `What are the risks on ${selectedRisk.project} and which goals do they block?`
                    )}`
                  )
                }
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-red-alert/15 text-red-alert border border-red-alert/30 hover:bg-red-alert/20 font-medium text-sm transition-colors"
              >
                <Search className="w-4 h-4" />
                Investigate Impact in Agent Workbench
              </button>
            </>
          ) : (
            <div className="text-center py-12 text-text-muted text-sm">
              Select a risk to inspect impact chain
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
