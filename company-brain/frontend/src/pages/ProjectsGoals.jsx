import { useState, useMemo } from 'react';
import {
  Box,
  Target,
  Users,
  ShieldAlert,
  GitBranch,
  FileText,
  ChevronRight,
  X,
  Layers,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { demoData } from '../mock/data';

const statusConfig = {
  in_progress: {
    label: 'In Progress',
    color: 'text-green-intel',
    bg: 'bg-green-intel/15',
    border: 'border-green-intel/30',
  },
  planned: {
    label: 'Planned',
    color: 'text-cyan-analytical',
    bg: 'bg-cyan-analytical/15',
    border: 'border-cyan-analytical/30',
  },
  completed: {
    label: 'Completed',
    color: 'text-text-muted',
    bg: 'bg-surface-elevated',
    border: 'border-border-default',
  },
};

export default function ProjectsGoals() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'goals'
  const [selectedProject, setSelectedProject] = useState(demoData.projects[0]);
  const [detailTab, setDetailTab] = useState('decisions'); // 'decisions' | 'people' | 'goals' | 'risks'
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredProjects = useMemo(() => {
    return demoData.projects.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Compute stats for selected project
  const projectDecisions = useMemo(() => {
    if (!selectedProject) return [];
    return demoData.decisions.filter((d) => d.project === selectedProject.name);
  }, [selectedProject]);

  const projectRisks = useMemo(() => {
    if (!selectedProject) return [];
    return demoData.risks.filter((r) => r.project === selectedProject.name);
  }, [selectedProject]);

  const projectGoals = useMemo(() => {
    if (!selectedProject) return [];
    return demoData.goals.filter((g) => g.projects?.includes(selectedProject.name));
  }, [selectedProject]);

  const projectTeamMembers = useMemo(() => {
    if (!selectedProject) return [];
    return demoData.people.filter((p) => p.team === selectedProject.team);
  }, [selectedProject]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Project & Goal Intelligence
            </h1>
            <span className="px-2 py-0.5 text-xs font-mono font-medium tracking-wide uppercase bg-amber-tactical/15 text-amber-tactical border border-amber-tactical/30 rounded">
              Demo Data
            </span>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Track portfolio objectives, impact chains from Decisions → Projects → Goals, and threatened risks.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-panel-bg border border-border-default p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-surface-elevated text-green-intel shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Project Portfolio ({demoData.projects.length})
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'goals'
                ? 'bg-surface-elevated text-cyan-analytical shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Strategic Goals ({demoData.goals.length})
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Projects Grid */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Filter projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-panel-bg border border-border-default rounded-md pl-9 pr-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green-intel"
                />
              </div>
              <span className="text-xs text-text-muted font-mono">
                Showing {filteredProjects.length} of {demoData.projects.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((p) => {
                const isSelected = selectedProject?.name === p.name;
                const status = statusConfig[p.status] || statusConfig.in_progress;
                const dCount = demoData.decisions.filter((d) => d.project === p.name).length;
                const rCount = demoData.risks.filter((r) => r.project === p.name).length;
                const supportedGoals = demoData.goals.filter((g) => g.projects?.includes(p.name));

                return (
                  <div
                    key={p.name}
                    onClick={() => setSelectedProject(p)}
                    className={`bg-panel-bg border rounded-lg p-5 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-green-intel bg-surface-elevated shadow-lg shadow-green-intel/5'
                        : 'border-border-default hover:border-border-default/80 hover:bg-surface-elevated/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Box className="w-5 h-5 text-cyan-analytical flex-shrink-0" />
                        <h3 className="font-bold text-sm text-text-primary leading-tight">
                          {p.name}
                        </h3>
                      </div>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${status.bg} ${status.color} ${status.border} flex-shrink-0`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary line-clamp-2 mb-4">
                      {p.description || 'Enterprise strategic initiative'}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-border-default/60 pt-3 mb-3 text-text-muted">
                      <div>
                        Team: <span className="text-text-primary font-sans">{p.team}</span>
                      </div>
                      <div>
                        Budget: <span className="text-text-primary">{p.budget}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border-default/40">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-amber-tactical font-mono text-[11px]">
                          <GitBranch className="w-3.5 h-3.5" />
                          {dCount} Dec
                        </span>
                        <span className="flex items-center gap-1 text-red-alert font-mono text-[11px]">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {rCount} Risk
                        </span>
                      </div>
                      {supportedGoals.length > 0 && (
                        <span className="text-[10px] font-mono text-green-intel flex items-center gap-1 truncate max-w-[120px]">
                          <Target className="w-3 h-3 flex-shrink-0" />
                          {supportedGoals[0].id}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Project Detail Inspector */}
          <div className="lg:col-span-5 bg-panel-bg border border-border-default rounded-lg p-5 space-y-5">
            {selectedProject ? (
              <>
                <div className="border-b border-border-default pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-widest text-text-muted">
                        Project Intelligence Inspector
                      </span>
                      <h2 className="text-xl font-bold text-text-primary mt-1">
                        {selectedProject.name}
                      </h2>
                    </div>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded border ${
                        statusConfig[selectedProject.status]?.bg || 'bg-surface-elevated'
                      } ${statusConfig[selectedProject.status]?.color || 'text-text-primary'} ${
                        statusConfig[selectedProject.status]?.border || 'border-border-default'
                      }`}
                    >
                      {selectedProject.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mt-2">{selectedProject.description}</p>
                  <div className="flex items-center gap-4 text-xs font-mono text-text-muted mt-3">
                    <div>
                      Team: <span className="text-text-primary font-sans">{selectedProject.team}</span>
                    </div>
                    <div>
                      Budget: <span className="text-green-intel">{selectedProject.budget}</span>
                    </div>
                  </div>
                </div>

                {/* Sub-tabs */}
                <div className="flex border-b border-border-default gap-4 text-xs font-mono uppercase tracking-wider">
                  <button
                    onClick={() => setDetailTab('decisions')}
                    className={`pb-2 border-b-2 transition-colors ${
                      detailTab === 'decisions'
                        ? 'border-amber-tactical text-amber-tactical'
                        : 'border-transparent text-text-muted hover:text-text-primary'
                    }`}
                  >
                    Decisions ({projectDecisions.length})
                  </button>
                  <button
                    onClick={() => setDetailTab('people')}
                    className={`pb-2 border-b-2 transition-colors ${
                      detailTab === 'people'
                        ? 'border-cyan-analytical text-cyan-analytical'
                        : 'border-transparent text-text-muted hover:text-text-primary'
                    }`}
                  >
                    Team ({projectTeamMembers.length})
                  </button>
                  <button
                    onClick={() => setDetailTab('goals')}
                    className={`pb-2 border-b-2 transition-colors ${
                      detailTab === 'goals'
                        ? 'border-green-intel text-green-intel'
                        : 'border-transparent text-text-muted hover:text-text-primary'
                    }`}
                  >
                    Goals ({projectGoals.length})
                  </button>
                  <button
                    onClick={() => setDetailTab('risks')}
                    className={`pb-2 border-b-2 transition-colors ${
                      detailTab === 'risks'
                        ? 'border-red-alert text-red-alert'
                        : 'border-transparent text-text-muted hover:text-text-primary'
                    }`}
                  >
                    Risks ({projectRisks.length})
                  </button>
                </div>

                {/* Tab content */}
                <div className="space-y-3 min-h-[220px]">
                  {detailTab === 'decisions' && (
                    <div className="space-y-2">
                      {projectDecisions.map((d) => (
                        <div
                          key={d.id}
                          onClick={() => navigate('/decisions')}
                          className="p-3 rounded bg-surface-elevated border border-border-default hover:border-amber-tactical/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-cyan-analytical">{d.id}</span>
                            <span className="font-mono text-text-muted">{d.date}</span>
                          </div>
                          <div className="text-xs font-semibold text-text-primary mt-1">
                            {d.summary}
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-text-muted mt-2">
                            <span>By: {d.maker}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded font-mono ${
                                d.sourceStatus === 'superseded'
                                  ? 'text-amber-tactical bg-amber-tactical/10'
                                  : 'text-green-intel bg-green-intel/10'
                              }`}
                            >
                              {d.sourceStatus} source
                            </span>
                          </div>
                        </div>
                      ))}
                      {projectDecisions.length === 0 && (
                        <p className="text-xs text-text-muted italic py-6 text-center">
                          No direct decisions recorded for this project.
                        </p>
                      )}
                    </div>
                  )}

                  {detailTab === 'people' && (
                    <div className="space-y-2">
                      {projectTeamMembers.map((m) => (
                        <div
                          key={m.name}
                          onClick={() => navigate('/people')}
                          className="p-2.5 rounded bg-surface-elevated border border-border-default hover:border-cyan-analytical/50 cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <div>
                            <div className="text-xs font-bold text-text-primary">{m.name}</div>
                            <div className="text-[11px] text-text-muted">{m.role}</div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated text-cyan-analytical border border-border-default">
                            {m.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {detailTab === 'goals' && (
                    <div className="space-y-2">
                      {projectGoals.map((g) => (
                        <div
                          key={g.id}
                          className="p-3 rounded bg-surface-elevated border border-green-intel/30 space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-green-intel">{g.id}</span>
                            <span className="font-mono text-text-muted">{g.quarter}</span>
                          </div>
                          <div className="text-xs font-bold text-text-primary">{g.name}</div>
                          <div className="text-[11px] text-text-muted">Owner: {g.owner}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {detailTab === 'risks' && (
                    <div className="space-y-2">
                      {projectRisks.map((r) => (
                        <div
                          key={r.id}
                          onClick={() => navigate('/risks')}
                          className="p-3 rounded bg-surface-elevated border border-red-alert/30 hover:border-red-alert cursor-pointer transition-colors space-y-1"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-red-alert">{r.id}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-alert/15 text-red-alert border border-red-alert/30">
                              {r.severity} Severity
                            </span>
                          </div>
                          <p className="text-xs text-text-primary font-medium">{r.description}</p>
                          <div className="text-[10px] font-mono text-text-muted">
                            Status: <span className="text-amber-tactical">{r.status}</span>
                          </div>
                        </div>
                      ))}
                      {projectRisks.length === 0 && (
                        <p className="text-xs text-text-muted italic py-6 text-center">
                          No open risks currently recorded against this project.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Agent Action Button */}
                <button
                  onClick={() =>
                    navigate(
                      `/agent?q=${encodeURIComponent(
                        `Show me the full decision and risk impact for ${selectedProject.name}`
                      )}`
                    )
                  }
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-green-intel/15 text-green-intel border border-green-intel/30 hover:bg-green-intel/20 font-medium text-sm transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Investigate Impact in Agent Workbench
                </button>
              </>
            ) : (
              <div className="text-center py-12 text-text-muted text-sm">
                Select a project card to inspect connections
              </div>
            )}
          </div>
        </div>
      )}

      {/* GOALS TAB */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="bg-panel-bg border border-border-default rounded-lg p-5">
            <h2 className="text-base font-semibold text-text-primary mb-1">
              Corporate Impact Chain: Decisions → Projects → Goals
            </h2>
            <p className="text-xs text-text-muted mb-6">
              Visualizes how architectural choices and projects support top-level organizational objectives in the FalkorDB knowledge graph.
            </p>

            <div className="space-y-6">
              {demoData.goals.map((goal) => {
                const supportingProjects = demoData.projects.filter((p) =>
                  goal.projects?.includes(p.name)
                );

                return (
                  <div
                    key={goal.id}
                    className="bg-surface-elevated/60 border border-border-default rounded-lg p-5 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border-default pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-green-intel/15 border border-green-intel/30 flex items-center justify-center text-green-intel font-mono font-bold text-xs">
                          {goal.id}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-text-primary">{goal.name}</h3>
                          <p className="text-xs text-text-muted">
                            Quarter: <span className="font-mono text-cyan-analytical">{goal.quarter}</span> • Owner: {goal.owner}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-green-intel bg-green-intel/10 border border-green-intel/20 px-2.5 py-1 rounded w-fit">
                        {supportingProjects.length} Supporting Project(s)
                      </span>
                    </div>

                    {/* Impact chain flow */}
                    <div className="space-y-3 pl-2">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
                        Supporting Graph Traversals (Edge: SUPPORTS)
                      </div>

                      {supportingProjects.map((proj) => {
                        const decisions = demoData.decisions.filter((d) => d.project === proj.name);
                        const risks = demoData.risks.filter((r) => r.project === proj.name);

                        return (
                          <div
                            key={proj.name}
                            className="bg-panel-bg border border-border-default rounded-md p-4 space-y-3"
                          >
                            <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                              <Box className="w-4 h-4 text-cyan-analytical" />
                              <span>{proj.name}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
                              <span className="text-green-intel text-xs font-mono">SUPPORTS {goal.id}</span>
                            </div>

                            {/* Decisions feeding this project */}
                            {decisions.length > 0 && (
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="text-text-muted font-mono text-[11px]">Decisions:</span>
                                {decisions.map((d) => (
                                  <span
                                    key={d.id}
                                    onClick={() => navigate('/decisions')}
                                    className="px-2 py-0.5 rounded bg-surface-elevated text-amber-tactical border border-border-default cursor-pointer hover:border-amber-tactical font-mono text-[11px]"
                                  >
                                    {d.id}: {d.summary}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Risks threatening this project */}
                            {risks.length > 0 && (
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="text-text-muted font-mono text-[11px]">Threatened by:</span>
                                {risks.map((r) => (
                                  <span
                                    key={r.id}
                                    onClick={() => navigate('/risks')}
                                    className="px-2 py-0.5 rounded bg-red-alert/15 text-red-alert border border-red-alert/30 cursor-pointer hover:border-red-alert font-mono text-[11px]"
                                  >
                                    {r.id}: {r.description}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
