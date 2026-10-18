import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  GitBranch,
  AlertTriangle,
  FileText,
  User,
  Box,
  Target,
  ChevronRight,
  Clock,
  ArrowRight,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { demoData } from '../mock/data';

function StatusBadge({ status }) {
  if (status === 'approved') {
    return <span className="glass-pill-green text-[11px] font-mono px-2 py-0.5 rounded-full font-medium">{status}</span>;
  }
  if (status === 'superseded') {
    return <span className="glass-pill-amber text-[11px] font-mono px-2 py-0.5 rounded-full font-medium">{status}</span>;
  }
  return <span className="glass-pill-cyan text-[11px] font-mono px-2 py-0.5 rounded-full font-medium">{status}</span>;
}

function SourceStatusBadge({ status }) {
  if (status === 'current') {
    return <span className="glass-pill-green text-[11px] font-mono px-2 py-0.5 rounded-full font-medium">{status}</span>;
  }
  return <span className="glass-pill-amber text-[11px] font-mono px-2 py-0.5 rounded-full font-medium line-through decoration-amber-tactical/60">{status}</span>;
}

function ProjectBadge({ project }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium glass-card text-text-primary border border-white/10 truncate max-w-[170px]">
      <Box className="w-3 h-3 mr-1.5 text-cyan-analytical flex-shrink-0" />
      {project}
    </span>
  );
}

