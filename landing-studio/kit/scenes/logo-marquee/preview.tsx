/** Preview of logo-marquee with its Exemplu data; sync-kit mounts it at /preview/logo-marquee. */
import LogoMarquee from "./LogoMarquee";
import { logoMarqueeExample } from "./data.example";

export default function Preview() {
  return <LogoMarquee {...logoMarqueeExample} />;
}
