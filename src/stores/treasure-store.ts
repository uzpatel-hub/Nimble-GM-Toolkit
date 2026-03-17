import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Boon, TreasureEntry } from '@/types';
import { DEFAULT_BOONS } from '@/data/treasure';
import { createUserStorage } from '@/lib/user-storage';
import { registerStore } from '@/lib/store-registry';

interface TreasureStore {
  boons: Boon[];
  treasures: TreasureEntry[];
  addBoon: (boon: Omit<Boon, 'id'>) => string;
  updateBoon: (id: string, updates: Partial<Boon>) => void;
  deleteBoon: (id: string) => void;
  addTreasure: (treasure: Omit<TreasureEntry, 'id' | 'createdAt'>) => string;
  deleteTreasure: (id: string) => void;
}

const initialState = {
  boons: DEFAULT_BOONS as Boon[],
  treasures: [] as TreasureEntry[],
};

export const useTreasureStore = create<TreasureStore>()(
  persist(
    (set) => ({
      ...initialState,

      addBoon: (boon) => {
        const id = crypto.randomUUID();
        set((state) => ({
          boons: [...state.boons, { ...boon, id }],
        }));
        return id;
      },

      updateBoon: (id, updates) =>
        set((state) => ({
          boons: state.boons.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        })),

      deleteBoon: (id) =>
        set((state) => ({
          boons: state.boons.filter((b) => b.id !== id || !b.isCustom),
        })),

      addTreasure: (treasure) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        set((state) => ({
          treasures: [
            ...state.treasures,
            { ...treasure, id, createdAt: now },
          ],
        }));
        return id;
      },

      deleteTreasure: (id) =>
        set((state) => ({
          treasures: state.treasures.filter((t) => t.id !== id),
        })),
    }),
    {
      name: 'nimble-gm-treasure',
      version: 1,
      storage: createUserStorage('nimble-gm-treasure'),
    }
  )
);

registerStore({
  rehydrate: () => useTreasureStore.persist.rehydrate(),
  resetState: () => useTreasureStore.setState(initialState),
});
