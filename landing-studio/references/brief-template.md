# Brief template (`<app>/brief.md`)

The brief is the persistent context for every agent on the build: ten lines, read first, quoted in
every sub-agent brief. Together with `facts.md` it replaces re-explaining the project. Keep it at ten
lines; detail goes into `facts.md` or `storyboard.md`.

```
1  Page:        <name>, <who lands here, from where: QR on a slide, link in a DM, an ad>
2  Audience:    <who they are and what they already know when they land>
3  One action:  <the single thing they do>
4  Promise:     <what they get for it, in their words, from facts.md>
5  Story:       <the arc in one sentence: from X to Y>
6  Tone:        <three words>; voice <tu / dumneavoastră / you>; language <ro / en>
7  Dials:       DESIGN_VARIANCE <1-10> · MOTION_INTENSITY <1-10> · VISUAL_DENSITY <1-10>
8  Sources:     <paths and URLs; facts come only from these>
9  Constraints: <deadline, hosting, noindex, what must not appear, legal links>
10 Done:        <the owner's own test>
```

## The three dials

| Dial | 1-3 | 4-6 | 7-10 |
|---|---|---|---|
| DESIGN_VARIANCE | familiar grid, safe type, the category's conventions | one signature layout move per scene | layouts nobody in the category uses; asymmetric, editorial, risky |
| MOTION_INTENSITY | reveals and word masks only, no pins | two or three pinned scenes, one loop in the hero | the story is carried by pinned scenes; cascades, deals, wipes |
| VISUAL_DENSITY | one idea per screen, big type, lots of air | sections with a head and one block | dense editorial: grids of proof, side notes, small type |

Defaults when the owner gives none: event QR page 5 / 6 / 3 (warm audience, phone first, short
attention); product launch 7 / 7 / 4; founder or bio page 6 / 4 / 3. Higher MOTION costs perf budget
and audit time: a 9 needs a reason in line 5.

## After the owner picks a direction

Append, below the ten lines:
```
Direction: <name>, metaphor <one line>, scenes <ordered list>
Owner edits: <copy changes, with date>
```

## Example (Exemplu, from the SPEECH build, shape only)

```
1  Page:        MBV Summit QR page, people scanning the code on the last slide of the talk
3  One action:  leave name, email, phone; receive the three agents by email
7  Dials:       DESIGN_VARIANCE 6 · MOTION_INTENSITY 7 · VISUAL_DENSITY 3
8  Sources:     slide-uri/ (deck), cleancodeculture.com/projects, bio doc
10 Done:        scan the QR on a phone, submit, the email arrives with the attachments
```
