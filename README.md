# claude-skills

Skills for Claude Code (and any agent that reads `SKILL.md` packages).

## Install

```
npx skills add MGeorge98/claude-skills --skill pet-studio
npx skills add MGeorge98/claude-skills --skill ui-book
npx skills add MGeorge98/claude-skills --skill orchestrator
npx skills add MGeorge98/claude-skills --skill landing-studio
```

## Skills

### pet-studio

Design an interactive brand mascot ("pet") for a product. Takes a product brief and a name, builds three distinct directions in parallel as live, state-driven prototypes (self-contained HTML, published as artifacts), reviews them from screenshots, returns a comparison table with one recommendation, then refines the pick into a shippable character with a state API, a static pose for favicon and OG, and a branding note for clients.

Invoke with `/pet-studio` and the brief, or just the name and what the product does; the rest has defaults.

What it encodes from real runs: the face carries the character, the signature gesture is the stillest state, the 48 px test is mandatory, the client color lives in the light and never in the body, idle and answering must differ in shape, raw WebGL or Canvas 2D over libraries.

Files: `pet-studio/SKILL.md` (the method), `pet-studio/references/brief-template.md` (the agent briefs), `pet-studio/scripts/strip.py` (review strip from screenshots).

### ui-book

Write a "UI book" of an application, a module, a flow or a prototype straight from its code: one illustrated chapter per screen with hand-built animated mock-ups, exact UI strings, every state, action and message; then a pattern library, a consistency audit with verified findings, UI/UX proposals, an optional halve-the-prose pass, an optional "ask the book" chat page (claude.ai artifact) and an optional one-page PDF. It is an orchestrator playbook: inventory → plan → pilot chapter (style approval) → parallel chapter waves → QA → patterns / audit / proposals → polish → extras.

Invoke with `/ui-book` and what to cover ("the bookings and payments module", "the whole operator dashboard", "the onboarding flow"); the book's language follows the product.

What it encodes from real runs: the code is the source of truth and nothing is invented; legends say what a part does; explanations live in pictures, legends and tables, not paragraphs; shared files are append-only per chapter; QA redoes the phone and print checks agents tend to skip; the halving pass needs tables and legends, not deletion.

Files: `ui-book/SKILL.md` (the method), `ui-book/references/` (plan and agent briefs), `ui-book/assets/` (page kit, flow engine, chapter and cover templates, chat page and index builder), `ui-book/scripts/` (render, links, print, prose count, CSS duplicate checks).

### orchestrator

CEO mode for a Claude Code session: the main session only plans, decides and delegates; all real work goes to subagents, so the expensive main context holds just the goal, the plan, decisions and short agent reports. Routes work by difficulty (`haiku` for lookups, `sonnet` by default, `opus` for genuinely hard or risky tasks), defines what a brief must contain, how to run agents in parallel, and how to verify cheaply.

Invoke with `/orchestrator`; it stays active until "stop orchestrator" / "normal mode".

Files: `orchestrator/SKILL.md`.

## License

MIT

### landing-studio

Orchestrator playbook plus a code kit for a story-driven landing page a brand team would ship: a Next.js 15 app built from the kit (attribute-driven scroll engine, pinned scenes with a smoothed `--p`, word masks, brand cascades, a lead API and a branded confirmation email), every claim traced to a facts ledger, verified by audit scripts (fold, scrollWidth, flick, paints, CLS, LCP unthrottled and under the Lighthouse mobile profile, JS ceiling, facts gate) and contact sheets you look at. Sixteen scenes in `kit/scenes/INDEX.md`, each with a spec, example data and a preview route: hero-words, pinned-beats, brand-pour, form-popup, drop-dock, dealt-cards, journey-path, portrait-hero, set-collage, intro-sequence, sticky-split, horizontal-pinned, before-after, timeline, number-wall, logo-marquee.

Invoke with `/landing-studio` and the material (an event, a talk, a deck, a product); the page's language follows the request. Phases: brief, facts, brand, storyboard (three directions, owner picks), scaffold, one reference scene then a fan-out of one agent per scene in its own clone, audit from pixels, ship through the owner.

What it encodes from real runs: the finished page must exist without motion (no JS, reduced motion and a dead bundle all render the settled composition, with a 3.5 s failsafe); pinned layouts gate on the engine, not on JS; every child of a pin is a pure function of `--p`; transforms, opacity and clip-path only; no em dashes, no invented facts; never raise a threshold to turn a red run green; a report that describes a frame correctly can still miss the bug in it, so look at the frames yourself.

Files: `landing-studio/SKILL.md` (the method), `CONTRACT.md` (the frozen kit contract), `kit/` (engine, CSS, React parts, scenes, backend, app template with `sync-kit.sh`), `scripts/` (audit, perf, gate, sheet, shoot, email preview), `references/` (brief, facts ledger, storyboard, motion language, parts contract, gotchas, clichés, handoff), `gallery/` (audit sheets of the kit demos).
