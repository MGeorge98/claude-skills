# claude-skills

Skills for Claude Code (and any agent that reads `SKILL.md` packages).

## Install

```
npx skills add MGeorge98/claude-skills --skill pet-studio
npx skills add MGeorge98/claude-skills --skill ui-book
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

## License

MIT
