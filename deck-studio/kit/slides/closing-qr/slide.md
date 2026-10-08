# closing-qr

The action slide: the point on the left at h2 size, a QR code in a white rounded card on the right, the address
in mono under it, speaker contact and logo along the bottom. Steps 0, or 1 with `revealQr` (the card and the
address enter together at step 1, the point and the footer are already there).

## Props (`ClosingQrData`)
| prop | type | notes |
|---|---|---|
| `point` | `string` | the action, one sentence, 64px, max width 880px |
| `url` | `string` | plain text under the QR, mono 32px; copy it exactly from facts.md |
| `qr` | `{ src, alt, width, height }` | an SVG or PNG in `public/`, supplied by the owner; drawn 480px inside a 560px white card |
| `contact` | `{ name, line }?` | bottom left, name 36px, line 24px |
| `logo` | `{ src, width, height, alt }?` | bottom right, 56px high; never recolour a third-party logo |
| `revealQr` | `boolean?` | the QR card enters at step 1 (default: with the slide) |

## Steps
`steps = revealQr ? 1 : 0`. The card is a `rv="pop"` step, the URL trails it on `--i` 1. The card box is
laid out from step 0, so the point does not move when it arrives.

## Making the QR
From the app root: `npx qrcode -o public/qr.svg "<url>"` if the package is available, otherwise any generator
(export 640px wide, quiet zone 4 modules). Set `qr.width` and `qr.height` to the file's size. The kit example
points at `/exemplu-qr.svg`, a placeholder (a fake grid labelled "Exemplu QR", not scannable).
`sync-kit.sh` copies `kit/slides/closing-qr/public/exemplu-qr.svg` into the app `public/` (when missing) so the preview renders; replace it with the real QR.

## Do not recolour the QR
It must stay black on white. The white card is part of the type: never tint it, never put the code on a dark or
accent ground, never apply a CSS filter or blend mode, never scale it under about 400px. Test with a phone at
projector distance before the talk.

## Notes slot
The one thing you ask the audience to do, and what happens after they scan.

## Rules that bite
- The URL must be the same text the QR encodes; if they differ, the PDF reader gets the wrong address.
- Under 40 words: point 12 words, url, contact and logo alt fit with room to spare.
