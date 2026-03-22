import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoredImage } from '@/types';
import { createUserStorage } from '@/lib/user-storage';
import { registerStore } from '@/lib/store-registry';
import { putImageBlob, deleteImageBlob } from '@/lib/image-db';
import { cacheImageData } from '@/hooks/use-image-data';

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
        const { dataUri, ...metadata } = image;
        // Store blob in IndexedDB, metadata in localStorage
        putImageBlob(`img:${id}`, dataUri);
        cacheImageData(`img:${id}`, dataUri);
        set((state) => ({
          images: [
            ...state.images,
            { ...metadata, dataUri: '', id, createdAt: now },
          ],
        }));
        return id;
      },

      updateImage: (id, updates) => {
        if (updates.dataUri) {
          putImageBlob(`img:${id}`, updates.dataUri);
          cacheImageData(`img:${id}`, updates.dataUri);
          updates = { ...updates, dataUri: '' };
        }
        set((state) => ({
          images: state.images.map((img) =>
            img.id === id ? { ...img, ...updates } : img
          ),
        }));
      },

      deleteImage: (id) => {
        deleteImageBlob(`img:${id}`);
        set((state) => ({
          images: state.images.filter((img) => img.id !== id),
        }));
      },

      getImagesByCampaign: (campaignId) =>
        get().images.filter((img) => img.campaignId === campaignId),
    }),
    {
      name: 'nimble-gm-images',
      version: 2,
      storage: createUserStorage('nimble-gm-images'),
      migrate: (persisted, version) => {
        const state = persisted as { images: StoredImage[] };
        if (version < 2 && state.images) {
          // Migrate inline dataUri to IndexedDB
          for (const img of state.images) {
            if (img.dataUri) {
              putImageBlob(`img:${img.id}`, img.dataUri);
              img.dataUri = '';
            }
          }
        }
        return state;
      },
    }
  )
);

registerStore({
  rehydrate: () => useImageStore.persist.rehydrate(),
  resetState: () => useImageStore.setState(initialState),
});
