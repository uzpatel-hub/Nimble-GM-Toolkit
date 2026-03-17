import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameMap, MapPin } from '@/types';
import { createUserStorage } from '@/lib/user-storage';
import { registerStore } from '@/lib/store-registry';

interface MapStore {
  maps: GameMap[];
  addMap: (map: Omit<GameMap, 'id' | 'createdAt' | 'updatedAt' | 'pins'>) => string;
  updateMap: (id: string, updates: Partial<GameMap>) => void;
  deleteMap: (id: string) => void;
  addPin: (mapId: string, pin: Omit<MapPin, 'id'>) => string;
  updatePin: (mapId: string, pinId: string, updates: Partial<MapPin>) => void;
  deletePin: (mapId: string, pinId: string) => void;
}

const initialState = {
  maps: [] as GameMap[],
};

export const useMapStore = create<MapStore>()(
  persist(
    (set) => ({
      ...initialState,

      addMap: (map) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        set((state) => ({
          maps: [
            ...state.maps,
            { ...map, id, pins: [], createdAt: now, updatedAt: now },
          ],
        }));
        return id;
      },

      updateMap: (id, updates) =>
        set((state) => ({
          maps: state.maps.map((m) =>
            m.id === id
              ? { ...m, ...updates, updatedAt: new Date().toISOString() }
              : m
          ),
        })),

      deleteMap: (id) =>
        set((state) => ({
          maps: state.maps.filter((m) => m.id !== id),
        })),

      addPin: (mapId, pin) => {
        const pinId = crypto.randomUUID();
        set((state) => ({
          maps: state.maps.map((m) =>
            m.id === mapId
              ? {
                  ...m,
                  pins: [...m.pins, { ...pin, id: pinId }],
                  updatedAt: new Date().toISOString(),
                }
              : m
          ),
        }));
        return pinId;
      },

      updatePin: (mapId, pinId, updates) =>
        set((state) => ({
          maps: state.maps.map((m) =>
            m.id === mapId
              ? {
                  ...m,
                  pins: m.pins.map((p) =>
                    p.id === pinId ? { ...p, ...updates } : p
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : m
          ),
        })),

      deletePin: (mapId, pinId) =>
        set((state) => ({
          maps: state.maps.map((m) =>
            m.id === mapId
              ? {
                  ...m,
                  pins: m.pins.filter((p) => p.id !== pinId),
                  updatedAt: new Date().toISOString(),
                }
              : m
          ),
        })),
    }),
    {
      name: 'nimble-gm-maps',
      version: 1,
      storage: createUserStorage('nimble-gm-maps'),
    }
  )
);

registerStore({
  rehydrate: () => useMapStore.persist.rehydrate(),
  resetState: () => useMapStore.setState(initialState),
});
