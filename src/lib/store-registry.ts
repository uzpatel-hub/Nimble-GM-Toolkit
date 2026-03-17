interface RegisteredStore {
  rehydrate: () => void;
  resetState: () => void;
}

const registry: RegisteredStore[] = [];

export function registerStore(entry: RegisteredStore) {
  registry.push(entry);
}

export function rehydrateAllStores() {
  registry.forEach((s) => s.rehydrate());
}

export function resetAllStores() {
  registry.forEach((s) => s.resetState());
}
