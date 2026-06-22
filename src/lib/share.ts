/**
 * Share export/import for party members and NPCs.
 * Produces a self-contained JSON file that another GM can import
 * into their own campaign — images included.
 */

import type { PartyMember, NPC, StoredImage, GameMap } from '@/types';
import { getImageBlob, putImageBlob } from './image-db';
import { cacheImageData } from '@/hooks/use-image-data';

// ---- Types ----

export interface SharePayload {
  type: 'nimble-gm-share';
  version: 1 | 2;
  exportedAt: string;
  campaignName: string;
  partyMembers: PartyMember[];
  npcs: NPC[];
  images: Omit<StoredImage, 'campaignId'>[];
  imageBlobs: Record<string, string>;
  /** v2: maps with pins */
  maps?: Omit<GameMap, 'campaignId'>[];
}

export interface ShareImportResult {
  partyMembersCount: number;
  npcsCount: number;
  imagesCount: number;
  mapsCount: number;
}

// ---- Export ----

export async function buildSharePayload({
  campaignName,
  partyMembers,
  npcs,
  images,
  maps,
  selectedImageIds,
}: {
  campaignName: string;
  partyMembers: PartyMember[];
  npcs: NPC[];
  images: StoredImage[];
  maps?: GameMap[];
  /** Image IDs explicitly chosen for export (e.g. by category), included
   *  in addition to images referenced by NPCs/maps/party members. */
  selectedImageIds?: string[];
}): Promise<SharePayload> {
  // Seed with explicitly-selected images, then add anything referenced
  // by NPCs, maps, and party members so attached art always travels.
  const referencedImageIds = new Set<string>(selectedImageIds ?? []);
  for (const n of npcs) {
    if (n.imageId) referencedImageIds.add(n.imageId);
  }
  for (const m of (maps ?? [])) {
    if (m.imageId) referencedImageIds.add(m.imageId);
  }
  // Also include party member images
  for (const pm of partyMembers) {
    if (pm.imageId) referencedImageIds.add(pm.imageId);
  }

  // Filter images to only those referenced
  const relevantImages = images.filter((img) => referencedImageIds.has(img.id));

  // Fetch blobs from IndexedDB
  const imageBlobs: Record<string, string> = {};
  for (const img of relevantImages) {
    const blob = await getImageBlob(`img:${img.id}`);
    if (blob) imageBlobs[img.id] = blob;
  }

  // Also fetch map inline image blobs (legacy imageDataUri maps)
  for (const m of (maps ?? [])) {
    if (m.imageId) {
      // Already handled above
    }
  }

  // Strip campaignId from images (will be assigned on import)
  const portableImages = relevantImages.map(({ campaignId: _, ...rest }) => rest);

  // Strip campaignId from maps
  const portableMaps = (maps ?? []).map(({ campaignId: _, ...rest }) => rest);

  return {
    type: 'nimble-gm-share',
    version: 2,
    exportedAt: new Date().toISOString(),
    campaignName,
    partyMembers,
    npcs,
    images: portableImages,
    imageBlobs,
    maps: portableMaps.length > 0 ? portableMaps : undefined,
  };
}

export function downloadShareFile(payload: SharePayload, label: string) {
  const json = JSON.stringify(payload, null, 2);
  const date = new Date().toISOString().slice(0, 10);
  const safeName = label.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-').toLowerCase();
  const filename = `nimble-share-${safeName}-${date}.json`;

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---- Import ----

/**
 * Parse and validate a share file.
 * Returns the payload if valid, throws otherwise.
 */
export function parseShareFile(json: string): SharePayload {
  const data = JSON.parse(json);
  if (data.type !== 'nimble-gm-share' || !data.version) {
    throw new Error('This file is not a Nimble GM share file.');
  }
  return data as SharePayload;
}

/**
 * Import shared party members and NPCs into a target campaign.
 * Assigns new IDs to everything to avoid collisions.
 * Returns the new members and NPCs for the caller to merge into stores.
 */
export async function importSharePayload(
  payload: SharePayload,
  targetCampaignId: string,
): Promise<{
  partyMembers: PartyMember[];
  npcs: NPC[];
  images: StoredImage[];
  maps: GameMap[];
  result: ShareImportResult;
}> {
  const now = new Date().toISOString();

  // Remap image IDs: old -> new
  const imageIdMap = new Map<string, string>();
  const newImages: StoredImage[] = [];

  for (const img of payload.images) {
    const newId = crypto.randomUUID();
    imageIdMap.set(img.id, newId);

    newImages.push({
      ...img,
      id: newId,
      campaignId: targetCampaignId,
      dataUri: '', // blob lives in IndexedDB
      createdAt: img.createdAt || now,
    });

    // Store blob in IndexedDB
    const blob = payload.imageBlobs[img.id];
    if (blob) {
      await putImageBlob(`img:${newId}`, blob);
      cacheImageData(`img:${newId}`, blob);
    }
  }

  // Remap party members with new IDs, update imageId references
  const newMembers: PartyMember[] = payload.partyMembers.map((m) => ({
    ...m,
    id: crypto.randomUUID(),
    imageId: m.imageId ? imageIdMap.get(m.imageId) ?? m.imageId : undefined,
  }));

  // Remap NPCs with new IDs, update imageId references
  const newNpcs: NPC[] = payload.npcs.map((npc) => ({
    ...npc,
    id: crypto.randomUUID(),
    campaignId: targetCampaignId,
    imageId: npc.imageId ? imageIdMap.get(npc.imageId) ?? npc.imageId : undefined,
    createdAt: npc.createdAt || now,
    updatedAt: now,
  }));

  // Remap maps with new IDs, update imageId references
  const newMaps: GameMap[] = (payload.maps ?? []).map((m) => ({
    ...m,
    id: crypto.randomUUID(),
    campaignId: targetCampaignId,
    imageId: m.imageId ? imageIdMap.get(m.imageId) ?? m.imageId : undefined,
    pins: m.pins.map((p) => ({ ...p, id: crypto.randomUUID() })),
    createdAt: m.createdAt || now,
    updatedAt: now,
  }));

  return {
    partyMembers: newMembers,
    npcs: newNpcs,
    images: newImages,
    maps: newMaps,
    result: {
      partyMembersCount: newMembers.length,
      npcsCount: newNpcs.length,
      imagesCount: newImages.length,
      mapsCount: newMaps.length,
    },
  };
}
