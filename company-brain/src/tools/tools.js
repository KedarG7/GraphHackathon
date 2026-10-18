// src/tools/tools.js
import { roQuery } from "../db/falkor.js";

// ---- helpers ----------------------------------------------------------
function val(row, key, idx) {
  if (row === null || row === undefined) return "Not available";
  if (Array.isArray(row)) {
    const v = row[idx];
    return v === null || v === undefined || v === "" ? "Not available" : v;
  }
  if (idx !== undefined) {
    const values = Object.values(row);
    if (idx < values.length && values[idx] !== null && values[idx] !== undefined && values[idx] !== "") {
      return values[idx];
    }
  }
  if (row[key] !== null && row[key] !== undefined && row[key] !== "") return row[key];
  for (const k of Object.keys(row)) {
    if (k.endsWith("." + key) || k === key) {
      const v = row[k];
      if (v !== null && v !== undefined && v !== "") return v;
    }
  }
  return "Not available";
}

function fmtDate(d) {
  return d ? String(d) : "unknown date";
}

// ---- tool 1: why_decision --------------------------------------------
export async function why_decision({ decision_id }) {
  const cypher = `
    MATCH (d:Decision {id: $id})-[:MADE_BY]->(p:Person)
    OPTIONAL MATCH (d)-[:SOURCED_FROM]->(doc:Document)
    OPTIONAL MATCH (d)-[:AFFECTS]->(proj:Project)
    OPTIONAL MATCH (proj)-[:SUPPORTS]->(g:Goal)
    RETURN d.summary, d.date, d.status, p.name, p.role,
           doc.title, doc.status, proj.name, g.name
  `;
  const res = await roQuery(cypher, { id: decision_id });
  if (!res.data?.length) {
    return {
      answer: `No decision with ID "${decision_id}" exists in the graph.`,
      evidence: { tool: "why_decision", cypher, nodes: [] },
    };
  }
  const r = res.data[0];
  const summary = val(r, "summary", 0);
  const date = val(r, "date", 1);
  const status = val(r, "status", 2);
  const maker = val(r, "name", 3);
  const makerRole = val(r, "role", 4);
  const doc = val(r, "title", 5);
  const docStatus = val(r, "status", 6);
  const project = val(r, "name", 7);
  const goal = val(r, "name", 8);

  let answer =
    `Decision ${decision_id} ("${summary}", ${fmtDate(date)}, ${status}) ` +
    `was made by ${maker} (${makerRole}). It affects project ${project} ` +
    `which supports goal ${goal}. The source document is "${doc}" (status: ${docStatus}).`;

  if (String(docStatus).toLowerCase() === "superseded") {
    answer +=
      ` ⚠️ WARNING: this decision is based on a superseded document — treat its conclusion as stale.`;
  }

  return {
    answer,
    evidence: {
      tool: "why_decision",
      cypher,
      params: { id: decision_id },
      nodes: [`Decision:${decision_id}`, `Person:${maker}`, `Project:${project}`, `Document:${doc}`],
      source_status: docStatus,
    },
  };
}

// ---- tool 2: who_knows -----------------------------------------------
export async function who_knows({ topic }) {
  const cypher = `
    MATCH (p:Person)<-[:MADE_BY]-(d:Decision)-[:AFFECTS]->(proj:Project)
    WHERE toLower(proj.name) CONTAINS toLower($topic)
    RETURN DISTINCT p.name, p.role, p.tenure
    ORDER BY p.name
  `;
  const res = await roQuery(cypher, { topic });
  if (!res.data?.length) {
    return {
      answer: `No one in the graph has made decisions about "${topic}".`,
      evidence: { tool: "who_knows", cypher, params: { topic }, nodes: [] },
    };
  }
  const lines = res.data.map((row) => {
    const n = val(row, "name", 0);
    const role = val(row, "role", 1);
    const tenure = val(row, "tenure", 2);
    return `• ${n} — ${role} (tenure: ${tenure})`;
  });
  return {
    answer: `People responsible for decisions on "${topic}":\n${lines.join("\n")}`,
    evidence: {
      tool: "who_knows",
      cypher,
      params: { topic },
      nodes: res.data.map((row) => `Person:${val(row, "name", 0)}`),
    },
  };
}

