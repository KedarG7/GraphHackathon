import { useState, useMemo } from 'react';
import {
  Users,
  User,
  Search,
  X,
  Building,
  GitBranch,
  Box,
  Calendar,
  ChevronRight,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { demoData } from '../mock/data';

const levelColors = {
  'C-Suite': 'bg-green-intel/15 text-green-intel border-green-intel/30',
  VP: 'bg-cyan-analytical/15 text-cyan-analytical border-cyan-analytical/30',
  Director: 'bg-amber-tactical/15 text-amber-tactical border-amber-tactical/30',
  Staff: 'bg-cyan-analytical/15 text-cyan-analytical border-cyan-analytical/30',
  Senior: 'bg-surface-elevated text-text-secondary border-border-default',
};

export default function PeopleOrg() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(demoData.people[0]);
  const [selectedDept, setSelectedDept] = useState('all');
  const navigate = useNavigate();

  const departments = useMemo(() => {
    return ['all', ...new Set(demoData.people.map((p) => p.department))];
  }, []);

  const filteredPeople = useMemo(() => {
    return demoData.people.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.team.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = selectedDept === 'all' || p.department === selectedDept;
      return matchSearch && matchDept;
    });
  }, [searchQuery, selectedDept]);

  // Reporting lines from knowledge graph
  const getReportingLine = (person) => {
    if (person.name === 'Sarah Chen') return { reportsTo: 'CEO (Board)', isHead: true };
    if (person.name === 'Marcus Lee') return { reportsTo: 'CEO (Board)', isHead: true };
    if (person.name === 'Priya Nair') return { reportsTo: 'CEO (Board)', isHead: true };
    if (person.name === 'Elena Rossi') return { reportsTo: 'Head of People', isHead: false };
    if (person.name === 'Daniel Okafor') return { reportsTo: 'Sarah Chen (CTO)', isHead: false };
    if (person.name === 'Arjun Mehta') return { reportsTo: 'Sarah Chen (CTO)', isHead: false };
    if (person.name === 'Jessica Park') return { reportsTo: 'Marcus Lee (VP Product)', isHead: false };
    return { reportsTo: 'Direct Manager', isHead: false };
  };

  // Decisions made by person
  const personDecisions = useMemo(() => {
    if (!selectedPerson) return [];
    return demoData.decisions.filter((d) => d.maker === selectedPerson.name);
  }, [selectedPerson]);

  // Projects worked on or in team
  const personProjects = useMemo(() => {
    if (!selectedPerson) return [];
    return demoData.projects.filter(
      (p) => p.team === selectedPerson.team || (selectedPerson.name === 'Sarah Chen' && p.budget)
    );
  }, [selectedPerson]);

  // Meetings attended
  const personMeetings = useMemo(() => {
    if (!selectedPerson) return [];
    return demoData.meetings.filter((m) => m.attendees.includes(selectedPerson.name));
  }, [selectedPerson]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              People & Organization Intelligence
            </h1>
            <span className="px-2 py-0.5 text-xs font-mono font-medium tracking-wide uppercase bg-amber-tactical/15 text-amber-tactical border border-amber-tactical/30 rounded">
              Demo Data
            </span>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Explore reporting structures, decision ownership, project contributions, and organizational influence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search people, roles, teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-panel-bg border border-border-default rounded-md pl-9 pr-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green-intel transition-colors w-64"
            />
          </div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-panel-bg border border-border-default rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-green-intel transition-colors"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === 'all' ? 'All Departments' : d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Directory + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: People Directory Table */}
        <div className="lg:col-span-7 bg-panel-bg border border-border-default rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border-default flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-analytical" />
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider font-mono">
                Personnel Directory ({filteredPeople.length})
              </h2>
            </div>
            <span className="text-xs text-text-muted">Click row to inspect graph relationships</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-default/60 bg-bg-secondary text-[11px] font-mono uppercase tracking-wider text-text-muted">
                  <th className="py-2.5 px-4">Name</th>
                  <th className="py-2.5 px-3">Role & Level</th>
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-right">Tenure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/40 text-sm">
                {filteredPeople.map((p) => {
                  const isSelected = selectedPerson?.name === p.name;
                  const initials = p.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('');
                  return (
                    <tr
                      key={p.name}
                      onClick={() => setSelectedPerson(p)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-surface-elevated border-l-2 border-l-green-intel'
                          : 'hover:bg-surface-elevated/50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-elevated border border-border-default flex items-center justify-center font-mono text-xs font-semibold text-cyan-analytical">
                            {initials}
                          </div>
                          <div>
                            <div className="font-medium text-text-primary">{p.name}</div>
                            <div className="text-xs text-text-muted font-mono">{p.level}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-text-primary">{p.role}</div>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                            levelColors[p.level] || levelColors.Senior
                          } mt-0.5`}
                        >
                          {p.level}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-text-secondary">{p.team}</td>
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded bg-surface-elevated text-xs text-text-secondary border border-border-default">
                          {p.department}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs text-text-muted">
                        {p.tenure}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Person Detail Inspector */}
        <div className="lg:col-span-5 bg-panel-bg border border-border-default rounded-lg p-5 space-y-6">
          {selectedPerson ? (
            <>
              {/* Header Profile */}
              <div className="flex items-start justify-between border-b border-border-default pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-surface-elevated border border-cyan-analytical/40 flex items-center justify-center text-lg font-bold font-mono text-cyan-analytical">
                    {selectedPerson.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">{selectedPerson.name}</h2>
                    <p className="text-sm text-cyan-analytical font-mono">{selectedPerson.role}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {selectedPerson.team} • {selectedPerson.department}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-mono border ${
                    levelColors[selectedPerson.level] || levelColors.Senior
                  }`}
                >
                  {selectedPerson.level}
                </span>
              </div>

              {/* Reporting Line Provenance */}
              <div className="bg-surface-elevated/60 border border-border-default rounded-md p-3">
                <div className="text-xs font-mono uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-green-intel" />
                  Reporting Line (Graph Edge: REPORTS_TO)
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-text-primary">{selectedPerson.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
                  <span className="text-green-intel font-mono">
                    {getReportingLine(selectedPerson).reportsTo}
                  </span>
                </div>
              </div>

              {/* Decisions Made (MADE_BY) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-amber-tactical" />
                    Decisions Authored ({personDecisions.length})
                  </span>
                  <span className="text-[10px] text-text-muted">Edge: MADE_BY</span>
                </div>
                {personDecisions.length > 0 ? (
                  <div className="space-y-2">
                    {personDecisions.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => navigate(`/decisions`)}
                        className="p-2.5 rounded bg-surface-elevated border border-border-default hover:border-amber-tactical/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-cyan-analytical">
                            {d.id}
                          </span>
                          <span className="text-[11px] font-mono text-text-muted">{d.date}</span>
                        </div>
                        <p className="text-xs text-text-primary font-medium mt-1">{d.summary}</p>
                        <div className="text-[11px] text-text-muted mt-1">Affects: {d.project}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted italic bg-surface-elevated/40 p-2.5 rounded border border-border-default/40">
                    No primary leadership decisions recorded in the graph for this individual.
                  </p>
                )}
              </div>

              {/* Projects Connected */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-green-intel" />
                    Connected Projects ({personProjects.length})
                  </span>
                  <span className="text-[10px] text-text-muted">Edge: WORKED_ON / MEMBER_OF</span>
                </div>
                <div className="space-y-2">
                  {personProjects.map((proj) => (
                    <div
                      key={proj.name}
                      onClick={() => navigate('/projects')}
                      className="p-2.5 rounded bg-surface-elevated border border-border-default hover:border-green-intel/50 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-semibold text-text-primary">{proj.name}</div>
                        <div className="text-[11px] text-text-muted">{proj.team}</div>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-green-intel/10 text-green-intel border border-green-intel/20">
                        {proj.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meetings Logged */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-analytical" />
                    Documented Syncs ({personMeetings.length})
                  </span>
                  <span className="text-[10px] text-text-muted">Edge: DISCUSSED</span>
                </div>
                {personMeetings.map((m) => (
                  <div
                    key={m.id}
                    className="p-2 rounded bg-surface-elevated/50 border border-border-default text-xs"
                  >
                    <div className="flex items-center justify-between text-text-primary font-medium">
                      <span>{m.title}</span>
                      <span className="font-mono text-[10px] text-text-muted">{m.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={() =>
                  navigate(`/agent?q=${encodeURIComponent(`What does ${selectedPerson.name} work on?`)}`)
                }
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-green-intel/15 text-green-intel border border-green-intel/30 hover:bg-green-intel/20 font-medium text-sm transition-colors"
              >
                <Search className="w-4 h-4" />
                Investigate in Agent Workbench
              </button>
            </>
          ) : (
            <div className="text-center py-12 text-text-muted text-sm">
              Select a team member to inspect graph connections
            </div>
          )}
        </div>
      </div>

      {/* Organization Hierarchy Overview */}
      <div className="bg-panel-bg border border-border-default rounded-lg p-5">
        <div className="flex items-center justify-between mb-4 border-b border-border-default pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-green-intel" />
            <h2 className="text-sm font-semibold font-mono uppercase tracking-wider text-text-primary">
              Organizational Graph Hierarchy
            </h2>
          </div>
          <span className="text-xs text-text-muted font-mono">Department → Team → Personnel</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {demoData.departments.map((dept) => {
            const deptTeams = demoData.teams.filter((t) => t.department === dept.name);
            return (
              <div
                key={dept.name}
                className="bg-surface-elevated/60 border border-border-default rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-border-default/60 pb-2">
                  <h3 className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-cyan-analytical" />
                    {dept.name}
                  </h3>
                  <span className="text-[11px] font-mono text-text-muted">{dept.budget}</span>
                </div>

                {deptTeams.map((team) => {
                  const members = demoData.people.filter((p) => p.team === team.name);
                  return (
                    <div
                      key={team.name}
                      className="pl-2 border-l-2 border-border-default space-y-1.5"
                    >
                      <div className="text-xs font-semibold text-green-intel font-mono">
                        {team.name} ({members.length})
                      </div>
                      <div className="space-y-1">
                        {members.map((m) => (
                          <div
                            key={m.name}
                            onClick={() => setSelectedPerson(m)}
                            className="text-xs text-text-secondary hover:text-text-primary cursor-pointer flex items-center justify-between py-0.5 hover:bg-surface-elevated px-1.5 rounded transition-colors"
                          >
                            <span>{m.name}</span>
                            <span className="text-[10px] font-mono text-text-muted">{m.level}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
