import { describe, it, expect, beforeEach } from 'vitest';
import { useNpcStore } from '@/stores/npc-store';

describe('NPC Store', () => {
  beforeEach(() => {
    useNpcStore.setState({ npcs: [] });
  });

  it('should add an NPC', () => {
    const id = useNpcStore.getState().addNpc({
      campaignId: 'camp-1',
      name: 'Elara',
      role: 'Innkeeper',
      description: 'A friendly halfling',
      personality: 'Warm and chatty',
      notes: 'Knows about the goblin camp',
      linkedLocationNames: ['Riverside Inn'],
      linkedSessionIds: [],
    });
    expect(id).toBeDefined();
    const npcs = useNpcStore.getState().npcs;
    expect(npcs).toHaveLength(1);
    expect(npcs[0].name).toBe('Elara');
    expect(npcs[0].role).toBe('Innkeeper');
  });

  it('should update an NPC', () => {
    const id = useNpcStore.getState().addNpc({
      campaignId: 'camp-1',
      name: 'Old Name',
      role: 'Guard',
      description: '',
      personality: '',
      notes: '',
      linkedLocationNames: [],
      linkedSessionIds: [],
    });
    useNpcStore.getState().updateNpc(id, { name: 'New Name', role: 'Captain' });
    const npc = useNpcStore.getState().npcs[0];
    expect(npc.name).toBe('New Name');
    expect(npc.role).toBe('Captain');
  });

  it('should delete an NPC', () => {
    const id = useNpcStore.getState().addNpc({
      campaignId: 'camp-1',
      name: 'To Delete',
      role: '',
      description: '',
      personality: '',
      notes: '',
      linkedLocationNames: [],
      linkedSessionIds: [],
    });
    useNpcStore.getState().deleteNpc(id);
    expect(useNpcStore.getState().npcs).toHaveLength(0);
  });
});
