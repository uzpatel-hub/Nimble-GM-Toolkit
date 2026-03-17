import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AISettings } from '@/types';
import { createUserStorage } from '@/lib/user-storage';
import { registerStore } from '@/lib/store-registry';

interface SettingsStore {
  aiSettings: AISettings;
  updateAISettings: (updates: Partial<AISettings>) => void;
}

const initialState = {
  aiSettings: {
    provider: 'claude' as const,
    apiKey: '',
    model: 'claude-sonnet-4-20250514',
    userContext: '',
  },
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...initialState,

      updateAISettings: (updates) =>
        set((state) => ({
          aiSettings: { ...state.aiSettings, ...updates },
        })),
    }),
    {
      name: 'nimble-gm-settings',
      storage: createUserStorage('nimble-gm-settings'),
    }
  )
);

registerStore({
  rehydrate: () => useSettingsStore.persist.rehydrate(),
  resetState: () => useSettingsStore.setState(initialState),
});
