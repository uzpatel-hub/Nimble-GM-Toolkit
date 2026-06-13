import { describe, it, expect } from 'vitest';
import { parseShareFile } from '@/lib/share';
import type { SharePayload } from '@/lib/share';

function validPayload(): SharePayload {
  return {
    type: 'nimble-gm-share',
    version: 2,
    exportedAt: '2026-01-01T00:00:00.000Z',
    campaignName: 'Test Campaign',
    partyMembers: [],
    npcs: [],
    images: [],
    imageBlobs: {},
  };
}

describe('parseShareFile', () => {
  it('accepts a well-formed share file', () => {
    const parsed = parseShareFile(JSON.stringify(validPayload()));
    expect(parsed.type).toBe('nimble-gm-share');
    expect(parsed.campaignName).toBe('Test Campaign');
  });

  it('rejects JSON without the share marker', () => {
    expect(() => parseShareFile(JSON.stringify({ version: 2 }))).toThrow(
      /not a Nimble GM share file/,
    );
  });

  it('rejects a share file missing a version', () => {
    const bad = { ...validPayload(), version: undefined };
    expect(() => parseShareFile(JSON.stringify(bad))).toThrow(/not a Nimble GM share file/);
  });

  it('rejects the wrong type marker', () => {
    const bad = { ...validPayload(), type: 'something-else' };
    expect(() => parseShareFile(JSON.stringify(bad))).toThrow(/not a Nimble GM share file/);
  });

  it('throws on malformed JSON', () => {
    expect(() => parseShareFile('{ not valid json')).toThrow();
  });
});
