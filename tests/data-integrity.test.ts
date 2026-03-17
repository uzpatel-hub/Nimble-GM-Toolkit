import { describe, it, expect } from 'vitest';
import { BESTIARY_MONSTERS } from '@/data/bestiary';
import { GOLD_BY_LEVEL, LOOT_TABLES, DEFAULT_BOONS } from '@/data/treasure';
import { CONDITIONS, COMBAT_RULES, SKILLS } from '@/data/rules';
import { MONSTER_STATS_BY_LEVEL, LEGENDARY_STATS_BY_LEVEL, ABILITY_TEMPLATES } from '@/data/monster-tables';

describe('Data Integrity', () => {
  describe('Bestiary', () => {
    it('should have at least 50 monsters', () => {
      expect(BESTIARY_MONSTERS.length).toBeGreaterThanOrEqual(50);
    });

    it('should have unique IDs', () => {
      const ids = BESTIARY_MONSTERS.map(m => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid levels (> 0)', () => {
      for (const m of BESTIARY_MONSTERS) {
        expect(m.level).toBeGreaterThan(0);
      }
    });

    it('should have valid HP (> 0)', () => {
      for (const m of BESTIARY_MONSTERS) {
        expect(m.hp).toBeGreaterThan(0);
      }
    });

    it('should have valid armor types', () => {
      for (const m of BESTIARY_MONSTERS) {
        expect(['none', 'medium', 'heavy']).toContain(m.armorType);
      }
    });

    it('should all be non-custom', () => {
      for (const m of BESTIARY_MONSTERS) {
        expect(m.isCustom).toBe(false);
      }
    });

    it('should have faction set for every monster', () => {
      for (const m of BESTIARY_MONSTERS) {
        expect(m.faction).toBeTruthy();
      }
    });

    it('should cover multiple factions', () => {
      const factions = new Set(BESTIARY_MONSTERS.map(m => m.faction));
      expect(factions.size).toBeGreaterThanOrEqual(8);
    });
  });

  describe('Gold-by-Level', () => {
    it('should have 20 entries (levels 1-20)', () => {
      expect(GOLD_BY_LEVEL).toHaveLength(20);
    });

    it('should have increasing gold values', () => {
      for (let i = 1; i < GOLD_BY_LEVEL.length; i++) {
        expect(GOLD_BY_LEVEL[i].individual).toBeGreaterThan(GOLD_BY_LEVEL[i - 1].individual);
      }
    });

    it('should have hoard > individual for each level', () => {
      for (const entry of GOLD_BY_LEVEL) {
        expect(entry.hoard).toBeGreaterThan(entry.individual);
      }
    });
  });

  describe('Loot Tables', () => {
    it('should have at least 8 factions', () => {
      expect(Object.keys(LOOT_TABLES).length).toBeGreaterThanOrEqual(8);
    });

    it('should have at least 3 items per faction', () => {
      for (const [faction, items] of Object.entries(LOOT_TABLES)) {
        expect(items.length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe('Boons', () => {
    it('should have boons in all tiers', () => {
      const tiers = new Set(DEFAULT_BOONS.map(b => b.tier));
      expect(tiers).toContain('temporary');
      expect(tiers).toContain('minor');
      expect(tiers).toContain('major');
      expect(tiers).toContain('epic');
    });

    it('should have unique IDs', () => {
      const ids = DEFAULT_BOONS.map(b => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should all be non-custom', () => {
      for (const b of DEFAULT_BOONS) {
        expect(b.isCustom).toBe(false);
      }
    });
  });

  describe('Conditions', () => {
    it('should have at least 15 conditions', () => {
      expect(CONDITIONS.length).toBeGreaterThanOrEqual(15);
    });

    it('should have unique names', () => {
      const names = CONDITIONS.map(c => c.name);
      expect(new Set(names).size).toBe(names.length);
    });

    it('should include key conditions', () => {
      const names = CONDITIONS.map(c => c.name);
      expect(names).toContain('Blinded');
      expect(names).toContain('Dazed');
      expect(names).toContain('Prone');
      expect(names).toContain('Grappled');
    });
  });

  describe('Combat Rules', () => {
    it('should have at least 10 rules', () => {
      expect(COMBAT_RULES.length).toBeGreaterThanOrEqual(10);
    });

    it('should include key rules', () => {
      const titles = COMBAT_RULES.map(r => r.title);
      expect(titles).toContain('Turn Structure');
      expect(titles).toContain('Critical Hits');
    });
  });

  describe('Skills', () => {
    it('should have 10 skills', () => {
      expect(SKILLS).toHaveLength(10);
    });

    it('should cover all stat types', () => {
      const stats = new Set(SKILLS.map(s => s.stat));
      expect(stats).toContain('STR');
      expect(stats).toContain('DEX');
      expect(stats).toContain('INT');
      expect(stats).toContain('WIL');
    });
  });

  describe('Monster Stats-by-Level Table', () => {
    it('should have entries from level 0.25 to 20', () => {
      expect(MONSTER_STATS_BY_LEVEL[0].level).toBe(0.25);
      expect(MONSTER_STATS_BY_LEVEL[MONSTER_STATS_BY_LEVEL.length - 1].level).toBe(20);
    });

    it('should have increasing HP', () => {
      for (let i = 1; i < MONSTER_STATS_BY_LEVEL.length; i++) {
        expect(MONSTER_STATS_BY_LEVEL[i].hpNoArmor).toBeGreaterThan(
          MONSTER_STATS_BY_LEVEL[i - 1].hpNoArmor
        );
      }
    });

    it('should have hpNoArmor > hpMedArmor > hpHeavyArmor for each row', () => {
      for (const row of MONSTER_STATS_BY_LEVEL) {
        expect(row.hpNoArmor).toBeGreaterThan(row.hpMedArmor);
        expect(row.hpMedArmor).toBeGreaterThan(row.hpHeavyArmor);
      }
    });
  });

  describe('Legendary Stats-by-Level', () => {
    it('should have 20 entries', () => {
      expect(LEGENDARY_STATS_BY_LEVEL).toHaveLength(20);
    });

    it('should have increasing HP', () => {
      for (let i = 1; i < LEGENDARY_STATS_BY_LEVEL.length; i++) {
        expect(LEGENDARY_STATS_BY_LEVEL[i].hpMedArmor).toBeGreaterThan(
          LEGENDARY_STATS_BY_LEVEL[i - 1].hpMedArmor
        );
      }
    });
  });

  describe('Ability Templates', () => {
    it('should have at least 30 templates', () => {
      expect(ABILITY_TEMPLATES.length).toBeGreaterThanOrEqual(30);
    });

    it('should have unique names', () => {
      const names = ABILITY_TEMPLATES.map(a => a.name);
      expect(new Set(names).size).toBe(names.length);
    });
  });
});
