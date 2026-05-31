import { describe, it, expect } from 'vitest';
import { calcDifficulty } from '@/lib/difficulty';
import type { EncounterMonster } from '@/types';

describe('Difficulty Calculator', () => {
  it('should return easy for no monsters', () => {
    const result = calcDifficulty([], 4, 3);
    expect(result.rating).toBe('easy');
    expect(result.percent).toBe(0);
    expect(result.minionPressure).toBe('none');
  });

  it('should return easy for zero budget', () => {
    const result = calcDifficulty([], 0, 0);
    expect(result.rating).toBe('easy');
    expect(result.percent).toBe(0);
  });

  it('should calculate easy encounter (< 50%)', () => {
    // Budget: 4 * 5 = 20. Threat: 2 * 2 = 4. Percent: 20%
    const monsters: EncounterMonster[] = [
      { monsterId: 'a', name: 'Goblin', level: 2, count: 2, isMinion: false },
    ];
    const result = calcDifficulty(monsters, 4, 5);
    expect(result.rating).toBe('easy');
    expect(result.percent).toBe(20);
  });

  it('should calculate medium encounter (50-87%)', () => {
    // Budget: 4 * 3 = 12. Threat: 3 * 3 = 9. Percent: 75%
    const monsters: EncounterMonster[] = [
      { monsterId: 'a', name: 'Bandit', level: 3, count: 3, isMinion: false },
    ];
    const result = calcDifficulty(monsters, 4, 3);
    expect(result.rating).toBe('medium');
    expect(result.percent).toBe(75);
  });

  it('should calculate hard encounter (88-112%)', () => {
    // Budget: 4 * 3 = 12. Threat: 3 * 4 = 12. Percent: 100%
    const monsters: EncounterMonster[] = [
      { monsterId: 'a', name: 'Bandit', level: 3, count: 4, isMinion: false },
    ];
    const result = calcDifficulty(monsters, 4, 3);
    expect(result.rating).toBe('hard');
    expect(result.percent).toBe(100);
  });

  it('should calculate deadly encounter (113-149%)', () => {
    // Budget: 4 * 3 = 12. Threat: 4 * 4 = 16. Percent: 133%
    const monsters: EncounterMonster[] = [
      { monsterId: 'a', name: 'Ogre', level: 4, count: 4, isMinion: false },
    ];
    const result = calcDifficulty(monsters, 4, 3);
    expect(result.rating).toBe('deadly');
    expect(result.percent).toBe(133);
  });

  it('should keep 138-149% in deadly band (not very-deadly)', () => {
    // Budget: 4 * 3 = 12. Threat: 17. Percent: 142% — per GM Guide this is still deadly.
    const monsters: EncounterMonster[] = [
      { monsterId: 'a', name: 'Ogre', level: 4, count: 4, isMinion: false },
      { monsterId: 'b', name: 'Goblin', level: 1, count: 1, isMinion: false },
    ];
    const result = calcDifficulty(monsters, 4, 3);
    expect(result.rating).toBe('deadly');
    expect(result.percent).toBe(142);
  });

  it('should calculate very-deadly encounter (>= 150%)', () => {
    // Budget: 4 * 3 = 12. Threat: 5 * 4 = 20. Percent: 167%
    const monsters: EncounterMonster[] = [
      { monsterId: 'a', name: 'Troll', level: 5, count: 4, isMinion: false },
    ];
    const result = calcDifficulty(monsters, 4, 3);
    expect(result.rating).toBe('very-deadly');
    expect(result.percent).toBe(167);
  });

  it('should exclude minions from level budget', () => {
    // Per GM Guide: minions are not counted in the level budget.
    // Budget: 4 * 3 = 12. Threat (excl. minions): 0. Percent: 0% → easy.
    const monsters: EncounterMonster[] = [
      { monsterId: 'a', name: 'Goblin Minion', level: 2, count: 12, isMinion: true },
    ];
    const result = calcDifficulty(monsters, 4, 3);
    expect(result.rating).toBe('easy');
    expect(result.percent).toBe(0);
    expect(result.minionCount).toBe(12);
    expect(result.minionsPerHero).toBe(3);
    expect(result.minionPressure).toBe('noticeable');
  });

  it('should rate minion pressure separately from threat', () => {
    // 2 level-3 bandits = hard-ish (50%), plus 8 minions for 4 heroes (2/hero → noticeable).
    const monsters: EncounterMonster[] = [
      { monsterId: 'a', name: 'Bandit', level: 3, count: 2, isMinion: false },
      { monsterId: 'b', name: 'Bandit Minion', level: 1, count: 8, isMinion: true },
    ];
    const result = calcDifficulty(monsters, 4, 3);
    expect(result.percent).toBe(50); // 6/12 — minions excluded
    expect(result.rating).toBe('medium');
    expect(result.minionCount).toBe(8);
    expect(result.minionsPerHero).toBe(2);
    expect(result.minionPressure).toBe('noticeable');
  });

  it('minion pressure: slight at 1/hero', () => {
    const monsters: EncounterMonster[] = [
      { monsterId: 'a', name: 'Minion', level: 1, count: 4, isMinion: true },
    ];
    expect(calcDifficulty(monsters, 4, 3).minionPressure).toBe('slight');
  });

  it('minion pressure: heavy at 4/hero', () => {
    const monsters: EncounterMonster[] = [
      { monsterId: 'a', name: 'Minion', level: 1, count: 16, isMinion: true },
    ];
    expect(calcDifficulty(monsters, 4, 3).minionPressure).toBe('heavy');
  });

  it('should handle fractional levels', () => {
    // Budget: 4 * 1 = 4. Threat: 0.33 * 8 = 2.64. Percent: 66%
    const monsters: EncounterMonster[] = [
      { monsterId: 'a', name: 'Kobold', level: 0.33, count: 8, isMinion: false },
    ];
    const result = calcDifficulty(monsters, 4, 1);
    expect(result.rating).toBe('medium');
    expect(result.percent).toBe(66);
  });

  it('should handle single player party', () => {
    // Budget: 1 * 5 = 5. Threat: 5 * 1 = 5. Percent: 100%
    const monsters: EncounterMonster[] = [
      { monsterId: 'a', name: 'Boss', level: 5, count: 1, isMinion: false },
    ];
    const result = calcDifficulty(monsters, 1, 5);
    expect(result.rating).toBe('hard');
    expect(result.percent).toBe(100);
  });
});
