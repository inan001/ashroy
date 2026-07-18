<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->

---
name: Ashroy
description: Offline Bangla-first emergency companion powered by Gemma — calm, trustworthy guidance when the network fails.
---

# Design System: Ashroy

## 1. Overview

**Creative North Star: "The Steady Signal"**

Ashroy is built to be the one thing that keeps working when everything else has gone dark. The visual system takes its cue from Signal's calm, high-contrast messaging UI, IFRC field guides' plain numbered instruction layout, and the stark utilitarian quiet of government emergency-alert systems — none of them decorative, all of them legible under pressure. A deep forest/Red Crescent green carries the surface: grounded, safety-oriented, and deliberately closer to disaster-relief branding than to a tech-startup palette. Motion stays responsive, never choreographed — transitions confirm that an action landed, they never make a stressed user wait to see an answer.

This system explicitly rejects generic AI-chatbot aesthetics: no gradient message bubbles, no cream/beige SaaS backgrounds, no cutesy bot avatars, no flashy "look what the model can do" tech-demo energy. Ashroy should read as infrastructure someone can depend on at 3am with the power out, not as a polished product demo.

**Key Characteristics:**
- Deep, muted green surface — safety-coded, not brand-coded
- Single humanist sans for Bangla + Latin, legible at large sizes
- Motion limited to feedback (message sent, mode switch, badge state) — no entrance choreography
- Flat by default; elevation appears only as a response to interaction, never as ambient decoration
- One reserved accent for the single moment that needs urgency: the life-threatening call-to-action and the OFFLINE/LOCAL status indicator

## 2. Colors

Color strategy is Committed: one deep, muted green carries the majority of every screen, with a single reserved accent that only appears where urgency is real.

### Primary
- **Deep Forest / Red Crescent Green** (`[to be resolved during implementation]`): the dominant surface color — background, primary chrome, primary buttons, scenario cards. Chosen to echo disaster-relief branding (Red Crescent, IFRC) rather than a tech-startup hue.

### Secondary
- **Signal Accent** (`[to be resolved during implementation]`): reserved narrowly for the single highest-urgency moment — the "call 999 / go to nearest shelter" instruction — and for the OFFLINE/LOCAL status indicator. Everywhere else, the interface stays inside the green + neutral family.

### Neutral
- **Ink** (`[to be resolved during implementation]`): primary text, tinted toward the green hue rather than true gray.
- **Paper** (`[to be resolved during implementation]`): light surface used for message content and readable text blocks — NOT cream or beige; chosen from the green ramp or true neutral, resolved during implementation.

### Named Rules
**The Single Alarm Rule.** Only the primary life-threatening call-to-action and the OFFLINE/LOCAL status badge are allowed to use the Signal Accent color. Message bubbles, scenario buttons, and body chrome stay within the deep green + neutral ramp — so the one moment that needs urgency is the only thing that reads as urgent.

## 3. Typography

**Display Font:** `[to be resolved during implementation]` — single humanist sans, chosen for strong Bangla + Latin rendering at large sizes.
**Body Font:** same family as Display — one family, multiple weights, not a pairing.
**Label/Mono Font:** `[to be resolved during implementation]` — a small monospace accent reserved for system/status text only (the OFFLINE badge, LOCAL/CLOUD mode indicator), to reinforce "infrastructure, not a toy."

**Character:** Warm but unfussy — legible first, characterful second. No display serif, no decorative weight; the personality comes from restraint, not flourish.

### Hierarchy
- **Display** (regular/medium weight, large clamp): scenario headers, the single most important line of any answer (e.g. the "call 999" instruction).
- **Headline**: section headers within a conversation (scenario name, KB source).
- **Title**: message sender labels, timestamps, secondary chrome.
- **Body** (max ~65–75ch where the layout allows it, though a narrow mobile chat column will often run shorter): the actual guidance text — this is what most users read most of the time, so it must never be the smallest or lightest thing on screen.
- **Label** (mono accent, small, wide letter-spacing): OFFLINE/LOCAL/CLOUD status, system-level indicators only.

### Named Rules
**The Body-Is-Not-Secondary Rule.** In most interfaces, body text is the quiet middle of the hierarchy. Here, body text IS the product — the emergency guidance itself. It must never be styled smaller, lighter, or lower-contrast than surrounding chrome.

## 4. Elevation

Flat by default. No ambient shadows, no glassmorphism, no decorative depth. Elevation appears only as a direct response to interaction — a pressed button, an active scenario card, a focused input — and disappears at rest. Depth is not a design flourish here; it's a state signal.

### Named Rules
**The Flat-By-Default Rule.** Surfaces sit flat at rest. The only surfaces allowed elevation are ones currently receiving input or confirming an action; the moment that state ends, elevation returns to zero.

## 5. Components

No components exist yet — this is a pre-implementation seed. Canonical primitives (chat bubble, scenario button, OFFLINE/LOCAL status badge, input field, disclaimer banner) should be synthesized from the tokens above once real UI code exists, then this file should be regenerated in scan mode to capture the actual implementation.

## 6. Do's and Don'ts

### Do:
- **Do** keep the deep forest/Red Crescent green as the dominant surface color across the whole app — it should feel consistent, not accented per-screen.
- **Do** reserve the Signal Accent color exclusively for the life-threatening call-to-action and the OFFLINE/LOCAL status indicator (The Single Alarm Rule).
- **Do** keep motion limited to feedback: message sent, mode switch, badge state change. Nothing decorative, nothing that delays a stressed user from seeing an answer.
- **Do** keep body/guidance text large, high-contrast, and never subordinate to chrome (The Body-Is-Not-Secondary Rule).
- **Do** take cues from Signal, IFRC field guides, and government emergency-alert systems: plain, numbered, high-contrast, zero decoration.

### Don't:
- **Don't** use cream, beige, or warm-tinted near-white backgrounds — this is the default AI-generated look and directly contradicts the deep-green, safety-coded strategy.
- **Don't** use gradient message bubbles, cutesy bot avatars, or any generic AI-chatbot-widget visual language.
- **Don't** add flashy "look what the model can do" tech-demo flourishes — every visual choice should read as trustworthy infrastructure, not a showcase.
- **Don't** choreograph entrances, scroll-driven reveals, or orchestrated animation sequences — motion here confirms actions, it doesn't perform.
- **Don't** let elevation/shadow appear at rest; depth only shows up in response to a live interaction.
- **Don't** introduce a second saturated accent color outside the Signal Accent — the palette stays disciplined even under pressure to "make it pop."
