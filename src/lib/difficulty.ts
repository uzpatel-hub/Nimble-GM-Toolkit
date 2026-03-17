import type { EncounterMonster, DifficultyRating } from '@/types';

export function calcDifficulty(
  monsters: EncounterMonster[],
  partySize: number,
  partyLevel: number
): { rating: DifficultyRating; percent: number } {
  const budget = partySize * partyLevel;
  if (budget === 0) return { rating: 'easy', percent: 0 };

  let threat = 0;
  for (const m of monsters) {
    const effectiveLevel = m.isMinion ? m.level * 0.5 : m.level;
    threat += effectiveLevel * m.count;
  }

  const percent = Math.round((threat / budget) * 100);

  let rating: DifficultyRating;
  if (percent < 50) rating = 'easy';
  else if (percent < 88) rating = 'medium';
  else if (percent <= 112) rating = 'hard';
  else if (percent <= 137) rating = 'deadly';
  else rating = 'very-deadly';

  return { rating, percent };
}
