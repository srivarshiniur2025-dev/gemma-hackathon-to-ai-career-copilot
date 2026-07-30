/** Gemma 4 — centralized model config for the hackathon app. */
export const GEMMA_VERSION = "Gemma 4" as const;
export const GEMMA_MODEL_ID = "gemma-4-27b-it" as const;
export const GEMMA_FALLBACK_MODELS = ["gemma-4-26b-a4b-it", "gemma-4-4b-it"] as const;
export const GEMMA_BADGE_LABEL = `Built with ${GEMMA_VERSION}` as const;
export const GEMMA_FULL_LABEL = `${GEMMA_VERSION} · ${GEMMA_MODEL_ID}` as const;
