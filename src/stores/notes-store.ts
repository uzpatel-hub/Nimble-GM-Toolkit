import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoryNote } from '@/types';
import { createUserStorage } from '@/lib/user-storage';
import { registerStore } from '@/lib/store-registry';

interface NotesStore {
  notes: StoryNote[];
  addNote: (note: Omit<StoryNote, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateNote: (id: string, updates: Partial<StoryNote>) => void;
  deleteNote: (id: string) => void;
}

const initialState = {
  notes: [] as StoryNote[],
};

export const useNotesStore = create<NotesStore>()(
  persist(
    (set) => ({
      ...initialState,

      addNote: (note) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        set((state) => ({
          notes: [
            ...state.notes,
            { ...note, id, createdAt: now, updatedAt: now },
          ],
        }));
        return id;
      },

      updateNote: (id, updates) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id
              ? { ...n, ...updates, updatedAt: new Date().toISOString() }
              : n
          ),
        })),

      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        })),
    }),
    {
      name: 'nimble-gm-notes',
      version: 1,
      storage: createUserStorage('nimble-gm-notes'),
    }
  )
);

registerStore({
  rehydrate: () => useNotesStore.persist.rehydrate(),
  resetState: () => useNotesStore.setState(initialState),
});
