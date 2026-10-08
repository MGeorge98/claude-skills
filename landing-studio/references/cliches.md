# Clichés ban list (self-review before code, and in `gate.cjs`)

The storyboard agent reads this before handing over directions; scene agents read it before writing
copy; the audit scans rendered text and the email for the copy items. A hit is rewritten, not argued.
Sources: the house rules (`CLAUDE.md` of the portfolio repo), Anthropic's frontend-design guidance on
generic AI aesthetics, and what the owner rejected on past builds.

## Visual

| Banned | Why | Instead |
|---|---|---|
| Cream background with terracotta accent | the default "tasteful" AI palette | the brand's own tokens, read from source |
| Near-black with acid or neon green accent | the default "techy" AI palette | same |
| Purple to blue gradient hero, glass cards | the default SaaS look | one ground, one accent |
| Tracked uppercase eyebrow above every section | reads as a template | one eyebrow style, used where it earns it, or none |
| Three identical feature cards with an icon each | the SaaS grid nobody reads | one scene that shows the thing happening |
| Every block fading up on its own as you scroll | scattered motion, no story | one orchestrated moment per scene |
| Floating blobs, orbs, grain on everything | decoration standing in for an idea | an image or diagram that carries a fact |
| Emoji as icons, generic stock photos of laptops and handshakes | no brand, no truth | real photos from sources, or type alone |
| Fake browser chrome around a screenshot that is not the product | pretends | the real product UI, or nothing |
| Logo wall of clients without a source line | invented proof | only logos listed in `facts.md` |
| Star ratings, "Trusted by 10,000+" bars | invented metrics | stated facts with a source |
| Countdown timers, "only 3 spots left" | fake urgency | the real date, if there is one |
| A floating CTA over the form | covers the action | hide it from the form down |
| Centered everything, text over a busy photo | low contrast, no hierarchy | a grid with a clear reading order |
| Glow or gradient text on the headline | hurts contrast, dates the page | solid ink, one accent word or the accent period |

## Copy

| Banned | Instead |
|---|---|
| The em dash, anywhere (pages, emails, subjects, alt text, image text) | comma, colon, period, parentheses |
| "I hope this email finds you well" and its translations ("Sper că ești bine") | start with the reason for writing |
| Invented metrics: "3x faster", "save 10 hours a week", percentages without a source | the fact from `facts.md`, or nothing |
| Fake deadlines and scarcity: "today only", "last chance", "doar azi" | the real date from `facts.md` |
| Testimonials without a named, sourced person | omit |
| "Unlock", "elevate", "supercharge", "seamless", "game-changer", "revolutionize", "next-level", "in today's fast-paced world" | a plain verb that says what happens |
| "Not X, but Y" contrasts in every section | say Y |
| Forced triads ("fast, simple, powerful") | the one adjective that is true and sourced |
| One-line dramatic closers ("And that changes everything.") | end on the fact |
| Rhetorical question headlines ("Ready to transform your business?") | a statement in the visitor's words |
| "Unlimited" (and "nelimitat") as a capacity claim | the real limit, or leave it out |
| Exclamation marks in headlines | a period |
| Title Case Headlines | sentence case |
| "Click here", "Submit", "Learn more" as button labels | the action: "Trimite-mi agenții", "Book the call" |
| Romanian without diacritics in copy | full diacritics (ă â î ș ț, comma below) |

## The self-review pass (write the answers, do not just tick)

1. Which line of this direction could sit on any other company's page? Rewrite it with a fact.
2. Where is the one orchestrated moment? If there are three, pick one and calm the others.
3. Which visual choice came from the brand source, and which from habit? Replace the habit.
4. Read every number aloud with its F-id. No id, no number.
5. Search the copy for an em dash and every banned word above. Zero.
