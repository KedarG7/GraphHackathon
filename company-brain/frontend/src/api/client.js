/* ─── A.S.K — Agentic System of Knowledge — Central API Client ─── */

const BASE = import.meta.env.VITE_API_BASE_URL || '';

export function getApiBase() {
  return BASE || window.location.origin;
}

async function request(method, path, body) {
  const url = `${BASE}${path}`;
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(15000),
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

/* ─── Health ─── */
export async function checkHealth() {
  return request('GET', '/health');
}

/* ─── Agent ─── */
export async function askAgent(question) {
  return request('POST', '/api/agent/ask', { question });
}

/* ─── Ingestion ─── */
export async function ingestDocument(source_title, text) {
  return request('POST', '/api/ingest/ingest', { source_title, text });
}
