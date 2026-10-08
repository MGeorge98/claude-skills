// Adaugă cele două linii în obiectul nextConfig din next.config.ts.
const snippet = {
  // nodemailer rulează doar pe server; îl lăsăm în afara bundle-ului
  serverExternalPackages: ["nodemailer"],
  // Pe Vercel funcția /api/lead are în bundle doar ce găsește tracing-ul. Fără linia asta,
  // folderul de atașamente lipsește și e-mailul pleacă fără fișier. Schimbă calea dacă ATTACH_DIR e altul.
  outputFileTracingIncludes: { "/api/lead": ["./agenti/**", "./public/email-logo-*.png"] },
};
export default snippet;
