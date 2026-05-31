import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Monster } from '@/types';
import { BESTIARY_MONSTERS } from '@/data/bestiary';
import { createUserStorage } from '@/lib/user-storage';
import { registerStore } from '@/lib/store-registry';

interface MonsterStore {
  monsters: Monster[];
  addMonster: (monster: Omit<Monster, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateMonster: (id: string, updates: Partial<Monster>) => void;
  deleteMonster: (id: string) => void;
}

const initialState = {
  monsters: BESTIARY_MONSTERS as Monster[],
};

export const useMonsterStore = create<MonsterStore>()(
  persist(
    (set) => ({
      ...initialState,

      addMonster: (monster) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        set((state) => ({
          monsters: [
            ...state.monsters,
            { ...monster, id, createdAt: now, updatedAt: now },
          ],
        }));
        return id;
      },

      updateMonster: (id, updates) =>
        set((state) => ({
          monsters: state.monsters.map((m) =>
            m.id === id
              ? { ...m, ...updates, updatedAt: new Date().toISOString() }
              : m
          ),
        })),

      deleteMonster: (id) =>
        set((state) => ({
          monsters: state.monsters.filter((m) => m.id !== id || !m.isCustom),
        })),
    }),
    {
      name: 'nimble-gm-monsters',
      version: 2,
      storage: createUserStorage('nimble-gm-monsters'),
      merge: (persistedState, currentState) => {
        if (!persistedState || typeof persistedState !== 'object') return currentState;
        const persisted = persistedState as Partial<MonsterStore>;
        const customMonsters = (persisted.monsters ?? []).filter((m) => m.isCustom);
        return {
          ...currentState,
          ...persisted,
          monsters: [...BESTIARY_MONSTERS, ...customMonsters],
        };
      },
    }
  )
);

registerStore({
  rehydrate: () => useMonsterStore.persist.rehydrate(),
  resetState: () => useMonsterStore.setState(initialState),
});
