import { readFile } from "node:fs/promises";
import path from "node:path";

const PROMPTS_DIR = path.join(process.cwd(), "prompts");
const KB_DIR = path.join(process.cwd(), "kb");

export const SCENARIOS = ["flood", "cyclone", "earthquake", "firstaid", "kit", "contacts"];

const KB_PLACEHOLDER = "<<< insert the relevant /kb/*.md content here >>>";
const NO_SCENARIO_NOTE =
  "No specific scenario guidance is loaded for this message. If the user's question " +
  "needs vetted specifics you don't have, say so and direct them to call 999 or reach " +
  "the nearest health worker / shelter.";

export async function buildSystemMessage(scenario) {
  const systemPrompt = await readFile(path.join(PROMPTS_DIR, "system.md"), "utf-8");

  const kbContent = scenario
    ? await readFile(path.join(KB_DIR, `${scenario}.md`), "utf-8")
    : NO_SCENARIO_NOTE;

  if (systemPrompt.includes(KB_PLACEHOLDER)) {
    return systemPrompt.replace(KB_PLACEHOLDER, kbContent);
  }

  return `${systemPrompt}\n\n## Guidance (authoritative, vetted)\n${kbContent}`;
}
