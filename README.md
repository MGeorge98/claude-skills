# claude-skills

Skills for Claude Code (and any agent that reads `SKILL.md` packages).

## Install

```
npx skills add MGeorge98/claude-skills --skill pet-studio
```

## Skills

### pet-studio

Design an interactive brand mascot ("pet") for a product. Takes a product brief and a name, builds three distinct directions in parallel as live, state-driven prototypes (self-contained HTML, published as artifacts), reviews them from screenshots, returns a comparison table with one recommendation, then refines the pick into a shippable character with a state API, a static pose for favicon and OG, and a branding note for clients.

Invoke with `/pet-studio` and the brief, or just the name and what the product does; the rest has defaults.

What it encodes from real runs: the face carries the character, the signature gesture is the stillest state, the 48 px test is mandatory, the client color lives in the light and never in the body, idle and answering must differ in shape, raw WebGL or Canvas 2D over libraries.

Files: `pet-studio/SKILL.md` (the method), `pet-studio/references/brief-template.md` (the agent briefs), `pet-studio/scripts/strip.py` (review strip from screenshots).

## License

MIT
