import Step from "@/kit/react/Step";
import type { SlideProps } from "@/kit/react/Slide";
import "./video.css";

export type VideoPoster = {
  /** local file in public/, shown before play, in ?print, under rm and in the stacked document */
  src: string;
  width: number;
  height: number;
};

export type VideoData = {
  /** mono, uppercase, under 32 characters */
  kicker?: string;
  /** the slide's one point; with a kicker or a point the frame sits on the right, without both it fills the stage */
  point?: string;
  /** local mp4 in public/ (H.264, faststart) */
  src: string;
  poster: VideoPoster;
  /** one mono line under the frame */
  caption?: string;
  /** loop the clip (default false: it stops on its last frame) */
  loop?: boolean;
  /** a visible native control bar, the only way to sound (default false); clicks on it never navigate */
  controls?: boolean;
  /** how the clip sits in the 16:9 frame (default contain) */
  fit?: "contain" | "cover";
};

export const steps = (_d: VideoData) => 0;

export default function Video({ data }: SlideProps<VideoData>) {
  const head = Boolean(data.kicker || data.point);
  const fit = data.fit === "cover" ? "cover" : "contain";
  let i = 0;
  return (
    <div className={head ? "video-root video-split" : "video-root video-solo"}>
      {head ? (
        <div className="video-head">
          {data.kicker ? (
            <Step at={0} i={i++} as="p" className="video-kicker">
              {data.kicker}
            </Step>
          ) : null}
          {data.point ? (
            <Step at={0} i={i++} as="h2" className="video-point">
              {data.point}
            </Step>
          ) : null}
        </div>
      ) : null}
      <div className="video-col">
        <Step at={0} i={i++} className="video-frame">
          {/* The runtime plays a muted video when its slide is current and pauses it on leave.
              No autoPlay attribute: ?print, the stacked document and a deck that never mounted show the poster.
              preload="none", not "metadata": Chrome reads the metadata of every video in the deck on load, then
              aborts the open range request (net::ERR_ABORTED on every other slide, a rule 1 failure). The poster
              carries the frame until play() loads the file. */}
          <video
            className={`video-media video-${fit}`}
            preload="none"
            src={data.src}
            poster={data.poster.src}
            width={data.poster.width}
            height={data.poster.height}
            muted
            playsInline
            loop={data.loop || undefined}
            controls={data.controls || undefined}
            data-no-nav={data.controls ? "" : undefined}
          />
        </Step>
        {data.caption ? (
          <Step at={0} i={i} as="p" className="video-caption">
            {data.caption}
          </Step>
        ) : null}
      </div>
    </div>
  );
}
