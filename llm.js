import { GoogleGenAI } from "@google/genai";

const MODE = process.env.LLM_MODE;

export async function askGemma(messages) {
  switch (MODE) {
    case "local":
      return askGemmaLocal(messages);
    case "cloud":
      return askGemmaCloud(messages);
    default:
      throw new Error(
        `Unrecognized LLM_MODE "${MODE}" — expected "local" or "cloud"`
      );
  }
}

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma4:e2b";

async function askGemmaLocal(messages) {
  let response;
  try {
    response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false,
        options: { num_ctx: 16384, temperature: 0.3 },
        keep_alive: "30m",
      }),
    });
  } catch (err) {
    throw new Error(
      `Ollama is not reachable at ${OLLAMA_HOST} — is it running? Start it with \`ollama serve\`. (${err.message})`
    );
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Ollama returned ${response.status}: ${body}`);
  }

  const data = await response.json();
  return data.message.content;
}

export async function pingOllama() {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`);
    return response.ok;
  } catch {
    return false;
  }
}

// Hard rule (CLAUDE.md): the ONLY LLM allowed is Gemma. This must never be a gemini-* id.
const GEMMA_CLOUD_MODEL = "gemma-4-26b-a4b-it";

async function askGemmaCloud(messages) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set — cloud mode requires it.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");

  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  let response;
  try {
    response = await ai.models.generateContent({
      model: GEMMA_CLOUD_MODEL,
      contents,
      config: {
        systemInstruction: systemInstruction || undefined,
        temperature: 0.3,
      },
    });
  } catch (err) {
    throw new Error(`Gemini API request failed: ${err.message}`);
  }

  if (!response.text) {
    throw new Error("Gemini API returned an empty response");
  }
  return response.text;
}

const WARMUP_MAX_ATTEMPTS = 3;
const WARMUP_RETRY_DELAY_MS = 2500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function warmUp() {
  if (MODE !== "local") return;

  for (let attempt = 1; attempt <= WARMUP_MAX_ATTEMPTS; attempt++) {
    const start = Date.now();
    try {
      await askGemmaLocal([{ role: "user", content: "hello" }]);
      console.log(
        `[warm-up] ${OLLAMA_MODEL} loaded and ready (${Date.now() - start}ms, attempt ${attempt}/${WARMUP_MAX_ATTEMPTS})`
      );
      return;
    } catch (err) {
      console.warn(`[warm-up] attempt ${attempt}/${WARMUP_MAX_ATTEMPTS} failed: ${err.message}`);
      if (attempt < WARMUP_MAX_ATTEMPTS) {
        await sleep(WARMUP_RETRY_DELAY_MS);
      }
    }
  }

  console.warn(
    `[warm-up] all ${WARMUP_MAX_ATTEMPTS} attempts failed — first real request will pay the load cost instead`
  );
}
