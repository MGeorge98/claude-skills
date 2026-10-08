/**
 * Exemplu: eight neutral placeholder wordmarks as inline SVG data URIs, never real brands. Replace src, alt and
 * the sizes per project with logos the client may show (their facts ledger decides which). No em dashes.
 */
import type { LogoMarqueeProps } from "./LogoMarquee";

const logos: LogoMarqueeProps["logos"] = [
  { src: "data:image/svg+xml;utf8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22120%22%20height=%2232%22%20viewBox=%220%200%20120%2032%22%3E%3Ctext%20x=%220%22%20y=%2223%22%20font-family=%22Georgia,serif%22%20font-size=%2222%22%20font-weight=%22700%22%20fill=%22%23cfd8d4%22%3ELogo%201%3C/text%3E%3C/svg%3E", alt: "Logo 1", width: 120, height: 32 },
  { src: "data:image/svg+xml;utf8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22132%22%20height=%2232%22%20viewBox=%220%200%20132%2032%22%3E%3Ctext%20x=%220%22%20y=%2223%22%20font-family=%22Arial,sans-serif%22%20font-size=%2222%22%20font-weight=%22700%22%20fill=%22%239aa8a2%22%3ELogo%202%3C/text%3E%3C/svg%3E", alt: "Logo 2", width: 132, height: 32 },
  { src: "data:image/svg+xml;utf8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22124%22%20height=%2232%22%20viewBox=%220%200%20124%2032%22%3E%3Ctext%20x=%220%22%20y=%2223%22%20font-family=%22Courier%20New,monospace%22%20font-size=%2222%22%20font-weight=%22700%22%20fill=%22%23f4f7f5%22%3ELogo%203%3C/text%3E%3C/svg%3E", alt: "Logo 3", width: 124, height: 32 },
  { src: "data:image/svg+xml;utf8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22128%22%20height=%2232%22%20viewBox=%220%200%20128%2032%22%3E%3Ctext%20x=%220%22%20y=%2223%22%20font-family=%22Verdana,sans-serif%22%20font-size=%2222%22%20font-weight=%22700%22%20fill=%22%23b9c4bf%22%3ELogo%204%3C/text%3E%3C/svg%3E", alt: "Logo 4", width: 128, height: 32 },
  { src: "data:image/svg+xml;utf8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22120%22%20height=%2232%22%20viewBox=%220%200%20120%2032%22%3E%3Ctext%20x=%220%22%20y=%2223%22%20font-family=%22Georgia,serif%22%20font-size=%2222%22%20font-weight=%22700%22%20fill=%22%238fa098%22%3ELogo%205%3C/text%3E%3C/svg%3E", alt: "Logo 5", width: 120, height: 32 },
  { src: "data:image/svg+xml;utf8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22132%22%20height=%2232%22%20viewBox=%220%200%20132%2032%22%3E%3Ctext%20x=%220%22%20y=%2223%22%20font-family=%22Arial,sans-serif%22%20font-size=%2222%22%20font-weight=%22700%22%20fill=%22%23e1e8e4%22%3ELogo%206%3C/text%3E%3C/svg%3E", alt: "Logo 6", width: 132, height: 32 },
  { src: "data:image/svg+xml;utf8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22124%22%20height=%2232%22%20viewBox=%220%200%20124%2032%22%3E%3Ctext%20x=%220%22%20y=%2223%22%20font-family=%22Courier%20New,monospace%22%20font-size=%2222%22%20font-weight=%22700%22%20fill=%22%23a7b5ae%22%3ELogo%207%3C/text%3E%3C/svg%3E", alt: "Logo 7", width: 124, height: 32 },
  { src: "data:image/svg+xml;utf8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22128%22%20height=%2232%22%20viewBox=%220%200%20128%2032%22%3E%3Ctext%20x=%220%22%20y=%2223%22%20font-family=%22Verdana,sans-serif%22%20font-size=%2222%22%20font-weight=%22700%22%20fill=%22%23d6dedb%22%3ELogo%208%3C/text%3E%3C/svg%3E", alt: "Logo 8", width: 128, height: 32 },
];

export const logoMarqueeExample: LogoMarqueeProps = {
  id: "parteneri",
  label: "Exemplu: parteneri și clienți",
  kicker: "Exemplu: parteneri",
  logos,
  speed: 28,
  pauseOnHover: true,
};
