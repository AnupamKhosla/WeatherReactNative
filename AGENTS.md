# AGENTS.md

Rules for any AI agent working on this project.

## Project goal

- Build **Global Weather** into a **profitable** premium weather **SaaS** with a
  **freemium** model: users **log in**, and **paid members unlock more
  features**. This is a real paying business. Revenue comes from subscriptions,
  not ads — a clean, ad-free experience is itself a differentiator against
  ad-riddled apps.
- Win by shipping **features competitors don't have**, **cheaper**, with a
  **better UI**: a beautiful **glass UI** and **procedural cinematic
  backgrounds** that scale to every city for free (no per-city photo / video /
  3D content cost — the expensive moat we deliberately avoid), plus a
  recognizable editorial / moody **brand voice**. Out-class Apple / Carrot /
  Overdrop / Breeze on price and polish.
- Optimize for **creative + cheap + unique**. Prefer generated / procedural
  visuals over hand-authored assets. Keep the free, no-key Open-Meteo data
  layer swappable behind the stable internal contract.
- **Ongoing product + competitor research is a core part of this project, not
  a one-time task.** Every session the AI should *keep researching* the
  weather-app market — what Apple / Carrot / Overdrop / Breeze and new entrants
  ship, their pricing, feature sets and visual trends — and bring back cheap,
  unique, *profitable* ideas that fit the goals above. Research first, then
  build; cite what you found. This is a habit, not a checkbox.

## Response length

- **Every output response: 100-200 words.** Occasionally 200+ words if a
  teaching moment truly needs it. No exceptions for routine replies. -- This is called semi caveman mode.


## Working style

- Explain along the way. Do not rush ahead. Pause for the user to catch up.
- Never do 5 edits in silence then summarize.
- Teach the *why*, not just the *what*. One concept per response max.
- **Never do something without asking or telling the owner first.** No
  surprise installs, deletes, renames, refactors, or file additions — even
  if they seem helpful. Ask, then act only after approval.
- When a command might fail or have side effects, say so before running it.

## TypeScript

- Keep TypeScript **simple**. No over-engineering, no verbose casts or
  utility types when a plain type works.
- **Only type what we know for sure.** Shapes we own and control (our
  component props, our internal return contracts) get tight types.
  Everything volatile — external/third-party JSON, API responses — stays
  loose (`unknown`, `Record<string, unknown>`) and is narrowed defensively
  at the boundary with guards.
- One stable internal contract between the data layer and the UI
  (e.g. `WeatherResult`). If an upstream API changes, adapt inside the data
  layer so this shape — and everything that consumes it — never has to.

## API / future-proofing

- We **do not know what the API will be.** Never hard-code assumptions
  about an external API's schema into app code. Treat all external data as
  untrusted and untyped; isolate the parsing in one place.
- Prefer free, no-key, stable sources, but keep them swappable behind the
  internal contract above. The rest of the app must not care which provider
  is used.

## Session continuity / memory

The **single most important goal**: the next AI session must be able to
open this repo and immediately know what was done, the current state of
the project, and exactly what is pending — without re-deriving it.

- **Start of every session:** before doing anything, read the persisted
  project state (memory tooling, then the in-repo state doc as fallback).
  Never assume a clean slate.
- **At every meaningful checkpoint** (task finished, big decision made,
  session about to end, something blocked), write a *concise* update of:
  what just changed, current state, and what is pending / next.
- **Use whatever memory tooling is available, in this order of preference:**
  server / graph memory (e.g. Supermemory or any connected memory MCP
  server), then context/resource tools, then — if none is wired up or its
  key is missing — a small in-repo state file (e.g. `docs/SESSION_STATE.md`)
  committed with the code. If a better tool appears later, migrate to it;
  the rule is the *habit*, not the specific tool.
- The Supermemory **containerTag for this project is `globalweather`**. Always
  read and write memories scoped to that tag, otherwise they won't be
  retrievable next session.
- Keep entries **short and scannable** (a few bullets, not prose walls).
  Tag each with what's *done* vs *pending* so the next session can resume
  mid-task, not just mid-project.
- If the memory tool errors (missing key / not connected), say so once and
  fall back to the in-repo state file rather than silently losing the
  context.
