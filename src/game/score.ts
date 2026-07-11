import type { Difficulty } from "./types";

export const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy: 1,
  medium: 1.5,
  hard: 2,
  master: 3,
};

export interface ScoreBreakdown {
  score: number;
  accuracyPct: number;
  timeSeconds: number;
  difficultyMultiplier: number;
  rank: string;
}

/**
 * Thresholds are scaled to what this scoring formula can actually produce:
 * accuracy tops out at 1000 points and the time bonus decays to 0 after 10
 * minutes, so even a flawless master-difficulty win (perfect accuracy, near
 * instant) caps out around 6500-6600. Tiers are spaced so a modest win lands
 * low and only fast, accurate, high-difficulty play reaches the top rank.
 */
const RANKS: { min: number; name: string }[] = [
  { min: 0, name: "Marinheiro" },
  { min: 200, name: "Cabo" },
  { min: 500, name: "Sargento" },
  { min: 1000, name: "Tenente" },
  { min: 1800, name: "Capitão" },
  { min: 2800, name: "Comodoro" },
  { min: 4000, name: "Almirante" },
];

export function rankForScore(score: number): string {
  let rank = RANKS[0].name;
  for (const tier of RANKS) {
    if (score >= tier.min) rank = tier.name;
  }
  return rank;
}

/**
 * Rewards fewer wasted shots (accuracy), finishing quickly (time bonus decays
 * to zero after 10 minutes), and playing on a harder difficulty (multiplier).
 */
export function computeScore(
  shotsFired: number,
  hits: number,
  elapsedMs: number,
  difficulty: Difficulty
): ScoreBreakdown {
  const timeSeconds = elapsedMs / 1000;
  const accuracy = shotsFired > 0 ? hits / shotsFired : 0;
  const accuracyPoints = accuracy * 1000;
  const timePoints = Math.max(0, 600 - timeSeconds) * 2;
  const multiplier = DIFFICULTY_MULTIPLIER[difficulty];
  const score = Math.round((accuracyPoints + timePoints) * multiplier);

  return {
    score,
    accuracyPct: Math.round(accuracy * 100),
    timeSeconds: Math.round(timeSeconds),
    difficultyMultiplier: multiplier,
    rank: rankForScore(score),
  };
}
