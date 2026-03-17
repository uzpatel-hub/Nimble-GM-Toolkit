import { describe, it, expect } from 'vitest';
import { calcDifficulty } from '@/lib/difficulty';
import type { EncounterMonster } from '@/types';

describe('Difficulty Calculator', () => {
  it('should return easy for no monsters', () => {
    const result = calcDifficulty([], 4, 3);
    expect(result.rating).toBe('easy');
    expect(result.percent).toBe(0);
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

  it('should calculate deadly encounter (113-137%)', () => {
    // Budget: 4 * 3 = 12. Threat: 4 * 4 = 16. Percent: 133%
    const monsters: EncounterMonster[] = [
      { monsterId: 'a', name: 'Ogre', level: 4, count: 4, isMinion: false },
    ];
    const result = calcDifficulty(monsters, 4, 3);
    expect(result.rating).toBe('deadly');
    expect(result.percent).toBe(133);
  });

  it('should calculate very-deadly encounter (> 137%)', () => {
    // Budget: 4 * 3 = 12. Threat: 5 * 4 = 20. Percent: 167%
    const monsters: EncounterMonster[] = [
      { monsterId: 'a', name: 'Troll', level: 5, count: 4, isMinion: false },
    ];
    const result = calcDifficulty(monsters, 4, 3);
    expect(result.rating).toBe('very-deadly');
    expect(result.percent).toBe(167);
  });

  it('should halve minion levels', () => {
    // Budget: 4 * 3 = 12. Threat: 2 * 0.5 * 12 = 12. Percent: 100%
    const monsters: EncounterMonster[] = [
      { monsterId: 'a', name: 'Goblin Minion', level: 2, count: 12, isMinion: true },
    ];
    const result = calcDifficulty(monsters, 4, 3);
    expect(result.rating).toBe('hard');
    expect(result.percent).toBe(100);
  });

  it('should handle mixed minions and regular monsters', () => {
    // Budget: 4 * 3 = 12
    // Regular: level 3 * 2 = 6
    // Minions: level 1 * 0.5 * 8 = 4
    // Total threat: 10. Percent: 83%
    const monsters: EncounterMonster[] = [
      { monsterId: 'a', name: 'Bandit', level: 3, count: 2, isMinion: false },
      { monsterId: 'b', name: 'Bandit Minion', level: 1, count: 8, isMinion: true },
    ];
    const result = calcDifficulty(monsters, 4, 3);
    expect(result.rating).toBe('medium');
    expect(result.percent).toBe(83);
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
