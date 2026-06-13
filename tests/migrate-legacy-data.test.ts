import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { migrateLegacyData } from '@/lib/migrate-legacy-data';

const MIGRATION_FLAG = 'nimble-gm-legacy-migrated';

// Minimal in-memory localStorage stub for the node test environment.
function installLocalStorage(seed: Record<string, string> = {}) {
  const store = new Map<string, string>(Object.entries(seed));
  const ls = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    get length() {
      return store.size;
    },
    key: (i: number) => Array.from(store.keys())[i] ?? null,
  };
  vi.stubGlobal('window', {});
  vi.stubGlobal('localStorage', ls);
  return store;
}

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('migrateLegacyData', () => {
  it('moves un-namespaced keys to the user namespace and removes the originals', () => {
    const store = installLocalStorage({
      'nimble-gm-campaigns': '{"a":1}',
      'nimble-gm-notes': '{"b":2}',
    });

    migrateLegacyData('alice');

    expect(store.get('nimble-gm-campaigns:alice')).toBe('{"a":1}');
    expect(store.get('nimble-gm-notes:alice')).toBe('{"b":2}');
    expect(store.has('nimble-gm-campaigns')).toBe(false);
    expect(store.has('nimble-gm-notes')).toBe(false);
    expect(store.get(MIGRATION_FLAG)).toBe('true');
  });

  it('does nothing when the migration flag is already set', () => {
    const store = installLocalStorage({
      [MIGRATION_FLAG]: 'true',
      'nimble-gm-campaigns': '{"a":1}',
    });

    migrateLegacyData('alice');

    // Legacy key left untouched, no namespaced key written.
    expect(store.get('nimble-gm-campaigns')).toBe('{"a":1}');
    expect(store.has('nimble-gm-campaigns:alice')).toBe(false);
  });

  it('does not overwrite an existing namespaced key but still clears the legacy one', () => {
    const store = installLocalStorage({
      'nimble-gm-campaigns': 'OLD',
      'nimble-gm-campaigns:alice': 'EXISTING',
    });

    migrateLegacyData('alice');

    expect(store.get('nimble-gm-campaigns:alice')).toBe('EXISTING');
    expect(store.has('nimble-gm-campaigns')).toBe(false);
    expect(store.get(MIGRATION_FLAG)).toBe('true');
  });

  it('sets the flag even when there is nothing to migrate', () => {
    const store = installLocalStorage({});
    migrateLegacyData('alice');
    expect(store.get(MIGRATION_FLAG)).toBe('true');
  });

  it('is a no-op on a second run', () => {
    const store = installLocalStorage({ 'nimble-gm-notes': '{"b":2}' });

    migrateLegacyData('alice');
    // Simulate new legacy data appearing after the first migration.
    store.set('nimble-gm-notes', 'SHOULD_NOT_MIGRATE');
    migrateLegacyData('alice');

    expect(store.get('nimble-gm-notes')).toBe('SHOULD_NOT_MIGRATE');
    expect(store.get('nimble-gm-notes:alice')).toBe('{"b":2}');
  });
});
