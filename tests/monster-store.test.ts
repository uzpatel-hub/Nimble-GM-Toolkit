import { describe, it, expect, beforeEach } from 'vitest';
import { useMonsterStore } from '@/stores/monster-store';
import { BESTIARY_MONSTERS } from '@/data/bestiary';

describe('Monster Store', () => {
  beforeEach(() => {
    // Reset to default bestiary
    useMonsterStore.setState({ monsters: [...BESTIARY_MONSTERS] });
  });

  it('should be seeded with bestiary monsters', () => {
    const monsters = useMonsterStore.getState().monsters;
    expect(monsters.length).toBeGreaterThanOrEqual(50);
  });

  it('should contain known monsters', () => {
    const monsters = useMonsterStore.getState().monsters;
    const kobold = monsters.find(m => m.name === 'Kobold Minion');
    expect(kobold).toBeDefined();
    expect(kobold!.faction).toBe('Kobold');
    expect(kobold!.level).toBe(0.25);
    expect(kobold!.isCustom).toBe(false);

    const ghoul = monsters.find(m => m.name === 'Ghoul');
    expect(ghoul).toBeDefined();
    expect(ghoul!.faction).toBe('Undead');
  });

  it('should add a custom monster', () => {
    const initialCount = useMonsterStore.getState().monsters.length;
    const id = useMonsterStore.getState().addMonster({
      name: 'Custom Beast',
      level: 5,
      faction: 'Custom',
      size: 'medium',
      armorType: 'none',
      hp: 50,
      abilities: [{ name: 'Bite', description: '2d6+4 damage' }],
      isCustom: true,
      description: 'A custom test monster',
    });
    expect(id).toBeDefined();
    expect(useMonsterStore.getState().monsters.length).toBe(initialCount + 1);
  });

  it('should only delete custom monsters', () => {
    // Try to delete a built-in monster
    const builtIn = useMonsterStore.getState().monsters.find(m => !m.isCustom);
    expect(builtIn).toBeDefined();
    const countBefore = useMonsterStore.getState().monsters.length;
    useMonsterStore.getState().deleteMonster(builtIn!.id);
    expect(useMonsterStore.getState().monsters.length).toBe(countBefore);
  });

  it('should delete custom monsters', () => {
    const id = useMonsterStore.getState().addMonster({
      name: 'Deletable',
      level: 1,
      faction: 'Custom',
      size: 'medium',
      armorType: 'none',
      hp: 10,
      abilities: [],
      isCustom: true,
      description: '',
    });
    const countBefore = useMonsterStore.getState().monsters.length;
    useMonsterStore.getState().deleteMonster(id);
    expect(useMonsterStore.getState().monsters.length).toBe(countBefore - 1);
  });

  it('should update a monster', () => {
    const id = useMonsterStore.getState().addMonster({
      name: 'Before Update',
      level: 1,
      faction: 'Test',
      size: 'medium',
      armorType: 'none',
      hp: 10,
      abilities: [],
      isCustom: true,
      description: '',
    });
    useMonsterStore.getState().updateMonster(id, { name: 'After Update', hp: 99 });
    const monster = useMonsterStore.getState().monsters.find(m => m.id === id);
    expect(monster!.name).toBe('After Update');
    expect(monster!.hp).toBe(99);
  });
});
