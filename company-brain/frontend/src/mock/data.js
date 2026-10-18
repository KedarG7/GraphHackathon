/* ─── A.S.K — Agentic System of Knowledge — Demo / Seed Data ─── */

export const demoData = {
  people: [
    { name: 'Sarah Chen', role: 'CTO', level: 'C-Suite', tenure: '5 years', team: 'Platform Team', department: 'Engineering' },
    { name: 'Marcus Lee', role: 'VP Product', level: 'VP', tenure: '3 years', team: 'Growth Team', department: 'Product' },
    { name: 'Priya Nair', role: 'Head of Sales', level: 'Director', tenure: '2 years', team: 'Revenue Team', department: 'Sales' },
    { name: 'Daniel Okafor', role: 'Staff Engineer', level: 'Staff', tenure: '4 years', team: 'Platform Team', department: 'Engineering' },
    { name: 'Jessica Park', role: 'PM', level: 'Senior', tenure: '1 year', team: 'Growth Team', department: 'Product' },
    { name: 'Arjun Mehta', role: 'Backend Engineer', level: 'Senior', tenure: '2 years', team: 'Platform Team', department: 'Engineering' },
    { name: 'Elena Rossi', role: 'HR Business Partner', level: 'Senior', tenure: '3 years', team: 'People Team', department: 'People Ops' },
  ],

  teams: [
    { name: 'Platform Team', size: 6, department: 'Engineering' },
    { name: 'Growth Team', size: 4, department: 'Product' },
    { name: 'Revenue Team', size: 5, department: 'Sales' },
    { name: 'People Team', size: 3, department: 'People Ops' },
  ],

  departments: [
    { name: 'Engineering', budget: '$2.4M', headcount: 12 },
    { name: 'Product', budget: '$800K', headcount: 6 },
    { name: 'Sales', budget: '$1.2M', headcount: 8 },
    { name: 'People Ops', budget: '$400K', headcount: 4 },
  ],

  projects: [
    { name: 'Agent Memory Service', status: 'in_progress', budget: '$500K', team: 'Platform Team', description: 'Core memory service for AI agents' },
    { name: 'Infra Cost Migration', status: 'in_progress', budget: '$200K', team: 'Platform Team', description: 'Migrate infrastructure to reduce costs' },
    { name: 'Enterprise Sales Playbook', status: 'in_progress', budget: '$150K', team: 'Revenue Team', description: 'Standardize enterprise sales process' },
    { name: 'Q4 Engineering Hiring', status: 'planned', budget: '$300K', team: 'People Team', description: 'Hire 4 engineers for Q4' },
  ],

  decisions: [
    { id: 'D1', summary: 'Migrate to FalkorDB for graph workloads', date: '2025-03-15', status: 'approved', maker: 'Sarah Chen', project: 'Infra Cost Migration', source: 'Architecture Review Q4', sourceStatus: 'current' },
    { id: 'D2', summary: 'Keep legacy auth for enterprise SSO', date: '2025-06-01', status: 'approved', maker: 'Sarah Chen', project: 'Enterprise Sales Playbook', source: 'Legacy Auth Design', sourceStatus: 'superseded' },
    { id: 'D3', summary: 'Use Redis for agent memory caching', date: '2025-07-10', status: 'superseded', maker: 'Daniel Okafor', project: 'Agent Memory Service', source: 'Memory Architecture v1', sourceStatus: 'superseded' },
    { id: 'D4', summary: 'Adopt OpenTelemetry for observability', date: '2025-08-20', status: 'approved', maker: 'Daniel Okafor', project: 'Infra Cost Migration', source: 'Observability RFC', sourceStatus: 'current' },
    { id: 'D5', summary: 'Hire two backend engineers in Q4', date: '2025-09-01', status: 'approved', maker: 'Marcus Lee', project: 'Q4 Engineering Hiring', source: 'Hiring Plan Q4', sourceStatus: 'current' },
    { id: 'D6', summary: 'Switch agent memory from Redis to FalkorDB', date: '2025-09-15', status: 'approved', maker: 'Sarah Chen', project: 'Agent Memory Service', source: 'Memory Architecture v2', sourceStatus: 'current', supersedes: 'D3' },
  ],

  documents: [
    { title: 'Architecture Review Q4', type: 'RFC', status: 'current', owner: 'Sarah Chen' },
    { title: 'Legacy Auth Design', type: 'Design Doc', status: 'superseded', owner: 'Daniel Okafor' },
    { title: 'Memory Architecture v1', type: 'Design Doc', status: 'superseded', owner: 'Daniel Okafor' },
    { title: 'Memory Architecture v2', type: 'Design Doc', status: 'current', owner: 'Sarah Chen' },
    { title: 'Observability RFC', type: 'RFC', status: 'current', owner: 'Arjun Mehta' },
    { title: 'Hiring Plan Q4', type: 'Plan', status: 'current', owner: 'Elena Rossi' },
  ],

  risks: [
    { id: 'R1', description: 'SSO relies on superseded auth design', severity: 'High', status: 'open', project: 'Enterprise Sales Playbook' },
    { id: 'R2', description: 'FalkorDB migration may exceed Q4 budget', severity: 'Medium', status: 'open', project: 'Infra Cost Migration' },
    { id: 'R3', description: 'Agent Memory Service single point of failure', severity: 'High', status: 'open', project: 'Agent Memory Service' },
    { id: 'R4', description: 'Q4 hiring timeline too aggressive', severity: 'Low', status: 'mitigated', project: 'Q4 Engineering Hiring' },
  ],

  goals: [
    { id: 'G1', name: 'Reduce infrastructure costs by 30%', quarter: 'Q4 2025', owner: 'Sarah Chen', projects: ['Infra Cost Migration'] },
    { id: 'G2', name: 'Grow enterprise ARR to $20M', quarter: 'Q4 2025', owner: 'Priya Nair', projects: ['Enterprise Sales Playbook'] },
    { id: 'G3', name: 'Ship Agent Memory GA', quarter: 'Q4 2026', owner: 'Daniel Okafor', projects: ['Agent Memory Service'] },
  ],

  meetings: [
    { id: 'M1', title: 'Q4 Architecture Review', date: '2025-03-15', decisions: ['D1'], attendees: ['Sarah Chen', 'Daniel Okafor', 'Arjun Mehta'] },
    { id: 'M2', title: 'Enterprise SSO Planning', date: '2025-06-01', decisions: ['D2'], attendees: ['Sarah Chen', 'Priya Nair'] },
    { id: 'M3', title: 'Agent Memory Design Sprint', date: '2025-07-10', decisions: ['D3'], attendees: ['Daniel Okafor', 'Arjun Mehta', 'Jessica Park'] },
    { id: 'M4', title: 'Q4 Leadership Sync', date: '2025-09-15', decisions: ['D5', 'D6'], attendees: ['Sarah Chen', 'Marcus Lee', 'Priya Nair', 'Elena Rossi'] },
  ],

  /* Pre-built graph nodes & edges for React Flow */
  graphNodes: [
    { id: 'p-sarah', type: 'person', data: { label: 'Sarah Chen', role: 'CTO' }, position: { x: 400, y: 50 } },
    { id: 'p-marcus', type: 'person', data: { label: 'Marcus Lee', role: 'VP Product' }, position: { x: 100, y: 50 } },
    { id: 'p-priya', type: 'person', data: { label: 'Priya Nair', role: 'Head of Sales' }, position: { x: 700, y: 50 } },
    { id: 'p-daniel', type: 'person', data: { label: 'Daniel Okafor', role: 'Staff Engineer' }, position: { x: 400, y: 200 } },
    { id: 'p-jessica', type: 'person', data: { label: 'Jessica Park', role: 'PM' }, position: { x: 100, y: 200 } },
    { id: 'p-arjun', type: 'person', data: { label: 'Arjun Mehta', role: 'Backend Eng' }, position: { x: 250, y: 350 } },
    { id: 'p-elena', type: 'person', data: { label: 'Elena Rossi', role: 'HR BP' }, position: { x: 700, y: 200 } },

    { id: 'proj-ams', type: 'project', data: { label: 'Agent Memory Service', status: 'in_progress' }, position: { x: 300, y: 500 } },
    { id: 'proj-icm', type: 'project', data: { label: 'Infra Cost Migration', status: 'in_progress' }, position: { x: 550, y: 500 } },
    { id: 'proj-esp', type: 'project', data: { label: 'Enterprise Sales Playbook', status: 'in_progress' }, position: { x: 800, y: 500 } },
    { id: 'proj-q4h', type: 'project', data: { label: 'Q4 Engineering Hiring', status: 'planned' }, position: { x: 50, y: 500 } },

    { id: 'd-D1', type: 'decision', data: { label: 'D1: Migrate to FalkorDB', status: 'approved' }, position: { x: 550, y: 350 } },
    { id: 'd-D2', type: 'decision', data: { label: 'D2: Keep legacy auth', status: 'approved' }, position: { x: 800, y: 350 } },
    { id: 'd-D3', type: 'decision', data: { label: 'D3: Redis for caching', status: 'superseded' }, position: { x: 150, y: 650 } },
    { id: 'd-D6', type: 'decision', data: { label: 'D6: Switch to FalkorDB', status: 'approved' }, position: { x: 300, y: 650 } },

    { id: 'g-G1', type: 'goal', data: { label: 'Reduce infra costs 30%' }, position: { x: 550, y: 700 } },
    { id: 'g-G2', type: 'goal', data: { label: 'Enterprise ARR $20M' }, position: { x: 800, y: 700 } },
    { id: 'g-G3', type: 'goal', data: { label: 'Ship Agent Memory GA' }, position: { x: 300, y: 800 } },

    { id: 'r-R1', type: 'risk', data: { label: 'R1: SSO on stale auth', severity: 'High' }, position: { x: 950, y: 500 } },
    { id: 'r-R3', type: 'risk', data: { label: 'R3: AMS single point of failure', severity: 'High' }, position: { x: 100, y: 800 } },

    { id: 'doc-arch', type: 'document', data: { label: 'Architecture Review Q4', status: 'current' }, position: { x: 700, y: 350 } },
    { id: 'doc-legacy', type: 'document', data: { label: 'Legacy Auth Design', status: 'superseded' }, position: { x: 950, y: 350 } },
  ],

  graphEdges: [
    { id: 'e1', source: 'd-D1', target: 'p-sarah', label: 'MADE_BY', type: 'default' },
    { id: 'e2', source: 'd-D1', target: 'proj-icm', label: 'AFFECTS', type: 'default' },
    { id: 'e3', source: 'd-D1', target: 'doc-arch', label: 'SOURCED_FROM', type: 'default' },
    { id: 'e4', source: 'd-D2', target: 'p-sarah', label: 'MADE_BY', type: 'default' },
    { id: 'e5', source: 'd-D2', target: 'proj-esp', label: 'AFFECTS', type: 'default' },
    { id: 'e6', source: 'd-D2', target: 'doc-legacy', label: 'SOURCED_FROM', type: 'default' },
    { id: 'e7', source: 'd-D6', target: 'p-sarah', label: 'MADE_BY', type: 'default' },
    { id: 'e8', source: 'd-D6', target: 'proj-ams', label: 'AFFECTS', type: 'default' },
    { id: 'e9', source: 'd-D6', target: 'd-D3', label: 'SUPERSEDES', type: 'default' },
    { id: 'e10', source: 'proj-icm', target: 'g-G1', label: 'SUPPORTS', type: 'default' },
    { id: 'e11', source: 'proj-esp', target: 'g-G2', label: 'SUPPORTS', type: 'default' },
    { id: 'e12', source: 'proj-ams', target: 'g-G3', label: 'SUPPORTS', type: 'default' },
    { id: 'e13', source: 'r-R1', target: 'proj-esp', label: 'THREATENS', type: 'default' },
    { id: 'e14', source: 'r-R3', target: 'proj-ams', label: 'THREATENS', type: 'default' },
    { id: 'e15', source: 'p-daniel', target: 'proj-ams', label: 'WORKED_ON', type: 'default' },
    { id: 'e16', source: 'p-arjun', target: 'proj-ams', label: 'WORKED_ON', type: 'default' },
    { id: 'e17', source: 'p-daniel', target: 'p-sarah', label: 'REPORTS_TO', type: 'default' },
    { id: 'e18', source: 'p-arjun', target: 'p-sarah', label: 'REPORTS_TO', type: 'default' },
    { id: 'e19', source: 'p-jessica', target: 'p-marcus', label: 'REPORTS_TO', type: 'default' },
  ],
};
