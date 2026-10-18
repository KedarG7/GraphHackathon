// src/services/agent.service.js
import OpenAI from "openai";
import { TOOL_REGISTRY } from "../tools/tools.js";
import { roQuery } from "../db/falkor.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// OpenAI function definitions — must match tool signatures.
const TOOL_DEFS = [
  {
    type: "function",
    function: {
      name: "why_decision",
      description: "Trace why a decision was made: who made it, source document, whether the source is stale, which project and goal it affects.",
      parameters: {
        type: "object",
        properties: {
          decision_id: { type: "string", description: "Decision ID such as D1, D2, D3." },
        },
        required: ["decision_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "who_knows",
      description: "Find people responsible for decisions about a project or topic.",
      parameters: {
        type: "object",
        properties: { topic: { type: "string", description: "Project or topic keyword, e.g. Memory, Infra, Enterprise." } },
        required: ["topic"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "decision_chain",
      description: "Return the chronological decision history for a named project.",
      parameters: {
        type: "object",
        properties: { project: { type: "string" } },
        required: ["project"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "blast_radius",
      description: "Show everything a project touches: goals, teams, departments, decision makers, open risks.",
      parameters: {
        type: "object",
        properties: { project: { type: "string" } },
        required: ["project"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "open_risks",
      description: "List open risks, optionally filtered by severity (High/Medium/Low).",
      parameters: {
        type: "object",
        properties: { severity: { type: "string", enum: ["High", "Medium", "Low"] } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "workload",
      description: "Show a person's role, team, manager, and the projects they contribute to.",
      parameters: {
        type: "object",
        properties: { person: { type: "string" } },
        required: ["person"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "goal_health",
      description: "Report whether each company goal is on track, listing risks and stale documents per goal.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "trace_path",
      description: "Show the graph path from a project to a goal, to explain why they are connected.",
      parameters: {
        type: "object",
        properties: {
          from_project: { type: "string" },
          to_goal_keyword: { type: "string" },
        },
        required: ["from_project", "to_goal_keyword"],
      },
    },
  },
];

const SYSTEM_PROMPT = `You are A.S.K (Agentic System of Knowledge), a corporate intelligence agent backed by a graph database.
You MUST answer only by calling one of the provided tools.
Never invent service names, people, or IDs. If the user's question cannot be answered by a tool, reply in plain text: "This question is not covered by the graph."
Pick the single most relevant tool. Fill its arguments using words from the question.`;

export async function runAgent(question) {
  let toolName = null;
  let args = {};
  let selectedBy = "llm";

  try {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: question },
    ];

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
      tools: TOOL_DEFS,
      tool_choice: "auto",
      temperature: 0,
    });

    const choice = completion.choices[0]?.message;

    if (!choice?.tool_calls?.length) {
      // If LLM returned text or didn't pick a tool, check heuristic
      const heuristic = heuristicToolSelect(question);
      if (heuristic) {
        toolName = heuristic.toolName;
        args = heuristic.args;
        selectedBy = "heuristic_graph_router";
      } else {
        return {
          answer: choice?.content || "The agent could not select a tool for this question.",
          evidence: { tool: null, cypher: null, nodes: [] },
        };
      }
    } else {
      const call = choice.tool_calls[0];
      toolName = call.function.name;
      args = JSON.parse(call.function.arguments || "{}");
    }
  } catch (err) {
    console.warn("OpenAI API unavailable (" + err.message + "), falling back to Heuristic Graph Router");
    const heuristic = heuristicToolSelect(question);
    if (heuristic) {
      toolName = heuristic.toolName;
      args = heuristic.args;
      selectedBy = "heuristic_graph_router (offline/quota resilient)";
    } else {
      return {
        answer: `Graph query routing unavailable: ${err.message}. Please verify OpenAI API credits or ask about D1-D6, projects, people, or risks.`,
        evidence: { tool: null, cypher: null, nodes: [] },
      };
    }
  }

  const tool = TOOL_REGISTRY[toolName];
  if (!tool) {
    return {
      answer: `Unknown tool "${toolName}".`,
      evidence: { tool: toolName, cypher: null, nodes: [] },
    };
  }

  // Pre-validate: if a project/person/topic argument is provided, confirm it exists.
  const validationError = await validateArgs(toolName, args);
  if (validationError) {
    return {
      answer: validationError,
      evidence: { tool: toolName, args, cypher: null, nodes: [] },
    };
  }

  const result = await tool(args);
  return {
    answer: result.answer,
    evidence: { ...result.evidence, selected_by: selectedBy, args },
  };
}

function heuristicToolSelect(question) {
  const q = question.toLowerCase();

  // 1. why_decision
  const decisionMatch = question.match(/\b(D[1-9]\d*)\b/i);
  if (decisionMatch) {
    return { toolName: "why_decision", args: { decision_id: decisionMatch[1].toUpperCase() } };
  }
  if (q.includes("why did we decide") || q.includes("why we decided")) {
    return { toolName: "why_decision", args: { decision_id: "D2" } };
  }

  // 2. open_risks
  if (q.includes("risk") || q.includes("threat") || q.includes("threaten")) {
    let severity = undefined;
    if (q.includes("high")) severity = "High";
    else if (q.includes("medium")) severity = "Medium";
    else if (q.includes("low")) severity = "Low";
    return { toolName: "open_risks", args: severity ? { severity } : {} };
  }

  // 3. who_knows
  if (q.includes("who is responsible") || q.includes("who owns") || q.includes("who knows")) {
    let topic = "Memory";
    if (q.includes("infra")) topic = "Infra";
    else if (q.includes("sales") || q.includes("enterprise") || q.includes("sso")) topic = "Enterprise";
    else if (q.includes("memory") || q.includes("agent")) topic = "Memory";
    else if (q.includes("hiring")) topic = "Hiring";
    return { toolName: "who_knows", args: { topic } };
  }

  // 4. decision_chain
  if (
    q.includes("decision history") ||
    q.includes("history of") ||
    q.includes("decisions on") ||
    q.includes("decisions about") ||
    q.includes("decision chain") ||
    q.includes("what decisions changed") ||
    q.includes("supersede") ||
    q.includes("what changed")
  ) {
    let project = "Agent Memory Service";
    if (q.includes("infra")) project = "Infra Cost Migration";
    else if (q.includes("sales") || q.includes("playbook")) project = "Enterprise Sales Playbook";
    else if (q.includes("hiring")) project = "Q4 Engineering Hiring";
    return { toolName: "decision_chain", args: { project } };
  }

  // 5. blast_radius
  if (q.includes("blast radius") || (q.includes("what does") && q.includes("touch")) || q.includes("impact of")) {
    let project = "Agent Memory Service";
    if (q.includes("infra")) project = "Infra Cost Migration";
    else if (q.includes("sales") || q.includes("playbook")) project = "Enterprise Sales Playbook";
    else if (q.includes("hiring")) project = "Q4 Engineering Hiring";
    return { toolName: "blast_radius", args: { project } };
  }

  // 6. workload
  if (q.includes("work on") || q.includes("workload") || q.includes("report to") || q.includes("manager") || q.includes("who is")) {
    let person = "Daniel Okafor";
    if (q.includes("sarah")) person = "Sarah Chen";
    else if (q.includes("marcus")) person = "Marcus Lee";
    else if (q.includes("priya")) person = "Priya Nair";
    else if (q.includes("jessica")) person = "Jessica Park";
    else if (q.includes("arjun")) person = "Arjun Mehta";
    else if (q.includes("elena")) person = "Elena Rossi";
    return { toolName: "workload", args: { person } };
  }

  // 7. goal_health
  if (q.includes("goal") || q.includes("on track") || q.includes("okr")) {
    return { toolName: "goal_health", args: {} };
  }

  // 8. trace_path
  if (q.includes("connected to") || q.includes("trace") || q.includes("path")) {
    return { toolName: "trace_path", args: { from_project: "Agent Memory Service", to_goal_keyword: "GA" } };
  }

  // 9. FalkorDB choice
  if (q.includes("falkordb")) {
    return { toolName: "why_decision", args: { decision_id: "D1" } };
  }

  return null;
}

// Guards: reject hallucinated arguments before running Cypher.
async function validateArgs(toolName, args) {
  const exists = async (label, query, params, value) => {
    if (!value) return null;
    const res = await roQuery(query, params);
    if (!res.data?.length) return `${label} "${value}" does not exist in the graph.`;
    return null;
  };

  if (toolName === "why_decision" && args.decision_id) {
    return exists("Decision ID", "MATCH (d:Decision {id:$v}) RETURN d.id", { v: args.decision_id }, args.decision_id);
  }
  if (toolName === "decision_chain" && args.project) {
    return exists("Project", "MATCH (p:Project) WHERE toLower(p.name)=toLower($v) RETURN p.name", { v: args.project }, args.project);
  }
  if (toolName === "blast_radius" && args.project) {
    return exists("Project", "MATCH (p:Project) WHERE toLower(p.name)=toLower($v) RETURN p.name", { v: args.project }, args.project);
  }
  if (toolName === "workload" && args.person) {
    return exists("Person", "MATCH (p:Person) WHERE toLower(p.name) CONTAINS toLower($v) RETURN p.name", { v: args.person }, args.person);
  }
  return null;
}