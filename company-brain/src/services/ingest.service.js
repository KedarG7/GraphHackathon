// src/services/ingest.service.js
import OpenAI from "openai";
import { rwQuery } from "../db/falkor.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const EXTRACT_PROMPT = `You extract facts from corporate text into a graph.
Return ONLY JSON of the form:
{
  "people":   [{"name": "...", "role": "..."}],
  "projects": [{"name": "...", "status": "..."}],
  "decisions":[{"id": "D_auto_<n>", "summary": "...", "date": "YYYY-MM-DD", "made_by": "person name", "affects": "project name", "source_title": "document or meeting title"}],
  "risks":    [{"id": "R_auto_<n>", "description": "...", "severity": "High|Medium|Low", "threatens": "project name"}]
}
Rules:
- Only include entities explicitly mentioned in the text.
- Use today's date if a date is not given.
- If nothing fits, return empty arrays.
No prose, JSON only.`;

export async function ingestText(text, sourceTitle = "Manual Entry") {
  let parsed;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: EXTRACT_PROMPT },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
    });
    parsed = JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.warn("OpenAI API unavailable (" + err.message + "), falling back to Heuristic Knowledge Extractor");
    parsed = heuristicExtract(text, sourceTitle);
  }

  const { people = [], projects = [], decisions = [], risks = [] } = parsed;

  const created = { people: [], projects: [], decisions: [], risks: [] };

  // People
  for (const p of people) {
    if (!p.name) continue;
    await rwQuery(
      `MERGE (p:Person {name:$name}) SET p.role = coalesce($role, p.role)`,
      { name: p.name, role: p.role || null }
    );
    created.people.push(p.name);
  }

  // Projects
  for (const pr of projects) {
    if (!pr.name) continue;
    await rwQuery(
      `MERGE (p:Project {name:$name}) SET p.status = coalesce($status, p.status)`,
      { name: pr.name, status: pr.status || "unknown" }
    );
    created.projects.push(pr.name);
  }

  // Decisions + optional Document
  for (const d of decisions) {
    if (!d.id || !d.summary) continue;
    await rwQuery(
      `MERGE (d:Decision {id:$id})
       SET d.summary = $summary, d.date = $date, d.status = coalesce($status,'approved')`,
      { id: d.id, summary: d.summary, date: d.date || new Date().toISOString().slice(0, 10), status: d.status || "approved" }
    );

    if (d.made_by) {
      await rwQuery(
        `MERGE (p:Person {name:$name})
         WITH p MATCH (d:Decision {id:$id})
         MERGE (d)-[:MADE_BY]->(p)`,
        { name: d.made_by, id: d.id }
      );
    }
    if (d.affects) {
      await rwQuery(
        `MERGE (pr:Project {name:$name})
         WITH pr MATCH (d:Decision {id:$id})
         MERGE (d)-[:AFFECTS]->(pr)`,
        { name: d.affects, id: d.id }
      );
    }
    if (d.source_title || sourceTitle) {
      const docTitle = d.source_title || sourceTitle;
      await rwQuery(
        `MERGE (doc:Document {title:$title})
         SET doc.status = coalesce(doc.status,'current')
         WITH doc MATCH (d:Decision {id:$id})
         MERGE (d)-[:SOURCED_FROM]->(doc)`,
        { title: docTitle, id: d.id }
      );
    }
    created.decisions.push(d.id);
  }

  // Risks
  for (const r of risks) {
    if (!r.id || !r.description) continue;
    await rwQuery(
      `MERGE (r:Risk {id:$id})
       SET r.description=$description, r.severity=coalesce($severity,'Medium'), r.status='open'`,
      { id: r.id, description: r.description, severity: r.severity || "Medium" }
    );
    if (r.threatens) {
      await rwQuery(
        `MERGE (pr:Project {name:$name})
         WITH pr MATCH (r:Risk {id:$id})
         MERGE (r)-[:THREATENS]->(pr)`,
        { name: r.threatens, id: r.id }
      );
    }
    created.risks.push(r.id);
  }

  return { created, raw: parsed };
}

function heuristicExtract(text, sourceTitle) {
  const people = [];
  const projects = [];
  const decisions = [];
  const risks = [];

  // Match common names or known entities from corporate seed
  const knownPeople = ["Sarah Chen", "Marcus Lee", "Priya Nair", "Daniel Okafor", "Jessica Park", "Arjun Mehta", "Elena Rossi"];
  for (const name of knownPeople) {
    if (new RegExp("\\b" + name + "\\b", "i").test(text)) {
      people.push({ name, role: name === "Sarah Chen" ? "CTO" : name === "Marcus Lee" ? "VP Product" : name === "Priya Nair" ? "Head of Sales" : "Engineer" });
    }
  }

  // Look for any other "First Last" followed by "decided" or "said" or "added"
  const personMatch = text.match(/([A-Z][a-z]+ [A-Z][a-z]+)\s+(decided|announced|approved|suggested)/);
  if (personMatch && !people.some(p => p.name === personMatch[1])) {
    people.push({ name: personMatch[1], role: "Team Lead" });
  }

  // Projects
  const knownProjects = ["Agent Memory Service", "Infra Cost Migration", "Enterprise Sales Playbook", "Q4 Engineering Hiring", "SOC 2 audit", "SOC 2"];
  for (const proj of knownProjects) {
    if (new RegExp("\\b" + proj + "\\b", "i").test(text)) {
      projects.push({ name: proj, status: "in_progress" });
    }
  }

  // Decisions
  const decMatch = text.match(/decided to ([^.]+)/i) || text.match(/approved ([^.]+)/i);
  if (decMatch) {
    const decId = "D_auto_" + Math.floor(Math.random() * 899 + 100);
    decisions.push({
      id: decId,
      summary: decMatch[0].trim(),
      date: new Date().toISOString().slice(0, 10),
      made_by: people[0]?.name || "Executive",
      affects: projects[0]?.name || "Agent Memory Service",
      source_title: sourceTitle
    });
  }

  // Risks
  const riskMatch = text.match(/risk\s+([A-Za-z0-9_-]+)?\s*\(?(High|Medium|Low)?\)?[:\-]?\s*([^.]+)/i);
  if (riskMatch) {
    const rId = riskMatch[1] || ("R" + Math.floor(Math.random() * 89 + 10));
    const severity = riskMatch[2] || "Medium";
    const desc = riskMatch[3] ? riskMatch[3].trim() : "Unspecified risk";
    risks.push({
      id: rId,
      description: desc,
      severity: severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase(),
      threatens: projects[0]?.name || "Agent Memory Service"
    });
  }

  return { people, projects, decisions, risks };
}