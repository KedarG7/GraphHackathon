// seed.js
import { FalkorDB } from "falkordb";

const db = await FalkorDB.connect({ host: "localhost", port: 6379 });
const graph = db.selectGraph("company");

await graph.query("MATCH (n) DETACH DELETE n");

await graph.query(`
  // ============ DEPARTMENTS ============
  CREATE (eng:Department {name: 'Engineering', budget: 4200000, headcount: 48})
  CREATE (prod:Department {name: 'Product', budget: 1500000, headcount: 14})
  CREATE (sales:Department {name: 'Sales', budget: 2100000, headcount: 22})
  CREATE (hr:Department {name: 'People Ops', budget: 600000, headcount: 8})

  // ============ TEAMS ============
  CREATE (platform:Team {name: 'Platform Team', size: 9})
  CREATE (growth:Team {name: 'Growth Team', size: 6})
  CREATE (revenue:Team {name: 'Revenue Team', size: 11})
  CREATE (people:Team {name: 'People Team', size: 4})

  CREATE (platform)-[:PART_OF]->(eng)
  CREATE (growth)-[:PART_OF]->(prod)
  CREATE (revenue)-[:PART_OF]->(sales)
  CREATE (people)-[:PART_OF]->(hr)

  // ============ PEOPLE ============
  CREATE (sarah:Person {name: 'Sarah Chen', role: 'CTO', tenure: '6 years', level: 'Executive'})
  CREATE (marcus:Person {name: 'Marcus Lee', role: 'VP Product', tenure: '4 years', level: 'Executive'})
  CREATE (priya:Person {name: 'Priya Nair', role: 'Head of Sales', tenure: '3 years', level: 'Executive'})
  CREATE (daniel:Person {name: 'Daniel Okafor', role: 'Staff Engineer', tenure: '5 years', level: 'Senior IC'})
  CREATE (jessica:Person {name: 'Jessica Park', role: 'Product Manager', tenure: '2 years', level: 'Manager'})
  CREATE (arjun:Person {name: 'Arjun Mehta', role: 'Backend Engineer', tenure: '1 year', level: 'IC'})
  CREATE (elena:Person {name: 'Elena Rossi', role: 'HR Business Partner', tenure: '4 years', level: 'Manager'})

  CREATE (sarah)-[:MEMBER_OF]->(platform)
  CREATE (daniel)-[:MEMBER_OF]->(platform)
  CREATE (arjun)-[:MEMBER_OF]->(platform)
  CREATE (jessica)-[:MEMBER_OF]->(growth)
  CREATE (marcus)-[:MEMBER_OF]->(growth)
  CREATE (priya)-[:MEMBER_OF]->(revenue)
  CREATE (elena)-[:MEMBER_OF]->(people)

  // Reporting lines
  CREATE (daniel)-[:REPORTS_TO]->(sarah)
  CREATE (arjun)-[:REPORTS_TO]->(daniel)
  CREATE (jessica)-[:REPORTS_TO]->(marcus)
  CREATE (marcus)-[:REPORTS_TO]->(sarah)
  CREATE (priya)-[:REPORTS_TO]->(sarah)
  CREATE (elena)-[:REPORTS_TO]->(sarah)

  // ============ GOALS ============
  CREATE (g1:Goal {id: 'G1', name: 'Reduce infra cost by 30%', quarter: 'Q4 2026', owner: 'Sarah Chen'})
  CREATE (g2:Goal {id: 'G2', name: 'Grow enterprise ARR to $20M', quarter: 'Q4 2026', owner: 'Priya Nair'})
  CREATE (g3:Goal {id: 'G3', name: 'Ship Agent Memory GA', quarter: 'Q4 2026', owner: 'Marcus Lee'})

  // ============ PROJECTS ============
  CREATE (memory:Project {name: 'Agent Memory Service', status: 'in_progress', budget: 800000})
  CREATE (migrate:Project {name: 'Infra Cost Migration', status: 'in_progress', budget: 300000})
  CREATE (enterprise:Project {name: 'Enterprise Sales Playbook', status: 'planning', budget: 150000})
  CREATE (hiring:Project {name: 'Q4 Engineering Hiring', status: 'in_progress', budget: 200000})

  CREATE (memory)-[:PART_OF]->(growth)
  CREATE (migrate)-[:PART_OF]->(platform)
  CREATE (enterprise)-[:PART_OF]->(revenue)
  CREATE (hiring)-[:PART_OF]->(platform)

  CREATE (memory)-[:SUPPORTS]->(g3)
  CREATE (migrate)-[:SUPPORTS]->(g1)
  CREATE (enterprise)-[:SUPPORTS]->(g2)
  CREATE (hiring)-[:SUPPORTS]->(g1)

  // ============ DECISIONS ============
  CREATE (d1:Decision {id: 'D1', summary: 'Migrate to FalkorDB for graph memory', date: '2026-10-01', status: 'approved'})
  CREATE (d2:Decision {id: 'D2', summary: 'Keep legacy auth for enterprise SSO', date: '2025-06-01', status: 'approved'})
  CREATE (d3:Decision {id: 'D3', summary: 'Freeze non-critical hiring until Q1', date: '2026-09-15', status: 'approved'})
  CREATE (d4:Decision {id: 'D4', summary: 'Move analytics to managed service', date: '2026-08-10', status: 'approved'})
  CREATE (d5:Decision {id: 'D5', summary: 'Defer SOC 2 Type II to next year', date: '2026-07-20', status: 'approved'})
  CREATE (d6:Decision {id: 'D6', summary: 'Unblock two backend hires for Agent Memory GA', date: '2026-10-15', status: 'approved'})

  CREATE (d1)-[:MADE_BY]->(sarah)
  CREATE (d2)-[:MADE_BY]->(sarah)
  CREATE (d3)-[:MADE_BY]->(sarah)
  CREATE (d4)-[:MADE_BY]->(daniel)
  CREATE (d5)-[:MADE_BY]->(sarah)
  CREATE (d6)-[:MADE_BY]->(sarah)

  CREATE (d1)-[:AFFECTS]->(memory)
  CREATE (d2)-[:AFFECTS]->(enterprise)
  CREATE (d3)-[:AFFECTS]->(hiring)
  CREATE (d4)-[:AFFECTS]->(migrate)
  CREATE (d5)-[:AFFECTS]->(enterprise)
  CREATE (d6)-[:AFFECTS]->(memory)

  // SUPERSEDES chain: D6 overrides the hiring freeze (D3) for Memory-critical roles only
  CREATE (d6)-[:SUPERSEDES]->(d3)

  // ============ DOCUMENTS ============
  CREATE (doc1:Document {title: 'Architecture Review Q4', status: 'current', type: 'Design Doc', owner: 'Sarah Chen'})
  CREATE (doc2:Document {title: 'Legacy Auth Design', status: 'superseded', type: 'Design Doc', owner: 'Sarah Chen'})
  CREATE (doc3:Document {title: 'Hiring Plan 2026', status: 'current', type: 'Plan', owner: 'Elena Rossi'})
  CREATE (doc4:Document {title: 'Enterprise Sales Playbook v1', status: 'draft', type: 'Playbook', owner: 'Priya Nair'})
  CREATE (doc5:Document {title: 'Analytics Migration Notes', status: 'current', type: 'Notes', owner: 'Daniel Okafor'})
  CREATE (doc6:Document {title: 'Q4 Leadership Sync', status: 'current', type: 'Meeting Notes', owner: 'Sarah Chen'})

  CREATE (d1)-[:SOURCED_FROM]->(doc1)
  CREATE (d2)-[:SOURCED_FROM]->(doc2)
  CREATE (d3)-[:SOURCED_FROM]->(doc3)
  CREATE (d4)-[:SOURCED_FROM]->(doc5)
  CREATE (d5)-[:SOURCED_FROM]->(doc4)
  CREATE (d6)-[:SOURCED_FROM]->(doc6)

  // ============ RISKS ============
  CREATE (r1:Risk {id: 'R1', description: 'Enterprise SSO relies on superseded auth design', severity: 'High', status: 'open'})
  CREATE (r2:Risk {id: 'R2', description: 'Infra cost still 12% above target', severity: 'Medium', status: 'open'})
  CREATE (r3:Risk {id: 'R3', description: 'Q4 hiring freeze may delay Agent Memory GA', severity: 'High', status: 'open'})
  CREATE (r4:Risk {id: 'R4', description: 'Enterprise playbook still in draft, blocks Q4 pipeline', severity: 'Medium', status: 'open'})

  CREATE (r1)-[:THREATENS]->(enterprise)
  CREATE (r2)-[:THREATENS]->(migrate)
  CREATE (r3)-[:THREATENS]->(memory)
  CREATE (r4)-[:THREATENS]->(enterprise)

  // ============ MEETINGS ============
  CREATE (m1:Meeting {id: 'M1', title: 'Q4 Planning', date: '2026-10-02', attendees: 6})
  CREATE (m2:Meeting {id: 'M2', title: 'Architecture Review', date: '2026-10-01', attendees: 4})
  CREATE (m3:Meeting {id: 'M3', title: 'Sales Pipeline Review', date: '2026-10-03', attendees: 5})
  CREATE (m4:Meeting {id: 'M4', title: 'Q4 Leadership Sync', date: '2026-10-15', attendees: 5})

  CREATE (m1)-[:DISCUSSED]->(d3)
  CREATE (m2)-[:DISCUSSED]->(d1)
  CREATE (m3)-[:DISCUSSED]->(enterprise)
  CREATE (m4)-[:DISCUSSED]->(d6)

  // ============ WORKED_ON ============
  CREATE (sarah)-[:WORKED_ON {commits: 42}]->(memory)
  CREATE (daniel)-[:WORKED_ON {commits: 128}]->(memory)
  CREATE (arjun)-[:WORKED_ON {commits: 76}]->(memory)
  CREATE (daniel)-[:WORKED_ON {commits: 55}]->(migrate)
  CREATE (jessica)-[:WORKED_ON {commits: 30}]->(memory)
  CREATE (priya)-[:WORKED_ON {commits: 12}]->(enterprise)
  CREATE (elena)-[:WORKED_ON {commits: 8}]->(hiring)
`);

console.log("✅ Corporate seed data inserted");
console.log("   - 4 Departments, 4 Teams, 7 People");
console.log("   - 3 Goals, 4 Projects");
console.log("   - 6 Decisions (D6 SUPERSEDES D3)");
console.log("   - 6 Documents (Legacy Auth Design = superseded)");
console.log("   - 4 Risks (R1 and R3 are High)");
console.log("   - 4 Meetings");
await db.close();