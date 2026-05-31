import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Encounter, CombatState } from '@/types';
import { createUserStorage } from '@/lib/user-storage';
import { registerStore } from '@/lib/store-registry';

interface EncounterStore {
  encounters: Encounter[];
  combatStates: Record<string, CombatState>;
  addEncounter: (encounter: Omit<Encounter, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateEncounter: (id: string, updates: Partial<Encounter>) => void;
  deleteEncounter: (id: string) => void;
  saveCombatState: (state: CombatState) => void;
  clearCombatState: (encounterId: string) => void;
}

const initialState = {
  encounters: [] as Encounter[],
  combatStates: {} as Record<string, CombatState>,
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
        set((state) => {
          const { [id]: _, ...remainingCombat } = state.combatStates;
          return {
            encounters: state.encounters.filter((e) => e.id !== id),
            combatStates: remainingCombat,
          };
        }),

      saveCombatState: (combatState) =>
        set((state) => ({
          combatStates: {
            ...state.combatStates,
            [combatState.encounterId]: combatState,
          },
        })),

      clearCombatState: (encounterId) =>
        set((state) => {
          const { [encounterId]: _, ...rest } = state.combatStates;
          return { combatStates: rest };
        }),
    }),
    {
      name: 'nimble-gm-encounters',
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;
        if (version < 2) {
          state.combatStates = {};
        }
        return state as unknown as EncounterStore;
      },
      storage: createUserStorage('nimble-gm-encounters'),
    }
  )
);

registerStore({
  rehydrate: () => useEncounterStore.persist.rehydrate(),
  resetState: () => useEncounterStore.setState(initialState),
});
