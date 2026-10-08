# Storyboard template (`<app>/storyboard.md`)

Three directions, written by one Opus agent in Phase 3. They differ in **metaphor** (what the page is
a picture of), not in colour or font. Scenes come from `kit/scenes/INDEX.md`; a scene not in the
index is a new scene and costs a reference build.

## Per direction

```
### Direction <A/B/C>: <name>
Metaphor: <one line: the page is a ... (a deck of cards being dealt, a brand pouring in, a desk)>
Why it fits: <one line tied to brief line 5>
Dials honoured: V <n> · M <n> · D <n>
```

| order | scene (kit name) | copy slots → fact ids | mobile note | frames to verify |
|---|---|---|---|---|
| 1 | <hero scene> | eyebrow F-003, headline F-001, sub F-004, CTA "<label>" | hook and CTA inside 390x844; loops pause off-screen | p0 at 390 and 1440, fold boxes |
| 2 | <pinned scene> `--len 240vh` | head F-010, items F-011..F-016 | parallax off under 1024 | p0 (first group visible), p.5, p1, flick |
| 3 | ... | ... | ... | ... |
| n | form | labels, consent F-040, privacy link F-041 | 16 px inputs; floating CTA hidden from here down | empty, error, success popup |

CTA labels and form labels are interface copy, not facts; everything else maps to an F-id.

## Self-review before handing over (write the result under each direction)

- Clichés: checked against `cliches.md`; hits found and rewritten: <list or none>.
- One orchestrated moment: which scene carries it: <scene>.
- The hero states the hook in one screen at 390x844: <yes, with the line>.
- Every scene has one idea; no two adjacent scenes use the same motion.
- Each direction has one still (hero at 1440) so the owner compares pictures, not tables.

## Recommendation

One paragraph: which direction and why, in terms of the brief's audience and one action.
