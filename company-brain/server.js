// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, closeDB } from "./src/db/falkor.js";
import agentRoutes from "./src/routes/agent.routes.js";
import ingestRoutes from "./src/routes/ingest.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// API
app.use("/api/agent", agentRoutes);
app.use("/api/ingest", ingestRoutes);

const PORT = process.env.PORT || 4000;

async function main() {
  await connectDB();
  app.listen(PORT, () => console.log(`🚀 A.S.K API running on http://localhost:${PORT}`));
}

// Graceful shutdown
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, async () => {
    console.log(`\n${sig} received, shutting down...`);
    await closeDB();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});