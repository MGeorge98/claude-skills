# Facts ledger (`<app>/facts.md`)

The only place copy may take a claim from. Written by an Opus agent in Phase 1, read by every scene
agent, checked by `scripts/gate.cjs --facts facts.md`.

## Format

One line per claim, pipe separated, stable ids, never renumbered:

```
F-001 | <the claim, exactly as it may appear on the page> | <source file:line or URL> | verified
F-002 | <claim> | <source> | inferred
```

- **id**: `F-` plus three digits. Deleted lines keep their id with status `dropped`.
- **claim**: the wording the page may use. Numbers with units as in the source. Quotes in quotes.
- **source**: `path/to/file:line` (deck slide file, README, bio doc) or a URL with the date fetched.
  A claim with two sources lists both separated by ` + `.
- **status**: `verified` (read in the source, wording supported), `inferred` (reasoned, not stated),
  `dropped` (no longer true or no longer used).

**INFERRED never ships.** An inferred line exists so nobody re-derives it; it is not page copy.

## Sections (in this order)

```
## Identity       names, roles, company, event name, date, place
## Offer          what the visitor gets, format, when, conditions
## Proof          projects, clients, numbers (only stated ones), quotes with attribution
## Story          the before / after, the problem in the source's words
## Contact        email, phone, WhatsApp, privacy link, legal entity
## Brand          colours, fonts, logo files (paths), tone words from the source
## Not allowed    things the owner said must not appear
```

## Rules

- No invented numbers, testimonials, ratings, logos of clients without a source line, dates, scarcity.
- A number on the page counts what the illustration shows or quotes a source line. Illustrative data
  in a mock is labelled "Exemplu" and never presented as a result.
- Translation of a source claim keeps meaning; note `translated` after the status.
- Every `data.ts` line in a scene carries its F-id in a comment.

## Reconciliation when a source changes

1. Keep the old source (copy it to `sources/<name>.<date>.old`).
2. Diff old against new; list changed, added, removed claims.
3. Update `facts.md`: changed lines get new wording and source line, removed lines become `dropped`.
4. Produce a table and apply it:
```
| app file:line | current text | source line | F-id | action (keep / rewrite / remove) |
```
5. Re-run `gate.cjs --facts facts.md` and the sheets of every scene touched.