// ---- tool 3: decision_chain -----------------------------------------
export async function decision_chain({ project }) {
  const cypher = `
    MATCH (d:Decision)-[:AFFECTS]->(p:Project)
    WHERE toLower(p.name) = toLower($project)
    OPTIONAL MATCH (d)-[:MADE_BY]->(per:Person)
    OPTIONAL MATCH (d)-[:SOURCED_FROM]->(doc:Document)
    RETURN d.summary, d.date, per.name, doc.title, doc.status
    ORDER BY d.date DESC
  `;
  const res = await roQuery(cypher, { project });
  if (!res.data?.length) {
    return {
      answer: `No decision history for project "${project}".`,
      evidence: { tool: "decision_chain", cypher, params: { project }, nodes: [] },
    };
  }
  const blocks = res.data.map((r, i) => {
    const s = val(r, "summary", 0);
    const d = val(r, "date", 1);
    const m = val(r, "name", 2);
    const doc = val(r, "title", 3);
    const st = val(r, "status", 4);
    let b = `${i + 1}. [${fmtDate(d)}] ${s}\n   Made by: ${m}\n   Source: ${doc} (${st})`;
    if (String(st).toLowerCase() === "superseded") b += " ⚠️ stale source";
    return b;
  });
  return {
    answer: `Decision history for "${project}":\n\n${blocks.join("\n\n")}`,
    evidence: {
      tool: "decision_chain",
      cypher,
      params: { project },
      nodes: res.data.map((r) => `Decision:${val(r, "summary", 0)}`),
    },
  };
}

// ---- tool 4: blast_radius -------------------------------------------
export async function blast_radius({ project }) {
  const cypher = `
    MATCH (p:Project) WHERE toLower(p.name) = toLower($project)
    OPTIONAL MATCH (p)-[:SUPPORTS]->(g:Goal)
    OPTIONAL MATCH (p)<-[:THREATENS]-(r:Risk)
    OPTIONAL MATCH (p)-[:PART_OF]->(t:Team)-[:PART_OF]->(dep:Department)
    OPTIONAL MATCH (d:Decision)-[:AFFECTS]->(p)
    OPTIONAL MATCH (d)-[:MADE_BY]->(per:Person)
    RETURN p.name, p.status, p.budget, g.name,
           collect(DISTINCT r.description), collect(DISTINCT t.name),
           collect(DISTINCT dep.name), collect(DISTINCT per.name)
  `;
  const res = await roQuery(cypher, { project });
  if (!res.data?.length) {
    return {
      answer: `Project "${project}" is not in the graph.`,
      evidence: { tool: "blast_radius", cypher, params: { project }, nodes: [] },
    };
  }
  const r = res.data[0];
  const name = val(r, "name", 0);
  const status = val(r, "status", 1);
  const budget = val(r, "budget", 2);
  const goal = val(r, "name", 3);
  const risks = (val(r, "collect(DISTINCT r.description)", 4) || []).filter(Boolean);
  const teams = (val(r, "collect(DISTINCT t.name)", 5) || []).filter(Boolean);
  const depts = (val(r, "collect(DISTINCT dep.name)", 6) || []).filter(Boolean);
  const makers = (val(r, "collect(DISTINCT per.name)", 7) || []).filter(Boolean);

  const answer = [
    `Project: ${name} (${status}, budget $${budget})`,
    `Goal: ${goal}`,
    `Departments: ${depts.join(", ") || "none"}`,
    `Teams: ${teams.join(", ") || "none"}`,
    `Decision makers: ${makers.join(", ") || "none"}`,
    `Open risks: ${risks.length ? risks.map((x) => `\n  • ${x}`).join("") : "none"}`,
  ].join("\n");

  return {
    answer,
    evidence: {
      tool: "blast_radius",
      cypher,
      params: { project },
      nodes: [`Project:${name}`, ...teams.map((t) => `Team:${t}`), ...depts.map((d) => `Department:${d}`)],
    },
  };
}

// ---- tool 5: open_risks ---------------------------------------------
export async function open_risks({ severity }) {
  const cypher = `
    MATCH (r:Risk)
    WHERE r.status = 'open'
      AND ($severity IS NULL OR toLower(r.severity) = toLower($severity))
    OPTIONAL MATCH (r)-[:THREATENS]->(p:Project)
    OPTIONAL MATCH (p)-[:SUPPORTS]->(g:Goal)
    RETURN r.id, r.description, r.severity, p.name, g.name
    ORDER BY CASE r.severity WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END
  `;
  const res = await roQuery(cypher, { severity: severity || null });
  if (!res.data?.length) {
    return {
      answer: severity ? `No open ${severity} risks.` : `No open risks in the graph.`,
      evidence: { tool: "open_risks", cypher, params: { severity }, nodes: [] },
    };
  }
  const lines = res.data.map((r) => {
    const id = val(r, "id", 0);
    const desc = val(r, "description", 1);
    const sev = val(r, "severity", 2);
    const proj = val(r, "name", 3);
    const goal = val(r, "name", 4);
    return `• [${sev}] ${id}: ${desc}\n    Project: ${proj} | Goal: ${goal}`;
  });
  return {
    answer: `Open risks${severity ? ` (${severity})` : ""}:\n${lines.join("\n")}`,
    evidence: {
      tool: "open_risks",
      cypher,
      params: { severity },
      nodes: res.data.map((r) => `Risk:${val(r, "id", 0)}`),
    },
  };
}

