import { describe, it, expect, beforeEach } from 'vitest';
import { useEncounterStore } from '@/stores/encounter-store';

describe('Encounter Store', () => {
  beforeEach(() => {
    useEncounterStore.setState({ encounters: [] });
  });

  it('should add an encounter', () => {
    const id = useEncounterStore.getState().addEncounter({
      campaignId: 'camp-1',
      name: 'Goblin Ambush',
      partySize: 4,
      partyLevel: 3,
      monsters: [
        { monsterId: 'goblin-1', name: 'Goblin', level: 0.33, count: 6, isMinion: false },
        { monsterId: 'bugbear-1', name: 'Bugbear', level: 2, count: 1, isMinion: false },
      ],
      difficulty: 'medium',
      difficultyPercent: 72,
      notes: 'Ambush in the forest',
    });
    expect(id).toBeDefined();
    const encounters = useEncounterStore.getState().encounters;
    expect(encounters).toHaveLength(1);
    expect(encounters[0].name).toBe('Goblin Ambush');
    expect(encounters[0].monsters).toHaveLength(2);
  });

  it('should update an encounter', () => {
    const id = useEncounterStore.getState().addEncounter({
      campaignId: 'camp-1',
      name: 'Old Name',
      partySize: 4,
      partyLevel: 3,
      monsters: [],
      difficulty: 'easy',
      difficultyPercent: 0,
      notes: '',
    });
    useEncounterStore.getState().updateEncounter(id, { name: 'New Name', difficulty: 'hard' });
    const enc = useEncounterStore.getState().encounters[0];
    expect(enc.name).toBe('New Name');
    expect(enc.difficulty).toBe('hard');
  });

  it('should delete an encounter', () => {
    const id = useEncounterStore.getState().addEncounter({
      campaignId: 'camp-1',
      name: 'To Delete',
      partySize: 4,
      partyLevel: 1,
      monsters: [],
      difficulty: 'easy',
      difficultyPercent: 0,
      notes: '',
    });
    useEncounterStore.getState().deleteEncounter(id);
    expect(useEncounterStore.getState().encounters).toHaveLength(0);
  });
});
