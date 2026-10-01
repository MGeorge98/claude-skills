/* =====================================================================
   UI Book — book.js
   No dependencies, works from file://. Three jobs:
   1. injects the icon sprite  (<svg class="m-ico"><use href="#i-NAME"/></svg>)
   2. runs every animated flow  (figure.flow — see the contract below)
   3. freezes flows on their final frame for print and reduced motion

   FLOW CONTRACT
   <figure class="flow" data-final="4">          data-final: frame shown in print /
     <div class="m-stage"> …mock… </div>           reduced motion (default: last step)
     <ol class="flow-steps">
       <li data-target="#x" data-ms="2600">…</li>  target = selector inside the figure;
     </ol>                                          the cursor moves there and taps it
   </figure>                                        data-tap="0" = move without tapping
   Inside the figure: data-on / data-swap / data-state="range" (see mock.css header).
   Step 0 is the starting frame; list item n is step n.
   Figure attributes: data-start (ms before step 1, default 1300),
   data-hold (ms on the last step before looping, default 3200).

   LANGUAGE: control labels follow <html lang>. Built in: en, ro. Add another by
   defining window.UIBOOK_STRINGS = {play:…, pause:…, restart:…, start:…,
   step:"Step {n} of {total}", show:"Show step {n}"} before this script runs.

   ICONS: lucide-style 24×24 strokes. Add project icons to I below (or inline a
   <symbol id="i-NAME"> in the chapter). Use the app's own icon names when it has them.
   ===================================================================== */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --------------------------------------------------------- strings -- */
  var LANG = {
    en: { play: "Play", pause: "Pause", restart: "From the start", start: "Start", step: "Step {n} of {total}", show: "Show step {n}" },
    ro: { play: "Redă", pause: "Pauză", restart: "De la început", start: "Începutul", step: "Pasul {n} din {total}", show: "Arată pasul {n}" }
  };
  var lang = (doc.getAttribute("lang") || "en").slice(0, 2).toLowerCase();
  var T = window.UIBOOK_STRINGS || LANG[lang] || LANG.en;
  function fmt(s, o) { return String(s).replace(/\{(\w+)\}/g, function (_, k) { return o[k]; }); }

  /* ---------------------------------------------------------- icons -- */
  var I = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    today: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11"/>',
    coin: '<circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 18V6"/>',
    alert: '<path d="m21.7 18-8-14a2 2 0 0 0-3.5 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3"/><path d="M12 9v4M12 17h.01"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-9 5.7a2 2 0 0 1-2 0L2 7"/>',
    support: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="m4.9 4.9 4.3 4.3M14.8 9.2l4.3-4.3M14.8 14.8l4.3 4.3M9.2 14.8l-4.3 4.3"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
    door: '<path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"/><path d="M2 20h20M14 12v.01"/>',
    bolt: '<path d="M4 14a1 1 0 0 1-.8-1.6l9.9-10.2a.5.5 0 0 1 .9.5l-1.9 6A1 1 0 0 0 13 10h7a1 1 0 0 1 .8 1.6l-9.9 10.2a.5.5 0 0 1-.9-.5l1.9-6A1 1 0 0 0 11 14z"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    filter: '<path d="M3 6h18M7 12h10M10 18h4"/>',
    arrowRight: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    arrowLeft: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    chip: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
    play: '<path d="M7 4.5v15l12.5-7.5z"/>',
    pause: '<path d="M8 4v16M16 4v16"/>',
    replay: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/>',
    book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15v-4M12 15V7M17 15v-6"/>',
    hand: '<path d="M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/>'
  };
  var sprite = '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">';
  Object.keys(I).forEach(function (k) {
    if (!document.getElementById("i-" + k)) sprite += '<symbol id="i-' + k + '" viewBox="0 0 24 24">' + I[k] + "</symbol>";
  });
  sprite += "</svg>";
  function injectSprite() {
    var holder = document.createElement("div");
    holder.innerHTML = sprite;
    document.body.insertBefore(holder.firstChild, document.body.firstChild);
  }

  /* ---------------------------------------------------------- ranges -- */
  // "3" = step 3 only · "3+" = step 3 and every later step · "2-4" · "0,3" (lists)
  function parseRange(str) {
    return String(str).split(",").map(function (part) {
      part = part.trim();
      if (part.slice(-1) === "+") return [Number(part.slice(0, -1)), Infinity];
      if (part.indexOf("-") > -1) {
        var ab = part.split("-");
        return [Number(ab[0]), Number(ab[1])];
      }
      return [Number(part), Number(part)];
    });
  }
  function inRange(ranges, n) {
    for (var i = 0; i < ranges.length; i++) if (n >= ranges[i][0] && n <= ranges[i][1]) return true;
    return false;
  }

  var CURSOR_SVG = '<svg viewBox="0 0 24 24"><path d="M4 2.5v17.2l4.6-4.3 3 6.8 3-1.3-3-6.7h6.3z" fill="#fff" stroke="#10263f" stroke-width="1.6" stroke-linejoin="round"/></svg>';

  /* ---------------------------------------------------------- one flow -- */
  function Flow(fig) {
    var self = this;
    this.fig = fig;
    this.stage = fig.querySelector(".m-stage");
    this.steps = [].slice.call(fig.querySelectorAll(".flow-steps > li"));
    this.n = this.steps.length;
    this.final = Number(fig.getAttribute("data-final")) || this.n;
    this.step = -1;
    this.timers = [];
    this.playing = false;
    this.userPaused = false;
    this.started = false;
    this.nodes = [].slice.call(fig.querySelectorAll("[data-on],[data-swap],[data-state]")).map(function (el) {
      var st = el.getAttribute("data-state");
      return {
        el: el,
        on: el.hasAttribute("data-on") ? parseRange(el.getAttribute("data-on")) : null,
        swap: el.hasAttribute("data-swap") ? parseRange(el.getAttribute("data-swap")) : null,
        state: st
          ? st.trim().split(/\s+/).map(function (pair) {
              var i = pair.lastIndexOf(":");
              return { r: parseRange(pair.slice(0, i)), cls: pair.slice(i + 1) };
            })
          : null
      };
    });

    if (this.stage && !this.stage.querySelector(".m-cursor")) {
      var c = document.createElement("span");
      c.className = "m-cursor";
      c.setAttribute("aria-hidden", "true");
      c.innerHTML = CURSOR_SVG;
      this.stage.appendChild(c);
    }
    this.cursor = this.stage ? this.stage.querySelector(".m-cursor") : null;

    var ctl = document.createElement("div");
    ctl.className = "flow-ctl";
    ctl.innerHTML =
      '<button type="button" class="flow-btn" data-act="toggle"><svg class="m-ico"><use href="#i-play"/></svg><span></span></button>' +
      '<button type="button" class="flow-btn" data-act="restart"><svg class="m-ico"><use href="#i-replay"/></svg><span></span></button>' +
      '<span class="flow-pos" aria-live="polite"></span>';
    ctl.querySelector('[data-act="toggle"] span').textContent = T.play;
    ctl.querySelector('[data-act="restart"] span').textContent = T.restart;
    var host = fig.querySelector(".flow-mock");
    if (host) host.appendChild(ctl);
    else if (this.stage) this.stage.parentNode.insertBefore(ctl, this.stage.nextSibling);
    this.ctl = ctl;
    this.btnToggle = ctl.querySelector('[data-act="toggle"]');
    this.pos = ctl.querySelector(".flow-pos");
    ctl.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.getAttribute("data-act") === "toggle") {
        if (self.playing) { self.userPaused = true; self.pause(); }
        else { self.userPaused = false; self.play(); }
      } else {
        self.userPaused = false;
        self.goto(0, false);
        self.play(true);
      }
    });
    this.steps.forEach(function (li, i) {
      li.setAttribute("tabindex", "0");
      li.setAttribute("role", "button");
      li.title = fmt(T.show, { n: i + 1 });
      var jump = function () { self.userPaused = true; self.pause(); self.goto(i + 1, false); };
      li.addEventListener("click", jump);
      li.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); jump(); }
      });
    });

    this.goto(reduce ? this.final : 0, false);
    if (reduce) this.markAll();
  }

  Flow.prototype.apply = function (n) {
    this.nodes.forEach(function (d) {
      if (d.on) d.el.classList.toggle("is-on", inRange(d.on, n));
      if (d.swap) d.el.classList.toggle("is-on", inRange(d.swap, n));
      if (d.state) d.state.forEach(function (s) { d.el.classList.toggle(s.cls, inRange(s.r, n)); });
    });
  };
  Flow.prototype.highlight = function (n) {
    this.steps.forEach(function (li, i) {
      li.classList.toggle("is-current", i + 1 === n);
      li.classList.toggle("is-done", i + 1 < n);
    });
    this.pos.textContent = n === 0 ? T.start : fmt(T.step, { n: n, total: this.n });
  };
  Flow.prototype.markAll = function () {
    this.steps.forEach(function (li) { li.classList.remove("is-current", "is-done"); });
    this.pos.textContent = "";
  };
  Flow.prototype.clearFocus = function () {
    var f = this.fig.querySelectorAll(".m-focus");
    for (var i = 0; i < f.length; i++) f[i].classList.remove("m-focus");
  };
  Flow.prototype.targetOf = function (n) {
    var li = this.steps[n - 1];
    var sel = li && li.getAttribute("data-target");
    return sel ? this.fig.querySelector(sel) : null;
  };
  Flow.prototype.moveCursor = function (el) {
    if (!this.cursor || !el) return;
    var st = this.stage;
    var s = st.getBoundingClientRect();
    var r = el.getBoundingClientRect();
    if (!r.width && !r.height) return;
    var x = r.left - s.left + st.scrollLeft + r.width * 0.55;
    this.cursor.style.left = x + "px";
    this.cursor.style.top = (r.top - s.top + st.scrollTop + r.height * 0.55) + "px";
    // phones: the stage scrolls sideways — bring the target into view
    if (st.scrollWidth > st.clientWidth + 2) {
      var want = Math.max(0, x - st.clientWidth / 2);
      if (st.scrollTo) st.scrollTo({ left: want, behavior: reduce ? "auto" : "smooth" });
      else st.scrollLeft = want;
    }
  };
  Flow.prototype.tap = function () {
    var c = this.cursor;
    if (!c) return;
    c.classList.remove("tap");
    void c.offsetWidth;
    c.classList.add("tap");
  };
  Flow.prototype.clearTimers = function () {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  };
  Flow.prototype.later = function (fn, ms) {
    this.timers.push(setTimeout(fn, ms));
  };
  // jump straight to a frame (no cursor travel)
  Flow.prototype.goto = function (n, keepPlaying) {
    this.clearTimers();
    this.clearFocus();
    this.step = n;
    this.apply(n);
    this.highlight(n);
    var t = n > 0 ? this.targetOf(n) : null;
    if (t) { this.moveCursor(t); t.classList.add("m-focus"); }
    if (!keepPlaying) this.setPlaying(false);
  };
  Flow.prototype.setPlaying = function (on) {
    this.playing = on;
    this.fig.classList.toggle("is-live", on && !reduce);
    this.btnToggle.querySelector("use").setAttribute("href", on ? "#i-pause" : "#i-play");
    this.btnToggle.querySelector("span").textContent = on ? T.pause : T.play;
  };
  Flow.prototype.play = function (fromStart) {
    this.started = true;
    this.setPlaying(true);
    if (fromStart || this.step >= this.n) this.goto(0, true);
    this.run(this.step);
  };
  Flow.prototype.pause = function () {
    this.clearTimers();
    this.setPlaying(false);
  };
  // run frame n, then schedule n+1
  Flow.prototype.run = function (n) {
    var self = this;
    this.clearTimers();
    if (n === 0) {
      this.goto(0, true);
      if (this.cursor) { this.cursor.style.left = "72%"; this.cursor.style.top = "78%"; }
      this.later(function () { self.run(1); }, Number(this.fig.getAttribute("data-start")) || 1300);
      return;
    }
    var li = this.steps[n - 1];
    var ms = Number(li.getAttribute("data-ms")) || 2800;
    var t = this.targetOf(n);
    this.step = n;
    this.highlight(n);
    this.clearFocus();
    var act = function () {
      self.apply(n);
      if (t) { t.classList.add("m-focus"); if (li.getAttribute("data-tap") !== "0") self.tap(); }
    };
    if (t) { this.moveCursor(t); this.later(act, 700); } else act();
    var hold = n === this.n ? Number(this.fig.getAttribute("data-hold")) || 3200 : 0;
    this.later(function () { self.run(n < self.n ? n + 1 : 0); }, ms + hold);
  };

  /* ---------------------------------------------------------- init -- */
  // Both run once at load on the whole page. Pages that insert figures
  // later (chat.html) call them again on the new node:
  //   UIBook.initFlows(node); UIBook.initMaps(node);
  // A figure or legend already initialised is skipped.
  var flows = [];
  var io = null;
  function within(root, sel) {
    root = root || document;
    var list = [].slice.call(root.querySelectorAll(sel));
    if (root.matches && root.matches(sel)) list.unshift(root);
    return list;
  }
  function initFlows(root) {
    if (!reduce && !io && "IntersectionObserver" in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var fl = e.target.__flow;
          if (!fl) return;
          if (e.isIntersecting && e.intersectionRatio >= 0.35) {
            if (!fl.playing && !fl.userPaused) fl.play(!fl.started);
          } else if (fl.playing) {
            fl.pause();
          }
        });
      }, { threshold: [0, 0.35, 0.6] });
    }
    return within(root, "figure.flow").filter(function (f) { return !f.__flow; }).map(function (f) {
      var fl = new Flow(f);
      f.__flow = fl;
      flows.push(fl);
      if (io) io.observe(f);
      return fl;
    });
  }
  // screen-map legends: hovering a legend line lights up its pin
  function initMaps(root) {
    within(root, "ol.legend[data-map]").forEach(function (ol) {
      if (ol.__map) return;
      var sel = ol.getAttribute("data-map");
      var map = (root && root.querySelector && root.querySelector(sel)) || document.querySelector(sel);
      if (!map) return;
      ol.__map = map;
      var pins = [].slice.call(map.querySelectorAll(".m-pin"));
      [].slice.call(ol.children).forEach(function (li, i) {
        var on = function (v) {
          pins.forEach(function (p) { if (p.textContent.trim() === String(i + 1)) p.classList.toggle("hot", v); });
        };
        li.addEventListener("mouseenter", function () { on(true); });
        li.addEventListener("mouseleave", function () { on(false); });
      });
    });
  }
  window.UIBook = { initFlows: initFlows, initMaps: initMaps, flows: flows };

  /* ---------------------------------------------------------- boot -- */
  function boot() {
    injectSprite();
    initFlows(document);

    // print: every flow shows its final frame + the full step list
    var saved = [];
    window.addEventListener("beforeprint", function () {
      saved = flows.map(function (fl) { return { fl: fl, step: fl.step, playing: fl.playing }; });
      flows.forEach(function (fl) { fl.pause(); fl.goto(fl.final, false); fl.clearFocus(); fl.markAll(); });
    });
    window.addEventListener("afterprint", function () {
      saved.forEach(function (s) { s.fl.goto(s.step, false); if (s.playing) s.fl.play(); });
    });

    initMaps(document);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
