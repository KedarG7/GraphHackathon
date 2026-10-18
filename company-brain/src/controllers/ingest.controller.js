// src/controllers/ingest.controller.js
import { ingestText } from "../services/ingest.service.js";

export async function ingestController(req, res) {
  const { text, source_title } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Body must contain a string 'text'." });
  }

  try {
    const result = await ingestText(text, source_title || "Manual Entry");
    return res.json({
      ingested: result.created,
      summary: {
        people: result.created.people.length,
        projects: result.created.projects.length,
        decisions: result.created.decisions.length,
        risks: result.created.risks.length,
      },
    });
  } catch (err) {
    console.error("ingest error:", err);
    return res.status(500).json({ error: err.message });
  }
}