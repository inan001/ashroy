# আশ্রয় (Ashroy) — Build Blueprint
### An offline, Bangla-first disaster & emergency companion powered by Gemma 4

> **Working title:** *Ashroy* (আশ্রয় = "shelter / refuge"). Rename freely — but pick something Bangla and evocative; judges remember it.
>
> **One-line pitch (your north star, memorize it):**
> *"When the flood takes the network, Ashroy still answers — a Bangla emergency guide that runs entirely offline on a phone-sized Gemma 4 model, because during a disaster the internet is the first thing to fail."*

---

## 0. Why this wins (keep this framing in your head the whole time)

The rubric: **Gemma Integration 30% · Innovation & Impact 30% · Functionality 20% · Presentation & Writeup 20%.**

- **Gemma is inseparable from the product.** The offline reasoning IS the app. You can't swap it out. → max integration score.
- **The differentiator is a Gemma-only capability.** No closed model (GPT/Claude/Gemini) can run offline on-device under Apache 2.0. You're doing the one thing only Gemma 4 can do. Say that sentence in the writeup verbatim.
- **The impact is undeniable and local.** Bangladesh is one of the most disaster-prone countries on earth; floods and cyclones knock out connectivity exactly when people need guidance most. That's real, visceral, and relevant to the judges.
- **The demo has a moment no one forgets:** you turn off the wifi on stage, and it keeps working.

---

## 1. Architecture (minimal & robust — the way you like it)

```
[ Browser UI ]  ──HTTP──▶  [ Node/Express server ]  ──▶  [ llm.js client ]
  chat + Bangla/EN                (in-memory only)              │
  OFFLINE badge                                                 ├─▶ LOCAL  → Ollama @ localhost:11434  (gemma4:e2b)   ◀── demo mode
  scenario buttons                                              └─▶ CLOUD  → Gemini API (gemma-4-26b-a4b-it)         ◀── dev fallback
                                          │
                                   [ knowledge base ]
                                   curated disaster guidance
                                   (markdown, stuffed into context)
```

Design principles:
- **No database.** In-memory conversation store, exactly like your IoT build. Fewer moving parts = a demo that doesn't break.
- **One swappable model client** (`llm.js`) with a single function `askGemma(messages)`. An env flag `LLM_MODE=local|cloud` picks the backend. Same interface either way. This is your contingency: build/test on cloud if your laptop struggles, **but the winning demo runs `LLM_MODE=local` with wifi off.**
- **Grounding without a vector DB.** Curated guidance is small enough to stuff directly into Gemma's context every turn. No RAG, no embeddings, no extra infra. This also keeps answers accurate and on-script (critical for safety).

### Stack
- **Backend:** Node + Express (your comfort zone)
- **Local model:** Ollama running `gemma4:e2b`
- **Cloud fallback:** `@google/genai` SDK, model `gemma-4-26b-a4b-it`
- **Frontend:** single-page chat (vanilla JS or a light React — your call). Build it with Claude's frontend-design skill for polish.
- **Knowledge base:** a folder of markdown files you assemble from trusted sources (see §3)

---

## 2. The offline engine (Ollama) — get this working Day 1

```bash
# 1. Install Ollama from ollama.com  (macOS: brew install ollama)
# 2. Start the server (leave this terminal open)
ollama serve
# 3. Pull + run Google's edge model (~first run downloads a few GB)
ollama run gemma4:e2b "what's the capital of France?"
#    → if you get "Paris", you're live and fully offline.
```

**Critical gotcha:** Ollama defaults to a **4K context window**, which is too small to hold your knowledge base. You must raise it. When you call the API, pass `num_ctx` (e.g. 16384). In a Modelfile it's `PARAMETER num_ctx 16384`.

**Calling it from Node** (native endpoint):
```js
// POST http://localhost:11434/api/chat
{ "model": "gemma4:e2b",
  "messages": [ /* system + history + user */ ],
  "stream": false,
  "options": { "num_ctx": 16384, "temperature": 0.3 } }
```
Or use the OpenAI-compatible endpoint at `http://localhost:11434/v1` (api key can be the literal string `ollama`), or the `ollama` npm package.

**Demo tips:**
- First call after loading is slow (model warm-up). Send one throwaway prompt right before you present so it's warm. Use `keep_alive` to keep it resident.
- Keep `temperature` low (0.2–0.4) so emergency answers are stable and grounded, not creative.

