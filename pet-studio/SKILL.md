---
name: pet-studio
description: Design an interactive brand mascot ("pet") for a product and deliver three distinct directions as live, state-driven prototypes the owner can open and compare, then refine the chosen one. Use when the user asks for a mascot, pet, character, companion, avatar creature, "mascota", "pet interactiv", "personaj pentru brand", or wants a chat/assistant to have a living face. Works from a product brief and a name; outputs three claude.ai artifacts plus a comparison and a recommendation.
---

# Pet Studio

Goal: a mascot that is a **character**, not an effect. It must live at 48 px in a chat bubble and at full screen in a hero, take the client's color through one token, and express the product's real behaviors as **states**. Three directions, built in parallel as interactive prototypes, so the owner picks with their hands, not from sketches.

Run it in orchestrator style: the main session writes the brief, delegates the three builds, looks at the screenshots itself, publishes, compares, recommends. It never builds a direction in the main context.

## Phase 0: the brief (main session, 10 lines)

Collect or decide, in this order. Defaults in brackets; decide them, do not ask unless the user left the name open.

1. **Product in one sentence** and what it does when it is at its best.
2. **Name** and where it comes from (myth, word, place). The origin is the seed for directions: an Oceanid suggests water, "golden" suggests light, a lantern suggests night study.
3. **Audience and surface**: who sees it, where (chat avatar, hero, loading state, empty state, error).
4. **The signature behavior**: the one thing the product does that competitors do not, which the mascot must make visible as a gesture. For an honest tutor it was *refusing* (saying "not in the material"). For a payments product it may be *the receipt*. This gesture decides the character; pick it before anything else.
5. **States** [idle, listening, thinking, answering, plus 2 to 4 product-specific ones such as citing, refusing, handoff, celebrate]. Eight is the ceiling for a prototype.
6. **Theming**: one brand color token the client can set; the form stays ours, the color is theirs. Decide *where* the color lives (the light, the thread, the rim) so the body does not turn into a flat tinted blob.
7. **Technical envelope** [self-contained HTML, no build step, 60 fps on a laptop, degrade on phones, reduced-motion fallback, light and dark themes, artifact page contract].
8. **Constraints on copy** (language, no em dashes, no invented claims in captions).
9. **Where files go** [`<project>/mascot/explore/<letter>-<slug>.html`, screenshots in `shots/`].
10. **Bar**: "a brand team would ship it". Say the word the owner used ("breathtaking", "cute", "serious").

## Phase 1: three directions (main session decides)

Pick three directions that differ in **material and metaphor**, not in color:

- One **material / effect** direction (threads of light, water, smoke, glass, paper): impressive, abstract, risky on face.
- One **creature** direction (an animal or insect that carries the metaphor: a moth with a lantern, an owl, a seahorse): strongest character, risk of clip art.
- One **object brought to life** direction (a lantern, a compass, a book, a key): clearest link to the product, risk of being a logo that blinks.

For each, write one paragraph: what it is made of, the two literal features (eyes are usually the only ones), and how **every state** reads in that material, especially the signature gesture. If a state has no distinct reading in a direction, that direction is weak; fix the concept before building.

Lessons from past runs (keep):
- The **face carries the character**. A direction with a stunning material and two white slits for eyes lost to a simple creature with living eyes. Spend the agent's iterations on eyes, silhouette and the signature gesture, not on shader polish.
- The signature gesture must be the **stillest** state, not the busiest: refusal read best as "lands, folds wings, dims the light, looks at you".
- The 48 px test is not optional; it kills most material directions. Draw the small version as a simpler pose with bigger eyes, not a scaled-down render.
- Raw WebGL or Canvas 2D beat a library: cdnjs stops at an old three.js UMD build, and artifacts allow no other host.
- Put the client color in the **light** (lantern, glow, rim), not the body; a body in the client's color looks like a tinted blob and the brand disappears.
- Idle and answering must differ in more than speed. Give answering a shape change (a wave, a flow, a lean).

## Phase 2: build in parallel (three Opus agents)

One agent per direction, launched in one message, each owning only its file and its screenshots. Brief from `references/brief-template.md` with the direction paragraph pasted in. The template already carries: the control strip (state buttons, keyboard 1 to 8), the color input with presets, the hero / 48 px avatar toggle inside a mock chat row, cursor tracking, reduced motion, the artifact page contract (no doctype, `<title>`, tokens on `:root` with the two dark blocks, explicit body background, no alert, 400 px wide with no horizontal scroll), the verification loop (serve, playwright screenshots of at least four states and one at 400 px, LOOK at them, fix, measure fps with rAF deltas), and the report format.

While they run, do nothing else on the mascot. Do not read their files.

## Phase 3: review from pixels (main session)

For each report:
1. Build a strip of four states (idle, thinking, the signature gesture, one more) with `scripts/strip.py` and look at it. Judge: does it have a face, does the signature gesture read at a glance, do states differ, does it look like the brand or like a stock particle demo.
2. Publish the HTML as an artifact (icon: a plain word, description: direction letter and what it is).
3. Note the agent's own "weakest states" honestly in the comparison.

Then give the owner one table: direction | link | strongest | weakest, and **one recommendation with reasons** tied to the brief (character, the signature gesture, theming, performance, size). Say what to steal from the losers for the winner.

## Phase 4: refine the pick (one Opus agent, two rounds max)

Brief: the winning file, the owner's notes, the steals from other directions, and a refinement list: silhouette and eyes, the two weakest states, the 48 px avatar, both themes screenshotted. Then package: a static pose for favicon/OG, the state API (`pet.set('citing', {target})`), an embed snippet, and a one-page branding note for clients (what they can change: the color; what they cannot: the form). Each round ends with screenshots the main session looks at.

## Report format to the owner

Short, action first. Links, the table, the recommendation, the next step. No design essays. Failures as failures (an agent that could not hit fps says so).
