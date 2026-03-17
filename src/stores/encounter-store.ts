import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Encounter } from '@/types';
import { createUserStorage } from '@/lib/user-storage';
import { registerStore } from '@/lib/store-registry';

interface EncounterStore {
  encounters: Encounter[];
  addEncounter: (encounter: Omit<Encounter, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateEncounter: (id: string, updates: Partial<Encounter>) => void;
  deleteEncounter: (id: string) => void;
}

const initialState = {
  encounters: [] as Encounter[],
};

export const useEncounterStore = create<EncounterStore>()(
  persist(
    (set) => ({
      ...initialState,

      addEncounter: (encounter) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        set((state) => ({
          encounters: [
            ...state.encounters,
            { ...encounter, id, createdAt: now, updatedAt: now },
          ],
        }));
        return id;
      },

      updateEncounter: (id, updates) =>
        set((state) => ({
          encounters: state.encounters.map((e) =>
            e.id === id
              ? { ...e, ...updates, updatedAt: new Date().toISOString() }
              : e
          ),
        })),

      deleteEncounter: (id) =>
        set((state) => ({
          encounters: state.encounters.filter((e) => e.id !== id),
        })),
    }),
    {
      name: 'nimble-gm-encounters',
      version: 1,
      storage: createUserStorage('nimble-gm-encounters'),
    }
  )
);

registerStore({
  rehydrate: () => useEncounterStore.persist.rehydrate(),
  resetState: () => useEncounterStore.setState(initialState),
});
