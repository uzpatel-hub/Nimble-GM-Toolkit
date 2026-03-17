import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NPC } from '@/types';
import { createUserStorage } from '@/lib/user-storage';
import { registerStore } from '@/lib/store-registry';

interface NpcStore {
  npcs: NPC[];
  addNpc: (npc: Omit<NPC, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateNpc: (id: string, updates: Partial<NPC>) => void;
  deleteNpc: (id: string) => void;
}

const initialState = {
  npcs: [] as NPC[],
};

export const useNpcStore = create<NpcStore>()(
  persist(
    (set) => ({
      ...initialState,

      addNpc: (npc) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        set((state) => ({
          npcs: [
            ...state.npcs,
            { ...npc, id, createdAt: now, updatedAt: now },
          ],
        }));
        return id;
      },

      updateNpc: (id, updates) =>
        set((state) => ({
          npcs: state.npcs.map((n) =>
            n.id === id
              ? { ...n, ...updates, updatedAt: new Date().toISOString() }
              : n
          ),
        })),

      deleteNpc: (id) =>
        set((state) => ({
          npcs: state.npcs.filter((n) => n.id !== id),
        })),
    }),
    {
      name: 'nimble-gm-npcs',
      version: 1,
      storage: createUserStorage('nimble-gm-npcs'),
    }
  )
);

registerStore({
  rehydrate: () => useNpcStore.persist.rehydrate(),
  resetState: () => useNpcStore.setState(initialState),
});
