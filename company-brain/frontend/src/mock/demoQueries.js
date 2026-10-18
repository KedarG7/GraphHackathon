/* ─── Pre-computed Demo Queries for Offline / Judge Evaluation ─── */

export const DEMO_QUERY_FIXTURES = {
  'Why did we decide D2?': {
    answer:
      'Decision D2 ("Keep legacy auth for enterprise SSO", 2025-06-01, approved) was made by Sarah Chen (CTO). It affects project Enterprise Sales Playbook which supports goal Grow enterprise ARR to $20M. The source document is "Legacy Auth Design" (status: superseded). ⚠️ WARNING: this decision is based on a superseded document — treat its conclusion as stale.',
    evidence: {
      tool: 'why_decision',
      selected_by: 'llm',
      args: { decision_id: 'D2' },
      cypher:
        'MATCH (d:Decision {id: $id})-[:MADE_BY]->(p:Person)\nOPTIONAL MATCH (d)-[:SOURCED_FROM]->(doc:Document)\nOPTIONAL MATCH (d)-[:AFFECTS]->(proj:Project)-[:SUPPORTS]->(g:Goal)\nRETURN p.name, doc.title, doc.status, proj.name, g.name',
      nodes: [
        'Decision:D2',
        'Person:Sarah Chen',
        'Project:Enterprise Sales Playbook',
        'Document:Legacy Auth Design',
      ],
      source_status: 'superseded',
    },
  },

  'Who is responsible for Agent Memory Service?': {
    answer:
      'Sarah Chen (CTO) and Daniel Okafor (Staff Engineer) have authored decisions affecting Agent Memory Service. Daniel Okafor and Arjun Mehta are recorded as primary engineering contributors (Edge: WORKED_ON).',
    evidence: {
      tool: 'who_knows',
      selected_by: 'llm',
      args: { topic: 'Memory' },
      cypher:
        'MATCH (p:Person)<-[:MADE_BY]-(d:Decision)-[:AFFECTS]->(proj:Project)\nWHERE proj.name CONTAINS $topic\nRETURN p.name, p.role, d.id, proj.name',
      nodes: [
        'Person:Sarah Chen',
        'Person:Daniel Okafor',
        'Person:Arjun Mehta',
        'Project:Agent Memory Service',
      ],
      source_status: 'current',
    },
  },

  'Show the decision history of Agent Memory Service': {
    answer:
      'Agent Memory Service has two recorded decisions: D6 ("Switch agent memory from Redis to FalkorDB", 2025-09-15, approved, Sarah Chen) which SUPERSEDES D3 ("Use Redis for agent memory caching", 2025-07-10, superseded, Daniel Okafor).',
    evidence: {
      tool: 'decision_chain',
      selected_by: 'llm',
      args: { project_name: 'Agent Memory Service' },
      cypher:
        'MATCH (d:Decision)-[:AFFECTS]->(proj:Project {name: $project_name})\nOPTIONAL MATCH (d)-[:SUPERSEDES]->(prev:Decision)\nRETURN d.id, d.summary, d.date, d.status, prev.id ORDER BY d.date DESC',
      nodes: [
        'Project:Agent Memory Service',
        'Decision:D6',
        'Decision:D3',
      ],
      source_status: 'current',
    },
  },

  'Which decisions reference superseded documents?': {
    answer:
      'Decision D2 ("Keep legacy auth for enterprise SSO") is sourced from "Legacy Auth Design" (status: superseded). Decision D3 ("Use Redis for agent memory caching") is sourced from "Memory Architecture v1" (status: superseded). ⚠️ WARNING: Both decisions rely on stale architectural specifications.',
    evidence: {
      tool: 'why_decision',
      selected_by: 'llm',
      args: { status: 'superseded' },
      cypher:
        'MATCH (d:Decision)-[:SOURCED_FROM]->(doc:Document {status: "superseded"})\nRETURN d.id, d.summary, doc.title, doc.status',
      nodes: [
        'Decision:D2',
        'Document:Legacy Auth Design',
        'Decision:D3',
        'Document:Memory Architecture v1',
      ],
      source_status: 'superseded',
    },
  },

  'What are the highest-severity open risks?': {
    answer:
      'Two High-severity risks are currently open: R1 ("SSO relies on superseded auth design") threatening Enterprise Sales Playbook (exposing Goal: Grow enterprise ARR to $20M); and R3 ("Agent Memory Service single point of failure") threatening Agent Memory Service (exposing Goal: Ship Agent Memory GA).',
    evidence: {
      tool: 'open_risks',
      selected_by: 'llm',
      args: { severity: 'High' },
      cypher:
        'MATCH (r:Risk {severity: "High", status: "open"})-[:THREATENS]->(p:Project)-[:SUPPORTS]->(g:Goal)\nRETURN r.id, r.description, p.name, g.name',
      nodes: [
        'Risk:R1',
        'Risk:R3',
        'Project:Enterprise Sales Playbook',
        'Project:Agent Memory Service',
        'Goal:G2',
        'Goal:G3',
      ],
      source_status: 'open',
    },
  },

  'What changed after the previous decision?': {
    answer:
      'In Q4 leadership sync, Sarah Chen authored Decision D6 ("Switch agent memory from Redis to FalkorDB", 2025-09-15), superseding D3. This changed the persistence layer for Agent Memory Service and updated the source doc to "Memory Architecture v2" (current).',
    evidence: {
      tool: 'decision_chain',
      selected_by: 'llm',
      args: { relationship: 'SUPERSEDES' },
      cypher:
        'MATCH (d_new:Decision)-[:SUPERSEDES]->(d_old:Decision)\nRETURN d_new.id, d_new.summary, d_old.id, d_old.summary',
      nodes: ['Decision:D6', 'Decision:D3'],
      source_status: 'current',
    },
  },
};
