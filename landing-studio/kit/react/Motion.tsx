"use client";

import { useEffect } from "react";
import { mountMotion, type MotionOptions } from "../engine/engine";

/**
 * Mounts the landing-studio engine once, after the page has rendered. Render it once, last in
 * <body> or at the end of the page. Scene handlers registered with registerSceneHandler at module
 * top level of scene files exist before this effect runs.
 *
 *   <Motion />  or  <Motion breakpoint={900} tau={100} />
 */
export default function Motion(props: MotionOptions) {
  const { breakpoint, tau, jumpVh, settle, liveMargin, px, watchMargin } = props;
  useEffect(
    () => mountMotion({ breakpoint, tau, jumpVh, settle, liveMargin, px, watchMargin }),
    [breakpoint, tau, jumpVh, settle, liveMargin, px, watchMargin],
  );
  return null;
}
