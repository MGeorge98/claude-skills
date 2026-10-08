import { NextResponse } from "next/server";
import { interese, site } from "@/config";
import { notifyOwner, sendParticipant, smtpConfigured } from "@/lib/email";
import { saveLead, type Lead } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const valid = new Set<string>(interese.map((i) => i.id));

// Frână simplă împotriva trimiterilor repetate de pe aceeași adresă IP (ține doar cât rulează procesul).
const hits = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 8;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cerere invalidă." }, { status: 400 });
  }

  // Câmp-capcană: oamenii nu-l văd, roboții îl completează. Răspundem „ok” și nu facem nimic.
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "necunoscut";
  if (tooMany(ip)) {
    return NextResponse.json({ ok: false, error: "Prea multe încercări. Mai încearcă într-un minut." }, { status: 429 });
  }

  const nume = String(body.nume ?? "").trim().slice(0, 120);
  const companie = String(body.companie ?? "").trim().slice(0, 120); // opțional
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 200);
  const telefon = String(body.telefon ?? "").trim().slice(0, 40);
  const digits = telefon.replace(/\D/g, "");

  const errors: Record<string, string> = {};
  if (nume.length < 2) errors.nume = "Scrie-ți numele.";
  if (!EMAIL.test(email)) errors.email = "Adresa de e-mail nu pare corectă.";
  if (digits.length < 9 || digits.length > 15) errors.telefon = "Numărul de telefon nu pare corect.";
  if (body.acord !== true) errors.acord = "Avem nevoie de acordul tău ca să-ți scriem.";
  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const lead: Lead = {
    nume,
    companie,
    email,
    telefon,
    interese: Array.isArray(body.interese)
      ? body.interese.filter((x): x is string => typeof x === "string" && valid.has(x))
      : [],
    sursa: site.sursa,
    la: new Date().toISOString(),
  };

  let saved = false;
  try {
    saved = await saveLead(lead);
  } catch (err) {
    console.error("[lead] salvarea a eșuat:", err);
  }

  let emailed = false;
  if (smtpConfigured()) {
    try {
      await sendParticipant(lead);
      emailed = true;
    } catch (err) {
      console.error("[lead] e-mailul către participant a eșuat:", err);
    }
    try {
      await notifyOwner(lead);
    } catch (err) {
      console.error("[lead] notificarea către tine a eșuat:", err);
    }
  } else {
    console.warn("[lead] SMTP nu e configurat; contactul a fost doar salvat.");
  }

  // Dacă nici nu l-am salvat, nici nu i-am scris, omul trebuie să afle că n-a mers.
  if (!saved && !emailed) {
    return NextResponse.json(
      { ok: false, error: "Nu am putut înregistra cererea. Mai încearcă o dată, te rog." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, emailed });
}