/* ─── Decision Detail Panel ─── */
function DecisionDetailPanel({ decision, onClose, onInvestigate }) {
  if (!decision) return null;

  const person = demoData.people.find((p) => p.name === decision.maker);
  const relatedGoals = demoData.goals.filter((g) => g.projects.includes(decision.project));
  const relatedRisks = demoData.risks.filter((r) => r.project === decision.project);
  const supersededDecision = decision.supersedes
    ? demoData.decisions.find((d) => d.id === decision.supersedes)
    : null;

  return (
    <div className="w-[410px] flex-shrink-0 glass-panel-elevated border-l border-white/10 overflow-y-auto h-full flex flex-col shadow-2xl">
      {/* Header */}
      <div className="sticky top-0 glass-panel border-b border-white/10 px-5 py-4 flex items-center justify-between z-10 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-cyan-analytical" />
          <span className="text-lg font-mono font-bold text-cyan-analytical">{decision.id}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="px-5 py-4 space-y-4">
        {/* Summary & Status */}
        <div className="glass-card p-4 rounded-xl border border-white/10">
          <h3 className="text-text-primary font-bold text-base leading-snug">{decision.summary}</h3>
          <div className="mt-3 flex items-center gap-2">
            <StatusBadge status={decision.status} />
            <span className="text-text-muted text-xs font-mono flex items-center gap-1.5 ml-auto">
              <Clock className="w-3.5 h-3.5 text-cyan-analytical" />
              {decision.date}
            </span>
          </div>
        </div>

        {/* Decision Maker */}
        <div className="glass-card p-3.5 rounded-xl border border-white/10">
          <div className="text-text-muted text-[10px] font-mono uppercase tracking-wider mb-2 font-medium">Decision Maker (Graph: MADE_BY)</div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-cyan-analytical/10 border border-cyan-analytical/30 flex items-center justify-center">
              <User className="w-4 h-4 text-cyan-analytical" />
            </div>
            <div>
              <div className="text-text-primary text-sm font-semibold">{decision.maker}</div>
              {person && <div className="text-text-muted text-xs">{person.role}</div>}
            </div>
          </div>
        </div>

        {/* Affected Project */}
        <div className="glass-card p-3.5 rounded-xl border border-white/10">
          <div className="text-text-muted text-[10px] font-mono uppercase tracking-wider mb-2 font-medium">Affected Project (Graph: AFFECTS)</div>
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-green-intel" />
            <span className="text-text-primary text-sm font-medium">{decision.project}</span>
          </div>
        </div>

        {/* Source Document */}
        <div className="glass-card p-3.5 rounded-xl border border-white/10">
          <div className="text-text-muted text-[10px] font-mono uppercase tracking-wider mb-2 font-medium">Source Document (Graph: SOURCED_FROM)</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-analytical" />
              <span className="text-text-primary text-sm">{decision.source}</span>
            </div>
            <SourceStatusBadge status={decision.sourceStatus} />
          </div>
        </div>

        {/* Superseded Source Warning */}
        {decision.sourceStatus === 'superseded' && (
          <div className="glass-pill-amber p-3.5 rounded-xl flex items-start gap-2.5 shadow-[0_0_15px_rgba(242,184,75,0.15)]">
            <AlertTriangle className="w-4 h-4 text-amber-tactical flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <div className="text-amber-tactical text-xs font-bold font-mono uppercase tracking-wider">Provenance Warning</div>
              <div className="text-amber-tactical/90 text-xs mt-1 leading-relaxed">
                Source RFC <span className="font-semibold underline">{decision.source}</span> is marked superseded in FalkorDB. This decision's technical premises are vulnerable.
              </div>
            </div>
          </div>
        )}

        {/* Supersedes */}
        {supersededDecision && (
          <div className="glass-card p-3.5 rounded-xl border border-amber-tactical/30 bg-amber-tactical/5">
            <div className="text-amber-tactical text-[10px] font-mono uppercase tracking-wider mb-2 font-semibold">Evolution Chain: SUPERSEDES</div>
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-amber-tactical" />
              <span className="font-mono text-amber-tactical text-xs font-bold">{supersededDecision.id}</span>
              <span className="text-text-secondary text-xs truncate">— {supersededDecision.summary}</span>
            </div>
          </div>
        )}

        {/* Related Goals */}
        {relatedGoals.length > 0 && (
          <div className="glass-card p-3.5 rounded-xl border border-white/10 space-y-2">
            <div className="text-text-muted text-[10px] font-mono uppercase tracking-wider font-medium flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-green-intel" />
              Impact Chain: SUPPORTS Goal
            </div>
            <div className="space-y-1.5">
              {relatedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-2.5 rounded-lg bg-black/30 border border-white/5 flex items-start gap-2"
                >
                  <span className="font-mono text-green-intel text-xs font-bold mt-0.5">{goal.id}</span>
                  <div>
                    <div className="text-text-primary text-xs font-semibold">{goal.name}</div>
                    <div className="text-text-muted text-[10px]">{goal.quarter} · {goal.owner}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Risks */}
        {relatedRisks.length > 0 && (
          <div className="glass-card p-3.5 rounded-xl border border-white/10 space-y-2">
            <div className="text-text-muted text-[10px] font-mono uppercase tracking-wider font-medium flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-red-alert" />
              Threatened Risks
            </div>
            <div className="space-y-1.5">
              {relatedRisks.map((risk) => (
                <div
                  key={risk.id}
                  className="p-2.5 rounded-lg bg-black/30 border border-white/5 flex items-start gap-2"
                >
                  <span
                    className={`font-mono text-xs font-bold mt-0.5 ${
                      risk.severity === 'High'
                        ? 'text-red-alert'
                        : risk.severity === 'Medium'
                        ? 'text-amber-tactical'
                        : 'text-text-secondary'
                    }`}
                  >
                    {risk.id}
                  </span>
                  <div>
                    <div className="text-text-primary text-xs font-semibold">{risk.description}</div>
                    <div className="text-text-muted text-[10px]">
                      Severity: {risk.severity} · Status: {risk.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agent Workbench Link */}
        <div className="pt-2">
          <button
            onClick={() => onInvestigate && onInvestigate(decision)}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl glass-button-primary text-xs font-bold"
          >
            <ExternalLink className="w-4 h-4" />
            Investigate in Agent Workbench
          </button>
        </div>
      </div>
    </div>
  );
}


/* ─── Decision Evolution Timeline ─── */
function DecisionEvolutionTimeline() {
  // Build supersession chains
  const chains = useMemo(() => {
    const supersededMap = {};
    demoData.decisions.forEach((d) => {
      if (d.supersedes) {
        supersededMap[d.supersedes] = d;
      }
    });

    // Find chain roots (decisions that are superseded but don't supersede anything)
    const chainRoots = demoData.decisions.filter(
      (d) => supersededMap[d.id] && !d.supersedes
    );

    const result = [];
    chainRoots.forEach((root) => {
      const chain = [root];
      let current = root;
      while (supersededMap[current.id]) {
        current = supersededMap[current.id];
        chain.push(current);
      }
      result.push(chain);
    });

    return result;
  }, []);

  if (chains.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl p-5 mt-6 border border-white/10 shadow-2xl">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-4 h-4 text-cyan-analytical" />
        <h3 className="text-text-primary font-bold text-sm">Decision Evolution Provenance Chain</h3>
        <span className="text-text-muted text-xs font-mono">— FalkorDB SUPERSEDES relationship</span>
      </div>

      {chains.map((chain, ci) => (
        <div key={ci} className="flex items-center gap-3 overflow-x-auto pb-2">
          {chain.map((d, di) => {
            const isCurrent = d.status !== 'superseded';
            const borderColor = isCurrent ? 'border-green-intel/40 shadow-[0_0_15px_rgba(110,231,168,0.15)]' : 'border-amber-tactical/40 shadow-[0_0_15px_rgba(242,184,75,0.15)]';
            const bgColor = isCurrent ? 'glass-card bg-green-intel/5' : 'glass-card bg-amber-tactical/5';
            const accentColor = isCurrent ? 'text-green-intel' : 'text-amber-tactical';
            const dotColor = isCurrent ? 'bg-green-intel shadow-[0_0_8px_#6EE7A8]' : 'bg-amber-tactical shadow-[0_0_8px_#F2B84B]';

            return (
              <div key={d.id} className="flex items-center gap-3">
                <div className={`relative rounded-xl border ${borderColor} ${bgColor} px-4 py-3 min-w-[210px] backdrop-blur-md`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                    <span className={`font-mono font-bold text-sm ${accentColor}`}>{d.id}</span>
                    <StatusBadge status={d.status} />
                  </div>
                  <div className="text-text-primary text-xs font-medium leading-snug line-clamp-2">{d.summary}</div>
                  <div className="text-text-muted text-[10px] font-mono mt-2">{d.date}</div>
                </div>
                {di < chain.length - 1 && (
                  <div className="flex items-center gap-1 text-cyan-analytical/70 flex-shrink-0">
                    <div className="w-6 h-px bg-cyan-analytical/30" />
                    <ArrowRight className="w-4 h-4 text-cyan-analytical" />
                    <div className="w-6 h-px bg-cyan-analytical/30" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ─── */
export default function DecisionExplorer() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDecision, setSelectedDecision] = useState(demoData.decisions[0]);
  const [filterProject, setFilterProject] = useState('');

  const uniqueProjects = useMemo(
    () => [...new Set(demoData.decisions.map((d) => d.project))],
    []
  );

  const filteredDecisions = useMemo(() => {
    return demoData.decisions.filter((d) => {
      const matchesSearch =
        !searchQuery ||
        d.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.maker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesProject = !filterProject || d.project === filterProject;

      return matchesSearch && matchesProject;
    });
  }, [searchQuery, filterProject]);

  const handleInvestigate = (decision) => {
    navigate(`/agent?q=${encodeURIComponent(`Why did we decide ${decision.id}?`)}`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="glass-panel px-6 py-4 border-b border-white/10 rounded-2xl mb-4 shadow-xl">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-cyan-analytical" />
                Decision Explorer & Provenance Registry
              </h1>
              <span className="glass-pill-amber px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold">
                DEMO DATA
              </span>
            </div>
            <p className="text-text-muted text-xs mt-1">
              Browse, search, and trace organizational decisions, superseded records, and impact chains in FalkorDB.
            </p>
          </div>
          <div className="text-text-muted text-xs font-mono glass-card px-3 py-1.5 rounded-lg border border-white/10">
            <span className="text-cyan-analytical font-bold">{demoData.decisions.length}</span> decisions tracked
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-analytical/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search decisions by summary, maker, project, or ID…"
              className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-text-primary text-sm placeholder:text-text-muted focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-3.5 py-2 rounded-xl glass-input text-text-secondary text-sm focus:outline-none appearance-none pr-9 cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.6rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.2em 1.2em',
            }}
          >
            <option value="" className="bg-[#111923]">All Projects</option>
            {uniqueProjects.map((p) => (
              <option key={p} value={p} className="bg-[#111923]">
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content: Table + Detail Panel */}
      <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
        {/* Decision Table */}
        <div className="flex-1 overflow-auto flex flex-col gap-4">
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <div className="min-w-[850px]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 backdrop-blur-md">
                    <th className="text-left px-4 py-3 text-text-muted text-[11px] font-mono uppercase tracking-wider">ID</th>
                    <th className="text-left px-4 py-3 text-text-muted text-[11px] font-mono uppercase tracking-wider">Summary</th>
                    <th className="text-left px-4 py-3 text-text-muted text-[11px] font-mono uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-text-muted text-[11px] font-mono uppercase tracking-wider">Maker</th>
                    <th className="text-left px-4 py-3 text-text-muted text-[11px] font-mono uppercase tracking-wider">Project</th>
                    <th className="text-left px-4 py-3 text-text-muted text-[11px] font-mono uppercase tracking-wider">Source</th>
                    <th className="text-left px-4 py-3 text-text-muted text-[11px] font-mono uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredDecisions.map((d) => {
                    const isSelected = selectedDecision?.id === d.id;
                    return (
                      <tr
                        key={d.id}
                        onClick={() => setSelectedDecision(d)}
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-analytical/10 border-l-[3px] border-cyan-analytical shadow-[inset_0_0_20px_rgba(93,214,245,0.08)]'
                            : 'glass-table-row border-l-[3px] border-transparent'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-cyan-analytical font-bold">{d.id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-text-primary text-sm font-medium max-w-[270px] truncate">{d.summary}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-text-muted">{d.date}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-text-secondary text-sm font-medium">{d.maker}</span>
                        </td>
                        <td className="px-4 py-3">
                          <ProjectBadge project={d.project} />
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-text-muted text-xs truncate max-w-[140px] block">{d.source}</span>
                        </td>
                        <td className="px-4 py-3">
                          <SourceStatusBadge status={d.sourceStatus} />
                        </td>
                      </tr>
                    );
                  })}
                  {filteredDecisions.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-4 py-12 text-center">
                        <div className="text-text-muted text-sm">No decisions match your filters</div>
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setFilterProject('');
                          }}
                          className="text-cyan-analytical text-xs mt-2 hover:underline font-mono"
                        >
                          Clear all filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Evolution Timeline */}
          <DecisionEvolutionTimeline />
        </div>

        {/* Decision Detail Panel */}
        {selectedDecision && (
          <DecisionDetailPanel
            decision={selectedDecision}
            onClose={() => setSelectedDecision(null)}
            onInvestigate={handleInvestigate}
          />
        )}
      </div>
    </div>
  );
}
