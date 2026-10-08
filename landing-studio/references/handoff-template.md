# Handoff template (`<app>/HANDOFF.md`)

Written by the main session at the end of Phase 7. Short; the owner reads it on a phone.

```
# <Page> handoff, <YYYY-MM-DD>

## State
- Local: http://localhost:3050 (`npm run build && npm run start -- -p 3050`)
- Last commit: <hash> <subject>
- Audit: <green / list of open items>, sheets in <path>

## What it is
<two lines: the page, the one action, what happens after submit (who gets which email)>

## Owner-only, in order (not run by Claude)
1. Env on Vercel: `vercel env add SMTP_HOST production` ... (list every name from env.example)
2. Deploy: `vercel deploy --prod` from <app>
3. Real submit test on a phone from the production URL; check both emails, light, dark, Gmail iOS
4. QR / link: point it at <url> after step 3 passes
5. Push: `git push` (if wanted)

## Where leads go
<email notification to X; file log only where the host has a disk>

## Open
- <decision or question, who owns it>

## Facts to re-check before launch
- <F-ids whose source may change: dates, prices, names>
```