**Hardware check (do this first):** `gemma4:e2b` (~5GB) is the locked model for this build — chosen for VRAM safety on an RTX 3050, not as a fallback. If it's still tight, run `LLM_MODE=cloud` for dev and only switch to local for the final offline demo. Either way, the offline claim stays true because you *can* run it locally.

### Cloud fallback (for building fast / if laptop is weak)
1. Get a free key at **aistudio.google.com/apikey** (Google account only, no card).
2. `npm i @google/genai`, model id `gemma-4-26b-a4b-it`. Free tier ≈ 15 requests/min.
3. ⚠️ **Never use a `gemini-*` model id.** Gemma ≠ Gemini. Rules say Gemma 4 must be the *only* LLM — a stray Gemini call can disqualify you.

---

## 3. The knowledge base (this is what makes it safe AND accurate)

Your app must **not** let the model improvise medical or safety instructions. Instead, you feed it vetted guidance and instruct it to answer *only* from that.

**Do NOT write the safety content yourself or let me invent it.** Source it from authoritative bodies and paraphrase into your KB with attribution:
- Bangladesh Red Crescent Society / IFRC disaster preparedness materials
- WHO first-aid & emergency basics
- Bangladesh Department of Disaster Management guidance
- UNICEF / NDRCC flood & cyclone preparedness sheets

**KB structure** (`/kb/*.md`, one file per scenario, kept tight — a few thousand tokens total):
```
/kb/flood.md        → before / during / after a flood; safe water; evacuation
/kb/cyclone.md      → warning signals; shelter; what to carry
/kb/earthquake.md   → drop-cover-hold; after-shock safety
/kb/firstaid.md     → bleeding, burns, CPR basics — VERBATIM from trusted source, cited
/kb/kit.md          → emergency kit checklist; important documents
/kb/contacts.md     → national emergency numbers (999), local shelter info
```

Each file = short, scannable, plain Bangla + English. At request time, load the relevant scenario file(s) into the system context.

**Safety rails baked into the product:**
- Persistent banner: *"This is general preparedness guidance, not a substitute for emergency services. Call 999."*
- System prompt forbids inventing clinical instructions beyond the KB and tells the model to direct users to professional/emergency help for anything serious.
- Low temperature + grounded context = minimal hallucination = a demo that looks airtight.

---

## 4. The Gemma system prompt (the heart of the app)

Put this in `/prompts/system.md` and prepend the relevant KB. Draft:

```
You are Ashroy, a calm, clear emergency companion for people in Bangladesh during
floods, cyclones, earthquakes, and everyday emergencies. You work OFFLINE.

RULES:
- Answer ONLY using the GUIDANCE provided below. Do not invent medical, dosage, or
  clinical instructions. If the guidance doesn't cover it, say so and tell the user
  to call 999 or reach the nearest health worker / shelter.
- Reply in the user's language. If they write Bangla, reply in simple Bangla.
- Be brief and calm. Short steps, numbered. Assume the user is stressed and may be
  low-literacy. Lead with the single most important action.
- For anything life-threatening, the FIRST line is: call 999 / go to the nearest shelter.
- Never guess about their exact location or the current weather — you have no internet.

GUIDANCE (authoritative, vetted):
<<< insert the relevant /kb/*.md content here >>>
```

Tune this against real questions on Day 1. Gemma 4 supports a native `system` role, so use it properly.

---

## 5. Frontend (UX is scored — make it feel real)

Single-page chat, built for a stressed user on a phone:
- **Big, high-contrast text.** Large tap targets.
- **A visible `● OFFLINE` badge** that turns green when the local server responds without internet. This is your demo's visual proof — lean into it.
- **Scenario quick-buttons** (🌊 বন্যা / 🌀 ঘূর্ণিঝড় / 🩹 প্রাথমিক চিকিৎসা / 📦 জরুরি ব্যাগ) that seed the conversation — great for people who can't type much and great for a fast demo.
- **Bangla / English toggle.**
- **Disclaimer banner** always visible.
- (Optional, if time) **Voice input** — if `gemma4:e2b` accepts audio input (verify this against the locked model before committing to this feature; audio support may differ from E4B), a "hold to speak Bangla" button is a killer accessibility feature. Ship the text version first; add this only if Days 1–4 go smoothly.

Prototype the whole UI as a Claude artifact first (fast, visual), then wire it to your `/api/chat` endpoint.

---

## 6. Day-by-day plan (solo, 6 days → deadline Jul 18, 11:55 PM GMT+6)

