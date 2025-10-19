"use client";

const toBool = (val: unknown): boolean => {
  if (typeof val === "string") return val.toLowerCase() === "true";
  return !!val;
};

// Existing flag (kept for backwards compatibility)
export const FREE_MODE: boolean = toBool(import.meta.env.VITE_FREE_MODE);

// New launch flag; if set, it disables subscription gating everywhere.
// If not set, we still honor the legacy FREE_MODE for compatibility.
export const LAUNCH_FREE_MODE: boolean = toBool(import.meta.env.VITE_LAUNCH_FREE_MODE);

// Single source of truth: when either flag is true, free mode is active.
export const FREE_MODE_ACTIVE: boolean = LAUNCH_FREE_MODE || FREE_MODE;

// Optional cap while in free mode (display only; no gating enforced while FREE_MODE_ACTIVE)
export const FREE_MODE_MAX_ACTIVE_JOBS: number =
  typeof import.meta.env.VITE_FREE_MODE_MAX_ACTIVE_JOBS !== "undefined"
    ? Number(import.meta.env.VITE_FREE_MODE_MAX_ACTIVE_JOBS)
    : -1;