import { promises as fs } from "node:fs";
import path from "node:path";

export interface Lead {
  nume: string;
  companie: string;
  email: string;
  telefon: string;
  interese: string[];
  sursa: string;
  la: string;
}

const file = () => process.env.LEADS_FILE || path.join(process.cwd(), "data", "leads.jsonl");

/**
 * Adaugă contactul ca un rând JSON în fișier. Întoarce false dacă nu se poate scrie.
 * Pe Vercel sistemul de fișiere e doar pentru citire (în afară de /tmp), deci acolo
 * salvarea eșuează în mod normal: e-mailul către tine (LEADS_NOTIFY_TO) e sursa de adevăr.
 */
export async function saveLead(lead: Lead): Promise<boolean> {
  try {
    const f = file();
    await fs.mkdir(path.dirname(f), { recursive: true });
    await fs.appendFile(f, JSON.stringify(lead) + "\n", "utf8");
    return true;
  } catch (err) {
    console.error("[lead] nu am putut salva în fișier:", err);
    return false;
  }
}