**Day 1 — Prove the engine (today).**
Hardware check → install Ollama → `gemma4:e2b` running → send it 5 Bangla emergency questions to judge quality. **Confirm Bangla output is good before committing.** `gemma4:e2b` is locked for VRAM safety on the RTX 3050, so if Bangla quality is weak, don't move to a bigger local model — fall back to `gemma-4-26b-a4b-it` on cloud for dev/testing and keep `e2b` for the final local offline demo. Create the repo + `CLAUDE.md`.

**Day 2 — Thin vertical slice.**
Express server + `llm.js` (local mode) + a bare chat page. Hard-code one KB file into the system prompt. Goal: type a flood question → get a grounded Bangla answer, offline. That's your insurance — a working core by end of Day 2.

**Day 3 — Grounding + scenarios.**
Build the `/kb` files (sourced, cited, paraphrased). Wire scenario selection so the right KB loads. Add conversation memory (in-memory). Add the safety rails + disclaimer.

**Day 4 — Make it real.**
Frontend polish with the frontend-design skill: OFFLINE badge, scenario buttons, Bangla/EN toggle, big readable type. Add the cloud fallback path behind the env flag.

**Day 5 — Bulletproof + document.**
Record the backup demo video (turn wifi OFF on camera — this is the hero shot). Write the README. Draft the ≤1,500-word Kaggle writeup (§7). Test edge cases; confirm it refuses to improvise medical advice.

**Day 6 — Ship.**
Build the 6-slide pitch deck (§8). Final test. **Submit early:** Kaggle writeup + public repo link + demo link → hit **Submit** (a saved-but-unsubmitted writeup does NOT count) → then fill the Google form. Don't wait for 11:55 PM.

---

## 7. Kaggle writeup skeleton (≤1,500 words — map every section to points)

**Title:** Ashroy — An Offline Bangla Emergency Companion Powered by Gemma 4
**Subtitle:** Because during a disaster, the network is the first thing to fail.

1. **The problem (impact points).** Bangladesh's exposure to floods/cyclones; connectivity, power, and data access collapse exactly when guidance is most needed. One concrete human scenario (a family during a flood night, no signal). ~200 words.
2. **Why it matters.** Scale of affected population; the gap between online AI help and offline reality. ~150 words.
3. **The solution.** What Ashroy does: offline Bangla Q&A + scenario guidance + safety rails. ~200 words.
4. **How Gemma 4 is integrated (integration points — spend words here).** [WRITEUP TODO: confirm final language] E2B running fully offline via Ollama; the exact capabilities you use — multilingual (140+ languages incl. Bangla), 128K context for grounding, native system role, low-latency edge inference; grounded generation over a vetted KB. State the winning line: *this is the one thing only an open Apache-2.0 model like Gemma 4 can do.* ~300 words.
5. **Architecture.** Your diagram from §1; the swappable local/cloud client; why no DB, why context-stuffing over RAG. ~200 words.
6. **Challenges & how you solved them.** Ollama's 4K default context; keeping medical answers grounded/safe; Bangla quality tuning; warm-up latency. ~150 words.
7. **Impact & future work.** Real deployment path (preloaded on cheap Android phones for shelters/volunteers); voice for low-literacy users; more scenarios; on-device privacy. ~150 words.

Keep it tight and concrete. Judges reward clarity over volume.

---

## 8. Pitch / demo outline (6 slides + the live moment)

1. **Hook** — a photo of a flood; "During the last flood, the network went down for days. So did every AI app."
2. **Problem** — scale + the offline gap.
3. **Solution** — Ashroy, one screenshot.
4. **Why Gemma 4** — offline, Apache 2.0, Bangla, on a phone. The line only Gemma can claim.
5. **LIVE DEMO** — open the app, **turn off wifi in front of them**, ask a flood question in Bangla, get a calm grounded answer. Show the OFFLINE badge. (Have the backup video ready in case.)
6. **Impact & next** — deploy on cheap phones for shelters; voice input; more disasters.

Build it with Claude's pptx skill. Presentation is ~20% and most teams neglect it — this is free points.

---

## 9. CLAUDE.md (drop this in your repo root — Claude Code reads it every task)

