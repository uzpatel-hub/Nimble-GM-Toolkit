import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Campaign, Session } from '@/types';
import { createUserStorage } from '@/lib/user-storage';
import { registerStore } from '@/lib/store-registry';

interface CampaignStore {
  campaigns: Campaign[];
  sessions: Session[];
  activeCampaignId: string | null;
  setActiveCampaignId: (id: string | null) => void;
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  addSession: (session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateSession: (id: string, updates: Partial<Session>) => void;
  deleteSession: (id: string) => void;
}

const initialState = {
  campaigns: [] as Campaign[],
  sessions: [] as Session[],
  activeCampaignId: null as string | null,
};

export const useCampaignStore = create<CampaignStore>()(
  persist(
    (set) => ({
      ...initialState,

      setActiveCampaignId: (id) => set({ activeCampaignId: id }),

      addCampaign: (campaign) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        set((state) => ({
          campaigns: [
            ...state.campaigns,
            { ...campaign, id, createdAt: now, updatedAt: now },
          ],
        }));
        return id;
      },

      updateCampaign: (id, updates) =>
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id
              ? { ...c, ...updates, updatedAt: new Date().toISOString() }
              : c
          ),
        })),

      deleteCampaign: (id) =>
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== id),
          sessions: state.sessions.filter((s) => s.campaignId !== id),
          activeCampaignId:
            state.activeCampaignId === id ? null : state.activeCampaignId,
        })),

      addSession: (session) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        set((state) => ({
          sessions: [
            ...state.sessions,
            { ...session, id, createdAt: now, updatedAt: now },
          ],
        }));
        return id;
      },

      updateSession: (id, updates) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id
              ? { ...s, ...updates, updatedAt: new Date().toISOString() }
              : s
          ),
        })),

      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        })),
    }),
    {
      name: 'nimble-gm-campaigns',
      version: 3,
      storage: createUserStorage('nimble-gm-campaigns'),
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as CampaignStore;
        if (version < 2) {
          state.campaigns = state.campaigns.map((c) => ({
            ...c,
            partyMembers: (c as Campaign).partyMembers ?? [],
          }));
        }
        if (version < 3) {
          state.sessions = state.sessions.map((s) => ({
            ...s,
            sessionEncounters: (s as Session).sessionEncounters ?? [],
          }));
        }
        return state;
      },
    }
  )
);

registerStore({
  rehydrate: () => useCampaignStore.persist.rehydrate(),
  resetState: () => useCampaignStore.setState(initialState),
});
