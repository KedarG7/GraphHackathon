// src/routes/agent.routes.js
import { Router } from "express";
import { askController } from "../controllers/agent.controller.js";

const router = Router();
router.post("/ask", askController);
export default router;