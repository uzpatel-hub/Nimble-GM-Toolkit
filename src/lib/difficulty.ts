import type { EncounterMonster, DifficultyRating } from '@/types';

export type MinionPressure = 'none' | 'slight' | 'noticeable' | 'heavy';

export interface DifficultyResult {
  rating: DifficultyRating;
  percent: number;
  minionCount: number;
  minionsPerHero: number;
  minionPressure: MinionPressure;
}

// Per Nimble GM Guide (Combat Encounter Guidelines):
// Minions are excluded from the level budget — they are balanced separately
// by minions-per-hero ratio. Thresholds:
//   Easy         < 50%
//   Medium      ~75%
//   Hard       =100%    (code: 88–112%, fuzzed around "equal to heroes' levels")
//   Deadly    100–125%  (code: 113–149%)
//   Very Deadly 150%+
export function calcDifficulty(
  monsters: EncounterMonster[],
  partySize: number,
  partyLevel: number
): DifficultyResult {
  const budget = partySize * partyLevel;

  let threat = 0;
  let minionCount = 0;
  for (const m of monsters) {
    if (m.isMinion) {
      minionCount += m.count;
    } else {
      threat += m.level * m.count;
    }
  }

  const percent = budget === 0 ? 0 : Math.round((threat / budget) * 100);

  let rating: DifficultyRating;
  if (percent < 50) rating = 'easy';
  else if (percent < 88) rating = 'medium';
  else if (percent <= 112) rating = 'hard';
  else if (percent < 150) rating = 'deadly';
  else rating = 'very-deadly';

  const minionsPerHero = partySize > 0 ? minionCount / partySize : 0;
  let minionPressure: MinionPressure;
  if (minionsPerHero === 0) minionPressure = 'none';
  else if (minionsPerHero < 2) minionPressure = 'slight';
  else if (minionsPerHero < 4) minionPressure = 'noticeable';
  else minionPressure = 'heavy';

  return { rating, percent, minionCount, minionsPerHero, minionPressure };
}

export const MINION_PRESSURE_LABEL: Record<MinionPressure, string> = {
  none: 'No minions',
  slight: 'Slightly more difficult',
  noticeable: 'Noticeably more difficult',
  heavy: 'Much more challenging',
};
