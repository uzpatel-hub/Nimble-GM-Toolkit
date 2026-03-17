import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatConversation, ChatContext, ChatMessage } from '@/types';
import { createUserStorage } from '@/lib/user-storage';
import { registerStore } from '@/lib/store-registry';

interface ChatStore {
  conversations: ChatConversation[];
  addConversation: (context: ChatContext, title: string) => string;
  addMessage: (conversationId: string, message: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  deleteConversation: (id: string) => void;
  getConversationsByContext: (context: ChatContext) => ChatConversation[];
  getConversationsByCampaign: (campaignId: string) => ChatConversation[];
}

const initialState = {
  conversations: [] as ChatConversation[],
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addConversation: (context, title) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        set((state) => ({
          conversations: [
            ...state.conversations,
            {
              id,
              campaignId: context.campaignId,
              contextType: context.type,
              sessionId: context.sessionId,
              encounterId: context.encounterId,
              title,
              messages: [],
              createdAt: now,
              updatedAt: now,
            },
          ],
        }));
        return id;
      },

      addMessage: (conversationId, message) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [
                    ...c.messages,
                    {
                      ...message,
                      id: crypto.randomUUID(),
                      createdAt: new Date().toISOString(),
                    },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        })),

      deleteConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
        })),

      getConversationsByContext: (context) => {
        const convs = get().conversations.filter((c) => {
          if (c.campaignId !== context.campaignId) return false;
          if (context.type === 'campaign') return c.contextType === 'campaign';
          if (context.type === 'session')
            return c.contextType === 'session' && c.sessionId === context.sessionId;
          if (context.type === 'encounter')
            return c.contextType === 'encounter' && c.encounterId === context.encounterId;
          return false;
        });
        return convs;
      },

      getConversationsByCampaign: (campaignId) =>
        get().conversations.filter(
          (c) => c.campaignId === campaignId && c.contextType === 'campaign'
        ),
    }),
    {
      name: 'nimble-gm-chat',
      version: 2,
      storage: createUserStorage('nimble-gm-chat'),
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as ChatStore;
        if (version < 2) {
          state.conversations = state.conversations.map((c) => ({
            ...c,
            contextType: (c as ChatConversation).contextType ?? 'campaign',
          }));
        }
        return state;
      },
    }
  )
);

registerStore({
  rehydrate: () => useChatStore.persist.rehydrate(),
  resetState: () => useChatStore.setState(initialState),
});
