# Product

## Register

product

## Platform

web

## Users

Primary users are people in Bangladesh living through a flood, cyclone, earthquake, or other emergency — on a phone, often on a cheap or older device, frequently with no signal, and possibly low-literacy and under acute stress. They open Ashroy to get fast, correct guidance on what to do right now, not to browse or explore. The interface has to work for someone who cannot afford to think hard about how to use it.

## Product Purpose

Ashroy is an offline emergency companion that answers disaster-preparedness and safety questions using Gemma running locally via Ollama, grounded in a vetted knowledge base, so guidance stays available exactly when the network fails. Success is a person in crisis opening the app, asking a question in Bangla, and getting a calm, accurate, actionable answer with zero internet connection.

## Positioning

The one emergency guide that keeps answering after the network goes down — because it runs entirely offline, on-device, which only an open model like Gemma can do.

## Brand Personality

Calm, clear, trustworthy. Low-stimulation and high-legibility, authoritative but warm — this reads as infrastructure someone can depend on, never as a toy or a tech demo showing off.

## Anti-references

Generic AI-chatbot / SaaS-cream aesthetics: gradient message bubbles, cream or beige backgrounds, cutesy bot avatars, playful microcopy, glassy widget chrome. Also avoid flashy "look what the model can do" tech-demo energy — anything that reads as impressive over trustworthy undercuts the product during an actual emergency.

## Design Principles

Legible under stress: big type, strong contrast, one primary action visible at a time — never a UI someone has to study.

Offline is the headline, not a footnote: the OFFLINE/LOCAL status indicator is structural to the layout, not a decorative badge tucked away.

Bangla-first: Bangla is the default voice of the interface, not an English-first design with a language toggle bolted on.

Grounded, not generic: every answer traces to vetted guidance, and the interface should visibly reinforce that it isn't improvising — the safety disclaimer stays present, not collapsed into a dismissible tooltip.

Minimal moving parts: no unnecessary chrome, animation, or feature surface — the same "no database, no RAG, one swappable model client" restraint from the backend should show up in how spare the UI is.

## Accessibility & Inclusion

WCAG AA contrast and tap-target sizing. Plain-language Bangla and English, short numbered steps, large text by default. Must remain usable on low-end/older phones and by low-literacy users under acute stress. Motion, where used at all, respects `prefers-reduced-motion` — calm delivery over expressive animation.