```markdown
# Ashroy — offline Bangla disaster companion

## What this is
An offline emergency guide for Bangladesh. Node/Express backend serves a chat UI.
AI answers come from Gemma 4 running LOCALLY via Ollama (gemma4:e2b) — no internet.

## HARD RULES
- The ONLY LLM allowed is Gemma 4. Never call any gemini-*, gpt-*, or claude-* model.
- Primary mode is LOCAL (Ollama @ localhost:11434). Cloud (Gemini API, gemma-4-26b-a4b-it)
  is a dev fallback behind LLM_MODE only.
- No database. In-memory state only.
- Answers must be grounded in /kb/*.md. Never let the model invent medical instructions.

## Stack
Node + Express · Ollama (gemma4:e2b) · @google/genai (fallback) · vanilla JS/React frontend

## Conventions
- Keep it minimal and robust. Small commits, one feature at a time.
- Ollama needs num_ctx raised (default 4K is too small) — use 16384.
```

---

## 10. Claude Code build prompts (copy-paste, in order)

Run these one at a time. Approve the plan, let it build, commit after each works.

**Prompt 1 — scaffold**
> Read CLAUDE.md. Scaffold a minimal Node + Express app: `server.js` with a `POST /api/chat` route, an in-memory session store, static file serving for a `/public` folder, and a `.env` with `LLM_MODE=local`. Add a `llm.js` module exporting `async askGemma(messages)` — stub both a `local` (Ollama) and `cloud` (@google/genai) implementation, selected by `LLM_MODE`. Don't build the UI yet. Show me the plan first.

**Prompt 2 — local Gemma via Ollama**
> Implement the `local` path in `llm.js`: POST to `http://localhost:11434/api/chat` with model `gemma4:e2b`, `stream:false`, and `options.num_ctx = 16384`, temperature 0.3. Take a `messages` array (system + history + user) and return the assistant text. Add a `/api/health` route that pings Ollama and reports offline/online. Handle the case where Ollama isn't running with a clear error.

**Prompt 3 — grounding + system prompt**
> Create `/prompts/system.md` (I'll paste the content) and a `/kb` folder with placeholder files: flood.md, cyclone.md, earthquake.md, firstaid.md, kit.md, contacts.md. In `server.js`, before calling the model, build the system message by combining system.md with the KB file(s) relevant to the request. Add a `scenario` field to `/api/chat` that selects which KB files to load. Keep total context modest.

**Prompt 4 — chat UI**
> Build `/public/index.html` + a single JS file: a clean mobile-first chat interface. Big high-contrast Bangla-friendly type. A green/grey `● OFFLINE` badge driven by `/api/health`. Four scenario quick-buttons (flood, cyclone, first-aid, emergency kit) that send a seeded message. A Bangla/English toggle. A persistent disclaimer banner. No frameworks unless needed. Match a calm, trustworthy visual style.

**Prompt 5 — cloud fallback**
> Implement the `cloud` path in `llm.js` using `@google/genai` with model `gemma-4-26b-a4b-it`, reading `GEMINI_API_KEY` from env. Same input/output shape as the local path. Confirm nothing anywhere calls a `gemini-*` model.

**Prompt 6 — polish**
> Add: model warm-up on server start (one throwaway prompt), graceful errors shown in the chat UI, and a small header note showing which mode (LOCAL/CLOUD) is active. Then write a README with setup steps (install Ollama, `ollama run gemma4:e2b`, `npm install`, run) and a one-paragraph project description.

**Prompt 7 (optional, if time) — voice**
> Add a "hold to speak" button that records mic audio and sends it to the local Gemma 4 endpoint (verify `gemma4:e2b` supports audio input before building this — max 30s if so). Transcribe/answer in Bangla. Keep the text flow as the default; voice is additive.

---

## 11. Submission checklist (Day 6)

- [ ] Public GitHub repo (source + README + dependency list) — publicly accessible
- [ ] Working demo: hosted app **or** a recorded video showing the offline moment **or** a runnable Kaggle notebook
- [ ] Kaggle Writeup created, ≤1,500 words, repo + demo attached under Attachments → Project Links
- [ ] **Clicked Submit on the Writeup** (not just saved)
- [ ] Filled the Google form after Kaggle submission
- [ ] Verified: only Gemma 4 is used anywhere. No other LLM.
- [ ] Disclaimer + safety rails visible in the app

---

## 12. Watch-outs

- **Gemma ≠ Gemini.** The single most common disqualifier. Grep your code for `gemini` before submitting.
- **Ollama's 4K default context** silently truncates your KB. Always set `num_ctx`.
- **Warm-up latency** on the first call — pre-warm before the demo.
- **Don't over-scope.** Text chat + grounding + offline demo is a *complete, winning* project. Voice and multi-scenario polish are bonuses, not requirements.
- **The writeup is 20% and easy to win.** Don't leave it to the last hour.
