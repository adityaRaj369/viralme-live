/**
 * Placement is paid/curated only. This module no longer scores by engagement.
 * Kept for audit clarity and to block accidental reintroduction of vote ranking.
 */
export function computeOrganicScore(): never {
  throw new Error(
    "Engagement ranking is disabled. Use paid promotion slots or admin trending curation.",
  );
}

export async function recomputeOrganicScores() {
  return { updated: 0, note: "organic engagement ranking disabled by product policy" };
}
