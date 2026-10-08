import Step from "@/kit/react/Step";
import type { SlideProps } from "@/kit/react/Slide";
import "./closing-qr.css";

export type ClosingQrData = {
  /** the action, one sentence, visible from step 0 */
  point: string;
  /** the address in plain text under the QR, mono */
  url: string;
  /** a file in public/ (SVG or PNG), black on white, with its intrinsic size */
  qr: { src: string; alt: string; width: number; height: number };
  /** speaker contact: name and one line (role, handle or mail copied from facts.md) */
  contact?: { name: string; line: string };
  /** a file in public/, drawn 56px high, bottom right */
  logo?: { src: string; width: number; height: number; alt: string };
  /** the QR card enters at step 1 instead of with the slide */
  revealQr?: boolean;
};

export const steps = (d: ClosingQrData) => (d.revealQr ? 1 : 0);

export default function ClosingQr({ data }: SlideProps<ClosingQrData>) {
  const at = data.revealQr ? 1 : 0;
  return (
    <div className="closing-qr-root">
      <div className="closing-qr-main">
        <Step at={0} as="h2" className="closing-qr-point">
          {data.point}
        </Step>
        <div className="closing-qr-right">
          <Step at={at} rv="pop" className="closing-qr-card">
            <img src={data.qr.src} width={data.qr.width} height={data.qr.height} alt={data.qr.alt} />
          </Step>
          <Step at={at} i={1} as="p" className="closing-qr-url">
            {data.url}
          </Step>
        </div>
      </div>
      {data.contact || data.logo ? (
        <Step at={0} i={1} className="closing-qr-foot">
          {data.contact ? (
            <div className="closing-qr-contact">
              <p className="closing-qr-name">{data.contact.name}</p>
              <p className="closing-qr-cline">{data.contact.line}</p>
            </div>
          ) : (
            <span />
          )}
          {data.logo ? (
            <img className="closing-qr-logo" src={data.logo.src} width={data.logo.width} height={data.logo.height} alt={data.logo.alt} />
          ) : null}
        </Step>
      ) : null}
    </div>
  );
}
