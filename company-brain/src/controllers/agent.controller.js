// src/controllers/agent.controller.js
import { runAgent } from "../services/agent.service.js";

export async function askController(req, res) {
  const { question } = req.body;
  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "Body must contain a string 'question'." });
  }

  try {
    const result = await runAgent(question);
    return res.json({
      question,
      answer: result.answer,
      evidence: result.evidence,
    });
  } catch (err) {
    console.error("agent error:", err);
    return res.status(500).json({ error: err.message });
  }
}