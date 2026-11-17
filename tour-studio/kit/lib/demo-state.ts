"use client";

// The few things that change on the mock screens. One tiny store shared by every page and by the tour.
// The tour resets it on EVERY step to INITIAL + step.setup, so Back, refresh and deep links (?pas=N) always show
// the right screen: state comes from the step number, never from having watched the earlier animations.
// `typed` and `typing` are reserved: the engine writes them during a typing beat. Everything else is per demo.

import { useSyncExternalStore } from "react";

export type DemoState = {
  typed: Record<string, string>; // reserved: text typed per field, keyed by the field's data-tour id (bind value={typed[id] ?? ""})
  typing: string | null; // reserved: the data-tour id being typed into right now (show that input as focused)
  clock: number | null; // the app's "now" in hours for this moment of the story; null = before the day starts
  selected: string | null; // EXAMPLE: the record opened on /exemplu
  approved: string[]; // EXAMPLE: records approved with a click
  search: "idle" | "pending" | "done"; // EXAMPLE: the search runs for a moment, then shows results
};

export const INITIAL: DemoState = { typed: {}, typing: null, clock: 9, selected: null, approved: [], search: "idle" };

let state = INITIAL;
const subs = new Set<() => void>();

export function setDemo(patch: Partial<DemoState> | ((s: DemoState) => Partial<DemoState>)) {
  state = { ...state, ...(typeof patch === "function" ? patch(state) : patch) };
  subs.forEach((f) => f());
}
export const resetDemo = (setup?: Partial<DemoState>) => setDemo({ ...INITIAL, ...setup });

const subscribe = (f: () => void) => (subs.add(f), () => void subs.delete(f));
export const useDemo = () => useSyncExternalStore(subscribe, () => state, () => INITIAL);
