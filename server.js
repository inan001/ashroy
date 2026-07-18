import "dotenv/config";
import express from "express";
import { randomUUID } from "node:crypto";
import { askGemma, pingOllama, warmUp } from "./llm.js";
import { buildSystemMessage, SCENARIOS } from "./kb.js";

const app = express();
const PORT = process.env.PORT || 3000;

const sessions = new Map();

app.use(express.json());
app.use(express.static("public"));

app.get("/api/health", async (req, res) => {
  const online = await pingOllama();
  res.json({ ollama: online ? "online" : "offline", mode: process.env.LLM_MODE });
});

app.post("/api/chat", async (req, res) => {
  const { message, sessionId: incomingSessionId, scenario } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }

  if (scenario && !SCENARIOS.includes(scenario)) {
    return res.status(400).json({
      error: `Unknown scenario "${scenario}" — expected one of: ${SCENARIOS.join(", ")}`,
    });
  }

  const sessionId = incomingSessionId || randomUUID();
  const history = sessions.get(sessionId) || [];

  history.push({ role: "user", content: message });

  try {
    const systemContent = await buildSystemMessage(scenario);
    const messages = [{ role: "system", content: systemContent }, ...history];

    const reply = await askGemma(messages);
    history.push({ role: "assistant", content: reply });
    sessions.set(sessionId, history);
    res.json({ reply, sessionId });
  } catch (err) {
    res.status(500).json({ error: err.message, sessionId });
  }
});

app.listen(PORT, () => {
  console.log(`Ashroy server listening on port ${PORT} (LLM_MODE=${process.env.LLM_MODE})`);
  warmUp();
});
