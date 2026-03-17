const STORE_KEYS = [
  'nimble-gm-campaigns',
  'nimble-gm-chat',
  'nimble-gm-encounters',
  'nimble-gm-images',
  'nimble-gm-maps',
  'nimble-gm-monsters',
  'nimble-gm-notes',
  'nimble-gm-npcs',
  'nimble-gm-settings',
  'nimble-gm-treasure',
];

const MIGRATION_FLAG = 'nimble-gm-legacy-migrated';

/**
 * Migrates data from old un-namespaced localStorage keys
 * to the new user-namespaced format (key:username).
 * Only runs once per device.
 */
export function migrateLegacyData(username: string) {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(MIGRATION_FLAG)) return;

  let migrated = false;
  for (const key of STORE_KEYS) {
    const data = localStorage.getItem(key);
    if (data) {
      const namespacedKey = `${key}:${username}`;
      // Only migrate if the namespaced key doesn't already exist
      if (!localStorage.getItem(namespacedKey)) {
        localStorage.setItem(namespacedKey, data);
        migrated = true;
      }
      // Remove old key
      localStorage.removeItem(key);
    }
  }

  localStorage.setItem(MIGRATION_FLAG, 'true');

  if (migrated) {
    console.log(`[nimble] Migrated legacy data to profile: ${username}`);
  }
}
