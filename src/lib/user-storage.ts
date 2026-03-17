import { createJSONStorage, type StateStorage } from 'zustand/middleware';

let currentUser: string | null = null;

export function setCurrentUser(user: string | null) {
  currentUser = user;
}

export function getCurrentUser() {
  return currentUser;
}

function createUserRawStorage(baseName: string): StateStorage {
  return {
    getItem: () => {
      if (!currentUser) return null;
      return localStorage.getItem(`${baseName}:${currentUser}`);
    },
    setItem: (_name: string, value: string) => {
      if (!currentUser) return;
      localStorage.setItem(`${baseName}:${currentUser}`, value);
    },
    removeItem: () => {
      if (!currentUser) return;
      localStorage.removeItem(`${baseName}:${currentUser}`);
    },
  };
}

export function createUserStorage(baseName: string) {
  return createJSONStorage(() => createUserRawStorage(baseName));
}
