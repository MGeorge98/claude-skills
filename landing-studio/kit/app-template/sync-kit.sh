#!/usr/bin/env bash
# Copies the kit into an app made from kit/app-template. Safe to re-run (re-sync after a kit fix).
#   kit/app-template/sync-kit.sh <app-dir> [--scenes hero-words,pinned-beats] [--backend]
# Layout inside the app:
#   src/kit/engine/{engine,math,boot}.ts   src/kit/react/*.tsx   src/styles/{tokens,motion}.css
#   src/scenes/<name>/                      src/app/preview/<name>/page.tsx (one per scene, dev only)
#   --backend: src/app/api/lead/route.ts, src/lib/{leads,email}.ts, src/config.ts, .env.example
# Written only when missing (the app owns them after the first copy): src/styles/tokens.css,
# src/config.ts, .env.example, every src/app/preview/<name>/page.tsx.
set -euo pipefail
KIT="$(cd "$(dirname "$0")/.." && pwd)"
[ -d "$KIT/engine" ] || { echo "run sync-kit.sh from the skill (kit/app-template/), not from a copy inside the app" >&2; exit 1; }
APP=""; SCENES=""; BACKEND=0
while [ $# -gt 0 ]; do
  case "$1" in
    --scenes) SCENES="${2:?--scenes needs a comma list}"; shift 2 ;;
    --scenes=*) SCENES="${1#--scenes=}"; shift ;;
    --backend) BACKEND=1; shift ;;
    -h|--help) sed -n '2,9p' "$0"; exit 0 ;;
    *) APP="$1"; shift ;;
  esac
done
[ -n "$APP" ] || { echo "usage: sync-kit.sh <app-dir> [--scenes a,b] [--backend]" >&2; exit 1; }

mkdir -p "$APP/src/kit/engine" "$APP/src/kit/react" "$APP/src/styles"
cp "$KIT"/engine/{engine,math,boot}.ts "$APP/src/kit/engine/"
cp "$KIT"/react/*.tsx "$APP/src/kit/react/"
cp "$KIT/css/motion.css" "$APP/src/styles/motion.css"
[ -f "$APP/src/styles/tokens.css" ] || cp "$KIT/css/tokens.css" "$APP/src/styles/tokens.css"
echo "kit: engine, react, styles"

IFS=',' read -r -a LIST <<< "$SCENES"
for s in "${LIST[@]}"; do
  [ -n "$s" ] || continue
  [ -d "$KIT/scenes/$s" ] || { echo "no scene kit/scenes/$s" >&2; exit 1; }
  mkdir -p "$APP/src/scenes/$s"
  # scene.md stays in the skill; code, css, example data and the preview travel
  find "$KIT/scenes/$s" -maxdepth 1 -type f ! -name '*.md' -exec cp {} "$APP/src/scenes/$s/" \;
  pv="$APP/src/app/preview/$s/page.tsx"
  if [ -f "$KIT/scenes/$s/preview.tsx" ] && [ ! -f "$pv" ]; then
    mkdir -p "$(dirname "$pv")"
    cat > "$pv" <<TSX
import Motion from "@/kit/react/Motion";
import Preview from "@/scenes/$s/preview";

/* dev preview: the scene alone between two 100svh spacers (sync-kit.sh). Delete src/app/preview before ship. */
export default function Page() {
  return (
    <main>
      <div style={{ height: "100svh" }} />
      <Preview />
      <div style={{ height: "100svh" }} />
      <Motion />
    </main>
  );
}
TSX
  fi
  echo "scene: $s -> src/scenes/$s"
done

if [ "$BACKEND" = 1 ]; then
  mkdir -p "$APP/src/app/api/lead" "$APP/src/lib"
  cp "$KIT/backend/api/lead/route.ts" "$APP/src/app/api/lead/route.ts"
  cp "$KIT/backend/lib/leads.ts" "$KIT/backend/lib/email.ts" "$APP/src/lib/"
  [ -f "$APP/src/config.ts" ] || cp "$KIT/backend/config.example.ts" "$APP/src/config.ts"
  [ -f "$APP/.env.example" ] && grep -q SMTP_HOST "$APP/.env.example" || cp "$KIT/backend/.env.example" "$APP/.env.example"
  echo "backend: src/app/api/lead, src/lib, src/config.ts"
fi
echo "synced into $APP"