// ---- tool 6: workload -------------------------------------------------
export async function workload({ person }) {
  const cypher = `
    MATCH (p:Person) WHERE toLower(p.name) CONTAINS toLower($person)
    OPTIONAL MATCH (p)-[w:WORKED_ON]->(pr:Project)
    OPTIONAL MATCH (p)-[:MEMBER_OF]->(t:Team)
    OPTIONAL MATCH (p)-[:REPORTS_TO]->(boss:Person)
    RETURN p.name, p.role, t.name, boss.name,
           collect(DISTINCT pr.name + ' (' + coalesce(w.commits,0) + ' commits)')
  `;
  const res = await roQuery(cypher, { person });
  if (!res.data?.length) {
    return {
      answer: `No person matching "${person}".`,
      evidence: { tool: "workload", cypher, params: { person }, nodes: [] },
    };
  }
  const blocks = res.data.map((r) => {
    const n = val(r, "name", 0);
    const role = val(r, "role", 1);
    const team = val(r, "name", 2);
    const boss = val(r, "name", 3);
    const projects = (val(r, "collect(DISTINCT pr.name + ' (' + coalesce(w.commits,0) + ' commits)')", 4) || []).filter(Boolean);
    return `${n} — ${role}\n  Team: ${team}\n  Reports to: ${boss}\n  Projects: ${projects.join(", ") || "none"}`;
  });
  return {
    answer: blocks.join("\n\n"),
    evidence: {
      tool: "workload",
      cypher,
      params: { person },
      nodes: res.data.map((r) => `Person:${val(r, "name", 0)}`),
    },
  };
}

// ---- tool 7: goal_health ---------------------------------------------
export async function goal_health({}) {
  const cypher = `
    MATCH (g:Goal)
    OPTIONAL MATCH (pr:Project)-[:SUPPORTS]->(g)
    OPTIONAL MATCH (r:Risk)-[:THREATENS]->(pr)
    OPTIONAL MATCH (d:Decision)-[:AFFECTS]->(pr)
    OPTIONAL MATCH (d)-[:SOURCED_FROM]->(doc:Document)
    RETURN g.name, g.quarter, g.owner,
           collect(DISTINCT pr.name),
           collect(DISTINCT CASE WHEN r.status='open' THEN r.id END),
           collect(DISTINCT CASE WHEN doc.status='superseded' THEN doc.title END)
  `;
  const res = await roQuery(cypher, {});
  if (!res.data?.length) {
    return {
      answer: "No goals in the graph.",
      evidence: { tool: "goal_health", cypher, nodes: [] },
    };
  }
  const blocks = res.data.map((r) => {
    const name = val(r, "name", 0);
    const quarter = val(r, "quarter", 1);
    const owner = val(r, "owner", 2);
    const projects = (val(r, "collect(DISTINCT pr.name)", 3) || []).filter(Boolean);
    const risks = (val(r, "collect(DISTINCT CASE WHEN r.status='open' THEN r.id END)", 4) || []).filter(Boolean);
    const stale = (val(r, "collect(DISTINCT CASE WHEN doc.status='superseded' THEN doc.title END)", 5) || []).filter(Boolean);
    const health = risks.length || stale.length ? "⚠️ AT RISK" : "✅ On track";
    return `${name} [${quarter}] — ${health}\n  Owner: ${owner}\n  Projects: ${projects.join(", ") || "none"}\n  Risks: ${risks.join(", ") || "none"}\n  Stale docs: ${stale.join(", ") || "none"}`;
  });
  return {
    answer: blocks.join("\n\n"),
    evidence: {
      tool: "goal_health",
      cypher,
      nodes: res.data.map((r) => `Goal:${val(r, "name", 0)}`),
    },
  };
}

// ---- tool 8: trace_path ----------------------------------------------
export async function trace_path({ from_project, to_goal_keyword }) {
  const cypher = `
    MATCH path = (pr:Project)-[:SUPPORTS]->(g:Goal)
    WHERE toLower(pr.name) = toLower($from)
      AND toLower(g.name) CONTAINS toLower($to)
    RETURN [n IN nodes(path) | coalesce(n.name, n.summary, n.title)] AS hops,
           length(path) AS hopsCount
  `;
  const res = await roQuery(cypher, { from: from_project, to: to_goal_keyword });
  if (!res.data?.length) {
    return {
      answer: `No path from project "${from_project}" to goal matching "${to_goal_keyword}".`,
      evidence: { tool: "trace_path", cypher, params: { from_project, to_goal_keyword }, nodes: [] },
    };
  }
  const lines = res.data.map((r) => {
    const hops = val(r, "hops", 0) || [];
    const count = val(r, "hopsCount", 1);
    return `Path (${count} hops): ${hops.join(" → ")}`;
  });
  return {
    answer: lines.join("\n"),
    evidence: {
      tool: "trace_path",
      cypher,
      params: { from_project, to_goal_keyword },
      nodes: [],
    },
  };
}

// ---- registry used by the LLM ----------------------------------------
export const TOOL_REGISTRY = {
  why_decision,
  who_knows,
  decision_chain,
  blast_radius,
  open_risks,
  workload,
  goal_health,
  trace_path,
};