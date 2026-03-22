'use client';

import { calcDifficulty } from '@/lib/difficulty';
import type { DifficultyRating, Encounter, SessionEncounter } from '@/types';

interface EncounterBudgetProps {
  partySize: number;
  partyLevel: number;
  sessionEncounters: SessionEncounter[];
  /** Full combat encounters from the encounter store (for linked lookups) */
  encounters: Encounter[];
}

const DIFFICULTY_COLORS: Record<DifficultyRating, string> = {
  easy: 'bg-green-500',
  medium: 'bg-yellow-500',
  hard: 'bg-orange-500',
  deadly: 'bg-red-500',
  'very-deadly': 'bg-red-800',
};

const DIFFICULTY_LABELS: Record<DifficultyRating, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  deadly: 'Deadly',
  'very-deadly': 'Very Deadly',
};

const DIFFICULTY_TEXT_COLORS: Record<DifficultyRating, string> = {
  easy: 'text-green-500',
  medium: 'text-yellow-500',
  hard: 'text-orange-500',
  deadly: 'text-red-500',
  'very-deadly': 'text-red-400',
};

/**
 * Recommended encounter mix per the Nimble GM Guide:
 * - 2-5 combat encounters per session/rest
 * - 1-2 Easy, 1-2 Medium, 1 Hard max
 * - Deadly/Very Deadly: sparingly / only for mistakes
 */
const BUDGET_LIMITS: Record<DifficultyRating, { recommended: number; label: string }> = {
  easy: { recommended: 2, label: '1–2 recommended' },
  medium: { recommended: 2, label: '1–2 recommended' },
  hard: { recommended: 1, label: '1 max recommended' },
  deadly: { recommended: 0, label: 'Use sparingly' },
  'very-deadly': { recommended: 0, label: 'Avoid unless telegraphed' },
};

/** Attrition weight per difficulty for the resource drain bar */
const ATTRITION_WEIGHT: Record<DifficultyRating, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  deadly: 4,
  'very-deadly': 5,
};

export function EncounterBudget({
  partySize,
  partyLevel,
  sessionEncounters,
  encounters,
}: EncounterBudgetProps) {
  const partyTotal = partySize * partyLevel;

  // Only count battle-type session encounters
  const battleEncounters = sessionEncounters.filter((se) => se.type === 'battle');
  const totalBattles = battleEncounters.length;

  // Resolve linked encounters and recalculate difficulty at the session's party level
  const resolved: { sessionEnc: SessionEncounter; encounter?: Encounter; difficulty?: DifficultyRating }[] =
    battleEncounters.map((se) => {
      const linked = se.linkedEncounterId
        ? encounters.find((e) => e.id === se.linkedEncounterId)
        : undefined;
      const difficulty = linked
        ? calcDifficulty(linked.monsters, partySize, partyLevel).rating
        : undefined;
      return { sessionEnc: se, encounter: linked, difficulty };
    });

  const linkedCount = resolved.filter((r) => r.encounter).length;
  const unlinkedCount = totalBattles - linkedCount;

  // Count by difficulty
  const counts: Record<DifficultyRating, number> = {
    easy: 0,
    medium: 0,
    hard: 0,
    deadly: 0,
    'very-deadly': 0,
  };
  for (const r of resolved) {
    if (r.difficulty) counts[r.difficulty]++;
  }

  // Calculate attrition score (0-15 is the "normal" range for 2-5 encounters)
  const attritionScore = resolved.reduce((sum, r) => {
    if (r.difficulty) return sum + ATTRITION_WEIGHT[r.difficulty];
    return sum + 2; // assume medium for unlinked
  }, 0);

  // Max expected attrition: 5 hard encounters = 15
  const maxAttrition = 15;
  const attritionPercent = Math.min((attritionScore / maxAttrition) * 100, 100);

  const getAttritionLabel = () => {
    if (totalBattles === 0) return 'No combat planned';
    if (attritionScore <= 3) return 'Light session';
    if (attritionScore <= 6) return 'Moderate attrition';
    if (attritionScore <= 10) return 'Heavy session';
    return 'Grueling session';
  };

  const getAttritionColor = () => {
    if (attritionScore <= 3) return 'bg-green-500';
    if (attritionScore <= 6) return 'bg-yellow-500';
    if (attritionScore <= 10) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Warnings
  const warnings: string[] = [];
  if (counts.hard > 1) warnings.push('Multiple hard encounters — heroes may run out of resources.');
  if (counts.deadly > 0) warnings.push('Deadly encounter — make sure danger is telegraphed!');
  if (counts['very-deadly'] > 0) warnings.push('Very Deadly — heroes will likely need to retreat or die.');
  if (totalBattles > 5) warnings.push('More than 5 battles — consider adding a rest opportunity.');
  if (totalBattles >= 3 && linkedCount === 0) warnings.push('No linked encounters — link some for accurate budgeting.');

  return (
    <div className="space-y-3">
      {/* Party budget */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Party Budget</span>
        <span className="font-medium">{partySize} x Lv{partyLevel} = <span className="text-primary">{partyTotal}</span> total levels</span>
      </div>

      {/* Battle count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Battles Planned</span>
        <span className="font-medium">
          {totalBattles}
          <span className="text-muted-foreground font-normal"> / 2–5 recommended</span>
        </span>
      </div>

      {/* Difficulty breakdown */}
      {linkedCount > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Difficulty Breakdown</p>
          {(['easy', 'medium', 'hard', 'deadly', 'very-deadly'] as DifficultyRating[]).map((diff) => {
            if (counts[diff] === 0) return null;
            const limit = BUDGET_LIMITS[diff];
            const overBudget = diff === 'hard' ? counts[diff] > 1
              : diff === 'deadly' || diff === 'very-deadly' ? counts[diff] > 0
              : false;
            return (
              <div key={diff} className="flex items-center gap-2 text-sm">
                <div className={`size-2.5 rounded-full ${DIFFICULTY_COLORS[diff]} shrink-0`} />
                <span className={`font-medium ${DIFFICULTY_TEXT_COLORS[diff]}`}>
                  {counts[diff]}x {DIFFICULTY_LABELS[diff]}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {limit.label}
                </span>
                {overBudget && (
                  <span className="text-xs text-red-400 font-semibold">!</span>
                )}
              </div>
            );
          })}
          {unlinkedCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <div className="size-2.5 rounded-full bg-muted-foreground/30 shrink-0" />
              <span className="text-muted-foreground">
                {unlinkedCount}x unlinked
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                (estimated as medium)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Attrition bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Resource Drain</span>
          <span>{getAttritionLabel()}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${getAttritionColor()}`}
            style={{ width: `${attritionPercent}%` }}
          />
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-1 rounded-md border border-yellow-500/30 bg-yellow-500/5 p-2">
          {warnings.map((w, i) => (
            <p key={i} className="text-xs text-yellow-400">
              {w}
            </p>
          ))}
        </div>
      )}

      {/* Tip */}
      {totalBattles === 0 && (
        <p className="text-xs text-muted-foreground italic">
          Add battle encounters above to see pacing guidance.
        </p>
      )}
    </div>
  );
}
