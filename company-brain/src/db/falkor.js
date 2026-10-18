// src/db/falkor.js
import { FalkorDB } from "falkordb";
import dotenv from "dotenv";

dotenv.config();

let db = null;
let graph = null;

export async function connectDB() {
  if (graph) return graph;

  db = await FalkorDB.connect({
    host: process.env.FALKOR_HOST || "localhost",
    port: Number(process.env.FALKOR_PORT || 6379),
  });

  graph = db.selectGraph(process.env.FALKOR_GRAPH || "company");
  console.log(`✅ Connected to FalkorDB graph: ${process.env.FALKOR_GRAPH || "company"}`);
  return graph;
}

export function getGraph() {
  if (!graph) throw new Error("DB not initialized. Call connectDB() first.");
  return graph;
}

export async function closeDB() {
  if (db) {
    await db.close();
    db = null;
    graph = null;
  }
}

// Read-only query helper — always use this for agent queries.
export async function roQuery(query, params = {}) {
  const g = getGraph();
  return g.roQuery(query, { params });
}

// Write query helper — used only by ingest.
export async function rwQuery(query, params = {}) {
  const g = getGraph();
  return g.query(query, { params });
}