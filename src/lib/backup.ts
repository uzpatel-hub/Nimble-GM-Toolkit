import { getCurrentUser } from './user-storage';

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

interface BackupData {
  version: 1;
  username: string;
  exportedAt: string;
  stores: Record<string, unknown>;
}

export function exportBackup(): string {
  const username = getCurrentUser();
  if (!username) throw new Error('No user logged in');

  const stores: Record<string, unknown> = {};
  for (const key of STORE_KEYS) {
    const raw = localStorage.getItem(`${key}:${username}`);
    if (raw) {
      try {
        stores[key] = JSON.parse(raw);
      } catch {
        stores[key] = raw;
      }
    }
  }

  const backup: BackupData = {
    version: 1,
    username,
    exportedAt: new Date().toISOString(),
    stores,
  };

  return JSON.stringify(backup, null, 2);
}

export function downloadBackup() {
  const json = exportBackup();
  const username = getCurrentUser() ?? 'unknown';
  const date = new Date().toISOString().slice(0, 10);
  const filename = `nimble-gm-backup-${username}-${date}.json`;

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function importBackup(json: string): { username: string; storeCount: number } {
  const data: BackupData = JSON.parse(json);

  if (!data.version || !data.stores || !data.username) {
    throw new Error('Invalid backup file');
  }

  const username = getCurrentUser();
  if (!username) throw new Error('No user logged in');

  let storeCount = 0;
  for (const key of STORE_KEYS) {
    if (data.stores[key]) {
      const value = typeof data.stores[key] === 'string'
        ? data.stores[key] as string
        : JSON.stringify(data.stores[key]);
      localStorage.setItem(`${key}:${username}`, value);
      storeCount++;
    }
  }

  return { username: data.username, storeCount };
}
