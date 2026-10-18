# 🧠 A.S.K
## *Agentic System of Knowledge*

> **A.S.K** is an AI-powered organizational intelligence dashboard. It turns messy company knowledge — meeting notes, decisions, risks, people, and projects — into a living, queryable knowledge graph. Ask it anything about your organization in plain English and get answers backed by traceable evidence.

---

## 🤔 What Problem Does A.S.K Solve?

Every company suffers from **organizational amnesia**:
- *"Why did we make that decision two years ago?"*
- *"Who is responsible for this project?"*
- *"That document we based our strategy on — is it still valid?"*
- *"Which decisions are at risk because of this new threat?"*

Answers are buried in Slack threads, old Google Docs, and people's heads. A.S.K extracts them, connects them, and makes them instantly queryable.

---

## 🌟 The X-Factor — What Makes A.S.K Internationally Award-Worthy

> **Evidence-Grounded Generation (EGG) — one step beyond RAG**

Most AI tools give you answers. **A.S.K gives you *traceable answers*.**

Here's how it works under the hood:

1. **Cypher-Grounded Queries** — every AI response is backed by an exact Cypher query run against FalkorDB, not fuzzy text retrieval
2. **Full Evidence Chain** — the dashboard shows you *which graph nodes* (people, decisions, documents) were used to form the answer
3. **Automatic Stale-Data Detection** — if the source document behind a decision has been *superseded (outdated)*, A.S.K automatically flags it with a ⚠️ warning before you act on stale information

This pattern — **Evidence-Grounded Generation (EGG)** — goes beyond the popular RAG (Retrieval-Augmented Generation) approach. Instead of pulling text chunks, A.S.K retrieves *structured graph facts* with full audit trails. No hallucinations. No black boxes. Every answer is as trustworthy as the data behind it.

**This is the enterprise AI pattern almost no one is building correctly — and A.S.K does it out of the box.**

---

## 🚀 Getting Started (Step-by-Step)

### What You Need
- [Node.js](https://nodejs.org) v18 or higher
- A running [FalkorDB](https://falkordb.com) instance (local Docker or cloud)
- An [OpenAI API key](https://platform.openai.com)

### Step 1 — Clone the Project
```bash
git clone <your-repo-url>
cd company-brain
```

### Step 2 — Install Dependencies
```bash
# Root (backend) dependencies
npm install

# Frontend dependencies
npm install --prefix frontend
```

### Step 3 — Configure Environment
Create a `.env` file in the root folder:
```env
FALKORDB_HOST=localhost
FALKORDB_PORT=6379
OPENAI_API_KEY=your_openai_api_key_here
```

### Step 4 — Seed Demo Data *(Recommended)*
```bash
node seed.js
```
This loads a sample company into FalkorDB — people, projects, decisions, risks, and documents — so you can explore right away without entering data manually.

### Step 5 — Start the App
```bash
npm run dev
```

This single command starts **both** the backend API and the frontend dashboard simultaneously.

| Service | URL |
|---------|-----|
| 🖥️ Frontend Dashboard | http://localhost:5173 |
| ⚙️ Backend API | http://localhost:4000 |

---

## 📖 Dashboard Pages — What Each Section Does

### 🏠 Command Overview
Your **home screen**. See the entire company at a glance — people, projects, decisions, risks — with a quick-search bar at the centre. Type any question and A.S.K routes it straight to the AI agent.

### 🤖 Agent Workbench
The **AI brain of A.S.K**. Ask questions in plain English:
- *"Why did we choose FalkorDB?"*
- *"Who is responsible for Agent Memory Service?"*
- *"Which decisions reference superseded documents?"*

Every answer shows the **full evidence trail**: the Cypher query used, the graph nodes referenced, and a warning if any source is outdated.

### 🗺️ Intelligence Graph
A **live interactive map** of your organization. Every person, project, decision, goal, risk, and document appears as a connected node. Click to explore. Filter by type. Search by name.

### 📋 Decision Explorer
Browse every recorded decision. Filter by project or keyword. Click any decision to see:
- Who made it and when
- What project it affects
- What document it was sourced from
- **⚠️ A provenance warning if the source document is now outdated**
- Its full evolution history (which decision it superseded)

### 👥 People & Organization
Directory of all people with a visual org chart. Click anyone to see the decisions they made, projects they touched, and meetings they attended.

### 📦 Projects & Goals
All projects linked to the strategic goals they support. Understand the *why* behind each project — what goals it serves, who's on it, and which decisions shaped it.

### 🛡️ Risk Intelligence
All identified organizational risks ranked by severity. Trace which projects and goals each risk threatens, and which decisions introduced or mitigated it.

### 📄 Document Intelligence
Every source document tracked for validity. Instantly see which are **current**, which are **superseded (outdated)**, and which decisions were built on each one.

### 📡 Live Knowledge Ingestion
Drop in any meeting notes, decision memos, or executive communications as plain text. A.S.K **automatically extracts** people, projects, decisions, and risks and **writes them directly into the knowledge graph** — zero manual data entry.

### ⚙️ System Diagnostics
Technical health check — confirms backend connectivity, FalkorDB status, and API response times.

---

## 🏗️ Architecture

```
User asks a question
        ↓
AI Agent selects the right tool (function calling)
        ↓
Tool runs a Cypher query on FalkorDB
        ↓
Graph returns structured facts (nodes + relationships)
        ↓
AI generates a grounded answer with full evidence trail
        ↓
Frontend displays: Answer + Cypher Query + ⚠️ Source Status Warning
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Knowledge Graph | FalkorDB (property graph, Cypher) |
| AI Agent | OpenAI GPT-4o with function calling |
| Backend | Node.js + Express |
| Frontend | React + Vite |
| Styling | Tailwind CSS (Liquid Glass dark theme) |
| Graph Visualization | React Flow (`@xyflow/react`) |

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Check backend and FalkorDB connectivity |
| `POST` | `/api/agent/ask` | Ask the AI agent a natural language question |
| `POST` | `/api/ingest` | Submit text for AI entity extraction |
| `GET` | `/api/decisions` | List all decisions |
| `GET` | `/api/people` | List all people |
| `GET` | `/api/risks` | List all risks |
| `GET` | `/api/graph` | Get full graph (nodes + edges) |

---

## 🏆 Why A.S.K Wins

| Capability | Typical AI Tools | A.S.K |
|-----------|-----------------|-------|
| Answer format | Text blobs | Cypher-grounded graph facts |
| Traceability | None | Full evidence chain per answer |
| Stale data detection | None | Auto-detects superseded sources |
| Knowledge ingestion | Manual | AI-powered auto-extraction |
| Org connectivity | Siloed views | Graph: decisions → people → projects → goals → risks |
| Trust mechanism | Black box | Transparent Cypher queries, always visible |

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "Add my feature"`
4. Push and open a Pull Request

---

## 📄 License

MIT — free to use, modify, and build upon.

---

<p align="center">
  <strong>Built with ❤️ for the Graph Hackathon</strong><br>
  <em>A.S.K — Agentic System of Knowledge</em><br>
  Powered by FalkorDB · OpenAI · React
</p>
