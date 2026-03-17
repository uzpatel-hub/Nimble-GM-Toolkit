import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setCurrentUser } from '@/lib/user-storage';
import { rehydrateAllStores, resetAllStores } from '@/lib/store-registry';
import { migrateLegacyData } from '@/lib/migrate-legacy-data';

const USERNAME_REGEX = /^[a-z0-9_]{3,30}$/;

interface AuthStore {
  currentUser: string | null;
  knownUsers: string[];
  error: string | null;
  login: (username: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      knownUsers: [],
      error: null,

      login: (rawUsername: string) => {
        const username = rawUsername.trim().toLowerCase();

        if (!USERNAME_REGEX.test(username)) {
          set({ error: '3-30 characters, lowercase letters, numbers, and underscores only' });
          return;
        }

        const { knownUsers } = get();
        const updatedUsers = knownUsers.includes(username)
          ? knownUsers
          : [...knownUsers, username];

        // Migrate any legacy un-namespaced data for the first user
        migrateLegacyData(username);

        setCurrentUser(username);
        set({ currentUser: username, knownUsers: updatedUsers, error: null });

        // Rehydrate all stores to load this user's data
        rehydrateAllStores();
      },

      logout: () => {
        resetAllStores();
        setCurrentUser(null);
        set({ currentUser: null, error: null });
      },
    }),
    {
      name: 'nimble-gm-auth',
      partialize: (state) => ({
        currentUser: state.currentUser,
        knownUsers: state.knownUsers,
      }),
      onRehydrateStorage: () => (state) => {
        // Restore the module-level currentUser on page load
        if (state?.currentUser) {
          setCurrentUser(state.currentUser);
        }
      },
    }
  )
);
