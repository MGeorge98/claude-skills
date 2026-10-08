/**
 * landing-studio · boot script, run before first paint.
 *
 * Inline it as the FIRST child of <head> in app/layout.tsx, as a raw synchronous script:
 *
 *   <head>
 *     <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
 *   </head>
 *
 * Not next/script with strategy="beforeInteractive": in the App Router that queues the source
 * for the framework loader, which runs after first paint, so hidden states would flash.
 *
 * What it does:
 *  - adds `js` on <html> (every hidden state in motion.css is gated on html.js:not(.rm));
 *  - adds `rm` under prefers-reduced-motion (final state everywhere, no loops);
 *  - restores `paused` from sessionStorage (MotionToggle, key "ls-paused");
 *  - failsafe: if the engine has not added `mo` within `ms` (default 3500), swaps `js` for
 *    `ls-static`, which is the finished static page (JS chunks blocked, a crash, a slow device).
 *    motion.css carries the same deadline as a CSS animation (--ls-failsafe) for reveals.
 */
export function bootScript(ms = 3500): string {
  return (
    "(function(d){var c=d.classList;c.add('js');" +
    "try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)c.add('rm')}catch(e){}" +
    "try{if(sessionStorage.getItem('ls-paused')==='1')c.add('paused')}catch(e){}" +
    "setTimeout(function(){if(!c.contains('mo')){c.remove('js');c.add('ls-static')}}," +
    Math.max(0, Math.round(ms)) +
    ")})(document.documentElement)"
  );
}

export const BOOT_SCRIPT = bootScript(3500);
