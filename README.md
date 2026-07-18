# Ashroy

Ashroy (আশ্রয়, "shelter") is an offline Bangla disaster-preparedness companion for Bangladesh. It answers earthquake, flood, cyclone, and first-aid questions through a chat interface, powered entirely by Gemma 4 (E2B) running locally via Ollama — no internet connection required. Every answer is grounded in a small, hand-curated knowledge base so the model never has to invent safety-critical instructions.

## Setup

1. [Install Ollama](https://ollama.com/download).
2. Pull and run the model:
   ```
   ollama run gemma4:e2b
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the app:
   ```
   npm start
   ```

## Running the offline demo

1. With Ollama running and the app started, open `http://localhost:3000`.
2. Turn off your wifi / disconnect from the internet.
3. Ask a question in the chat (e.g. "what do I do during an earthquake?").

The response still comes back — it's served entirely by the local Ollama model, nothing leaves the machine.

## Tech stack

- **Backend:** Node.js + Express
- **Model:** Ollama running `gemma4:e2b` locally
- **Frontend:** vanilla JS

## Cloud fallback (dev only)

A Gemini API fallback (`@google/genai`) exists behind `LLM_MODE` purely for development and testing when a local Ollama instance isn't available. It is **not** used for the actual demo — the real demo always runs against the local model.

## Knowledge base sources

Answers are grounded in `/kb/*.md`. Sources, per file:

- **Flood** — Bangladesh Red Crescent Society / IFRC
- **Cyclone** — Bangladesh Meteorological Department / CPP-BDRCS
- **Earthquake** — CDC, American Red Cross, Earthquake Country Alliance
- **First aid** — 2025 Resuscitation Council UK / European Resuscitation Council Guidelines
- **Emergency kit (go-bag)** — American Red Cross / Ready.gov, adapted for household realities in Bangladesh
