"use client";

const toBool = (val: unknown): boolean => {
  if (typeof val === "string") {
    return val.toLowerCase() === "true";
  }
  return !!val;
};

/**
 * Free Mode: when true, all employer features are enabled with unlimited active jobs.
 * Note: Vite exposes env vars prefixed with VITE_ on the client.
 */
export const FREE_MODE: boolean = toBool(import.meta.env.VITE_FREE_MODE);

/**
 * Optional cap while in Free Mode (default: unlimited = -1).
 * Only used for display; no gating is enforced when FREE_MODE=true.
 */
export const FREE_MODE_MAX_ACTIVE_JOBS: number =
  typeof import.meta.env.VITE_FREE_MODE_MAX_ACTIVE_JOBS !== "undefined"
    ? Number(import.meta.env.VITE_FREE_MODE_MAX_ACTIVE_JOBS)
    : -1;