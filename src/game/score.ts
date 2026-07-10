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
  };
}
