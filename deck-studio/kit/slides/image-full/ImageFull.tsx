import Step from "@/kit/react/Step";
import SplitWords from "@/kit/react/SplitWords";
import type { SlideProps } from "@/kit/react/Slide";
import "./image-full.css";

export type ImageFullData = {
  /** a data URI or a file in public/, with its intrinsic size; the owner supplies the photo */
  image: { src: string; alt: string; width: number; height: number };
  /** mono, uppercase, under 32 characters */
  kicker?: string;
  /** word masks, step 0; keep it under 12 words */
  title?: string;
  /** mono, step 1; credit or one line of context */
  caption?: string;
  /** where the gradient sits under the text (default "bottom"); "none" only for a calm, dark image */
  scrim?: "bottom" | "left" | "none";
  /** default "cover" */
  fit?: "cover" | "contain";
};

export const steps = (d: ImageFullData) => (d.caption ? 1 : 0);

export default function ImageFull({ data }: SlideProps<ImageFullData>) {
  const scrim = data.scrim ?? "bottom";
  const fit = data.fit ?? "cover";
  const hasText = Boolean(data.kicker || data.title);
  return (
    <div className="image-full-root" data-scrim={scrim} data-fit={fit}>
      <img
        className="image-full-img"
        src={data.image.src}
        width={data.image.width}
        height={data.image.height}
        alt={data.image.alt}
      />
      {scrim !== "none" ? <div className="image-full-scrim" aria-hidden="true" /> : null}
      <div className="image-full-text">
        {data.kicker ? (
          <Step at={0} as="p" className="image-full-kicker">
            {data.kicker}
          </Step>
        ) : null}
        {data.title ? (
          <Step at={0} rv="mask" as="h2" className="image-full-title">
            <SplitWords text={data.title} start={data.kicker ? 2 : 0} />
          </Step>
        ) : null}
        {data.caption ? (
          <Step at={1} as="p" className="image-full-caption" data-solo={hasText ? undefined : ""}>
            {data.caption}
          </Step>
        ) : null}
      </div>
    </div>
  );
}
