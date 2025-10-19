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

// New: explicit paywall toggle. When false, all employer gates are disabled.
// Default to true if not provided.
const RAW_JOB_PAYWALL = import.meta.env.VITE_FEATURE_JOB_PAYWALL;
export const JOB_PAYWALL_ENABLED: boolean =
  typeof RAW_JOB_PAYWALL === "undefined" ? true : toBool(RAW_JOB_PAYWALL);

// When either launch/free mode is on OR paywall is toggled off, gating is disabled.
export const PAYWALL_DISABLED: boolean = FREE_MODE_ACTIVE || !JOB_PAYWALL_ENABLED;

// Optional cap while in free/launch mode (display only; no gating enforced while PAYWALL_DISABLED)
const RAW_MAX = import.meta.env.VITE_FREE_MODE_MAX_ACTIVE_JOBS;
export const FREE_MODE_MAX_ACTIVE_JOBS: number =
  typeof RAW_MAX !== "undefined" ? Number(RAW_MAX) : 20; // default to 20 as a friendly soft cap