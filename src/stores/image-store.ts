import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoredImage } from '@/types';
import { createUserStorage } from '@/lib/user-storage';
import { registerStore } from '@/lib/store-registry';

interface ImageStore {
  images: StoredImage[];
  addImage: (image: Omit<StoredImage, 'id' | 'createdAt'>) => string;
  updateImage: (id: string, updates: Partial<StoredImage>) => void;
  deleteImage: (id: string) => void;
  getImagesByCampaign: (campaignId: string) => StoredImage[];
}

const initialState = {
  images: [] as StoredImage[],
};

export const useImageStore = create<ImageStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addImage: (image) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        set((state) => ({
          images: [
            ...state.images,
            { ...image, id, createdAt: now },
          ],
        }));
        return id;
      },

      updateImage: (id, updates) =>
        set((state) => ({
          images: state.images.map((img) =>
            img.id === id ? { ...img, ...updates } : img
          ),
        })),

      deleteImage: (id) =>
        set((state) => ({
          images: state.images.filter((img) => img.id !== id),
        })),

      getImagesByCampaign: (campaignId) =>
        get().images.filter((img) => img.campaignId === campaignId),
    }),
    {
      name: 'nimble-gm-images',
      version: 1,
      storage: createUserStorage('nimble-gm-images'),
    }
  )
);

registerStore({
  rehydrate: () => useImageStore.persist.rehydrate(),
  resetState: () => useImageStore.setState(initialState),
});
