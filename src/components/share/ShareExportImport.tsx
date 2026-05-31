'use client';

import { useState, useRef } from 'react';
import { Download, Upload, Share2, Check } from 'lucide-react';
import { useCampaignStore } from '@/stores/campaign-store';
import { useNpcStore } from '@/stores/npc-store';
import { useImageStore } from '@/stores/image-store';
import { useMapStore } from '@/stores/map-store';
import {
  buildSharePayload,
  downloadShareFile,
  parseShareFile,
  importSharePayload,
} from '@/lib/share';
import type { NPC, GameMap } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

// ---- Export Dialog ----

interface ShareExportProps {
  campaignId: string;
  /** Pre-select specific NPCs to export (omit to show all) */
  preSelectedNpcIds?: string[];
  trigger?: React.ReactElement;
}

export function ShareExportDialog({ campaignId, preSelectedNpcIds, trigger }: ShareExportProps) {
  const { campaigns } = useCampaignStore();
  const { npcs } = useNpcStore();
  const { images } = useImageStore();
  const { maps } = useMapStore();
  const campaign = campaigns.find((c) => c.id === campaignId);

  const campaignNpcs = npcs.filter((n) => n.campaignId === campaignId);
  const campaignImages = images.filter((img) => img.campaignId === campaignId);
  const campaignMaps = maps.filter((m) => m.campaignId === campaignId);

  const [open, setOpen] = useState(false);
  const [includeParty, setIncludeParty] = useState(true);
  const [includeMaps, setIncludeMaps] = useState(true);
  const [selectedNpcIds, setSelectedNpcIds] = useState<Set<string>>(
    new Set(preSelectedNpcIds ?? campaignNpcs.map((n) => n.id))
  );
  const [selectedMapIds, setSelectedMapIds] = useState<Set<string>>(
    new Set(campaignMaps.map((m) => m.id))
  );
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  // Reset state when dialog opens
  function handleOpenChange(v: boolean) {
    setOpen(v);
    if (v) {
      setSelectedNpcIds(new Set(preSelectedNpcIds ?? campaignNpcs.map((n) => n.id)));
      setSelectedMapIds(new Set(campaignMaps.map((m) => m.id)));
      setIncludeParty(!preSelectedNpcIds);
      setIncludeMaps(!preSelectedNpcIds);
      setExported(false);
    }
  }

  function toggleNpc(id: string) {
    setSelectedNpcIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllNpcs() {
    if (selectedNpcIds.size === campaignNpcs.length) {
      setSelectedNpcIds(new Set());
    } else {
      setSelectedNpcIds(new Set(campaignNpcs.map((n) => n.id)));
    }
  }

  function toggleMap(id: string) {
    setSelectedMapIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllMaps() {
    if (selectedMapIds.size === campaignMaps.length) {
      setSelectedMapIds(new Set());
    } else {
      setSelectedMapIds(new Set(campaignMaps.map((m) => m.id)));
    }
  }

  async function handleExport() {
    if (!campaign) return;
    setExporting(true);
    try {
      const selectedNpcs = campaignNpcs.filter((n) => selectedNpcIds.has(n.id));
      const selectedMaps = includeMaps ? campaignMaps.filter((m) => selectedMapIds.has(m.id)) : [];
      const payload = await buildSharePayload({
        campaignName: campaign.name,
        partyMembers: includeParty ? (campaign.partyMembers ?? []) : [],
        npcs: selectedNpcs,
        images: campaignImages,
        maps: selectedMaps,
      });

      const label = preSelectedNpcIds?.length === 1
        ? selectedNpcs[0]?.name ?? 'npc'
        : campaign.name;
      downloadShareFile(payload, label);
      setExported(true);
    } finally {
      setExporting(false);
    }
  }

  const totalItems = (includeParty ? (campaign?.partyMembers?.length ?? 0) : 0) + selectedNpcIds.size + (includeMaps ? selectedMapIds.size : 0);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button variant="outline" size="sm">
              <Share2 data-icon="inline-start" />
              Share
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-lg max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export to Share</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Export party members and NPCs as a file that another GM can import into their campaign.
          Images are included automatically.
        </p>

        <div className="space-y-4">
          {/* Party toggle */}
          {!preSelectedNpcIds && (campaign?.partyMembers?.length ?? 0) > 0 && (
            <label className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/30">
              <input
                type="checkbox"
                checked={includeParty}
                onChange={() => setIncludeParty(!includeParty)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <div>
                <span className="font-medium text-sm">Party Members</span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({campaign!.partyMembers!.length} players)
                </span>
              </div>
            </label>
          )}

          {/* NPC selection */}
          {campaignNpcs.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">NPCs</span>
                {!preSelectedNpcIds && (
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={toggleAllNpcs}>
                    {selectedNpcIds.size === campaignNpcs.length ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto rounded-md border p-2">
                {campaignNpcs.map((npc) => (
                  <label
                    key={npc.id}
                    className="flex items-center gap-3 rounded px-2 py-1.5 cursor-pointer hover:bg-muted/30"
                  >
                    <input
                      type="checkbox"
                      checked={selectedNpcIds.has(npc.id)}
                      onChange={() => toggleNpc(npc.id)}
                      disabled={!!preSelectedNpcIds}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm">{npc.name}</span>
                    {npc.role && (
                      <span className="text-xs text-muted-foreground">— {npc.role}</span>
                    )}
                    {npc.imageId && (
                      <Badge variant="secondary" className="text-xs ml-auto">has image</Badge>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Map selection */}
          {!preSelectedNpcIds && campaignMaps.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Maps</span>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={toggleAllMaps}>
                  {selectedMapIds.size === campaignMaps.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto rounded-md border p-2">
                {campaignMaps.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center gap-3 rounded px-2 py-1.5 cursor-pointer hover:bg-muted/30"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMapIds.has(m.id)}
                      onChange={() => toggleMap(m.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm">{m.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {m.pins.length} pin{m.pins.length !== 1 ? 's' : ''}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center gap-3 w-full justify-between">
            <span className="text-xs text-muted-foreground">
              {totalItems} item{totalItems !== 1 ? 's' : ''} selected
            </span>
            <Button
              onClick={handleExport}
              disabled={exporting || totalItems === 0}
            >
              {exported ? (
                <>
                  <Check data-icon="inline-start" />
                  Exported!
                </>
              ) : (
                <>
                  <Download data-icon="inline-start" />
                  {exporting ? 'Exporting...' : 'Export File'}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Import Dialog ----

interface ShareImportProps {
  campaignId: string;
  trigger?: React.ReactElement;
}

export function ShareImportDialog({ campaignId, trigger }: ShareImportProps) {
  const { campaigns, updateCampaign } = useCampaignStore();
  const { addNpc } = useNpcStore();
  const { images, addImage } = useImageStore();
  const campaign = campaigns.find((c) => c.id === campaignId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'preview' | 'importing' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<{
    campaignName: string;
    partyCount: number;
    npcCount: number;
    imageCount: number;
    mapCount: number;
    npcs: NPC[];
    maps: Omit<GameMap, 'campaignId'>[];
  } | null>(null);
  const [rawPayload, setRawPayload] = useState<string>('');
  const [importParty, setImportParty] = useState(true);
  const [importMaps, setImportMaps] = useState(true);
  const [resultMsg, setResultMsg] = useState('');

  function reset() {
    setStatus('idle');
    setError('');
    setPreview(null);
    setRawPayload('');
    setImportParty(true);
    setImportMaps(true);
    setResultMsg('');
  }

  function handleOpenChange(v: boolean) {
    setOpen(v);
    if (v) reset();
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = reader.result as string;
        const payload = parseShareFile(json);
        setRawPayload(json);
        setPreview({
          campaignName: payload.campaignName,
          partyCount: payload.partyMembers.length,
          npcCount: payload.npcs.length,
          imageCount: payload.images.length,
          mapCount: payload.maps?.length ?? 0,
          npcs: payload.npcs,
          maps: payload.maps ?? [],
        });
        setImportParty(payload.partyMembers.length > 0);
        setImportMaps((payload.maps?.length ?? 0) > 0);
        setStatus('preview');
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to read file');
      }
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!campaign || !rawPayload) return;
    setStatus('importing');

    try {
      const payload = parseShareFile(rawPayload);
      // Strip maps from payload if user chose not to import them
      if (!importMaps) payload.maps = [];
      const { partyMembers, npcs, images: newImages, maps: newMaps, result } =
        await importSharePayload(payload, campaignId);

      // Add images to image store (metadata only, blobs already in IndexedDB)
      for (const img of newImages) {
        useImageStore.setState((state) => ({
          images: [...state.images, img],
        }));
      }

      // Add NPCs to store
      for (const npc of npcs) {
        useNpcStore.setState((state) => ({
          npcs: [...state.npcs, npc],
        }));
      }

      // Add maps to store
      if (newMaps.length > 0) {
        useMapStore.setState((state) => ({
          maps: [...state.maps, ...newMaps],
        }));
      }

      // Merge party members if selected
      if (importParty && partyMembers.length > 0) {
        const existing = campaign.partyMembers ?? [];
        updateCampaign(campaignId, {
          partyMembers: [...existing, ...partyMembers],
        });
      }

      const parts: string[] = [];
      if (importParty && result.partyMembersCount > 0) {
        parts.push(`${result.partyMembersCount} party member${result.partyMembersCount !== 1 ? 's' : ''}`);
      }
      if (result.npcsCount > 0) {
        parts.push(`${result.npcsCount} NPC${result.npcsCount !== 1 ? 's' : ''}`);
      }
      if (result.mapsCount > 0) {
        parts.push(`${result.mapsCount} map${result.mapsCount !== 1 ? 's' : ''}`);
      }
      if (result.imagesCount > 0) {
        parts.push(`${result.imagesCount} image${result.imagesCount !== 1 ? 's' : ''}`);
      }
      setResultMsg(`Imported ${parts.join(', ')} from "${preview?.campaignName}".`);
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Import failed');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button variant="outline" size="sm">
              <Upload data-icon="inline-start" />
              Import Shared
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-lg max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Shared Data</DialogTitle>
        </DialogHeader>

        {status === 'idle' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Import party members and NPCs from a share file exported by another GM.
              Data will be added to your current campaign: <span className="font-medium text-foreground">{campaign?.name}</span>.
            </p>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload data-icon="inline-start" />
              Select Share File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        )}

        {status === 'preview' && preview && (
          <div className="space-y-4">
            <div className="rounded-md border p-3 space-y-2">
              <p className="text-sm">
                From campaign: <span className="font-medium">{preview.campaignName}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {preview.partyCount > 0 && (
                  <Badge variant="secondary">{preview.partyCount} party member{preview.partyCount !== 1 ? 's' : ''}</Badge>
                )}
                {preview.npcCount > 0 && (
                  <Badge variant="secondary">{preview.npcCount} NPC{preview.npcCount !== 1 ? 's' : ''}</Badge>
                )}
                {preview.mapCount > 0 && (
                  <Badge variant="secondary">{preview.mapCount} map{preview.mapCount !== 1 ? 's' : ''}</Badge>
                )}
                {preview.imageCount > 0 && (
                  <Badge variant="secondary">{preview.imageCount} image{preview.imageCount !== 1 ? 's' : ''}</Badge>
                )}
              </div>
            </div>

            {/* Party toggle */}
            {preview.partyCount > 0 && (
              <label className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/30">
                <input
                  type="checkbox"
                  checked={importParty}
                  onChange={() => setImportParty(!importParty)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm">Import party members</span>
              </label>
            )}

            {/* NPC preview */}
            {preview.npcs.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">NPCs to import</p>
                <div className="space-y-1 max-h-48 overflow-y-auto rounded-md border p-2">
                  {preview.npcs.map((npc) => (
                    <div key={npc.id} className="flex items-center gap-2 px-2 py-1 text-sm">
                      <span>{npc.name}</span>
                      {npc.role && <span className="text-xs text-muted-foreground">— {npc.role}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Maps toggle */}
            {preview.mapCount > 0 && (
              <label className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/30">
                <input
                  type="checkbox"
                  checked={importMaps}
                  onChange={() => setImportMaps(!importMaps)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <div>
                  <span className="text-sm">Import maps</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({preview.mapCount} map{preview.mapCount !== 1 ? 's' : ''} with pins)
                  </span>
                </div>
              </label>
            )}

            {/* Map preview */}
            {importMaps && preview.maps.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Maps to import</p>
                <div className="space-y-1 max-h-32 overflow-y-auto rounded-md border p-2">
                  {preview.maps.map((m) => (
                    <div key={m.id} className="flex items-center gap-2 px-2 py-1 text-sm">
                      <span>{m.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {m.pins.length} pin{m.pins.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Importing into: <span className="font-medium text-foreground">{campaign?.name}</span>.
              New IDs will be assigned — no existing data will be overwritten.
            </p>
          </div>
        )}

        {status === 'importing' && (
          <p className="text-sm text-muted-foreground">Importing...</p>
        )}

        {status === 'done' && (
          <div className="space-y-3">
            <p className="text-sm text-green-600">{resultMsg}</p>
            <p className="text-xs text-muted-foreground">
              You can close this dialog. The imported data is ready to use.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={reset}>
              Try Again
            </Button>
          </div>
        )}

        {status === 'preview' && (
          <DialogFooter>
            <Button variant="outline" onClick={reset}>Cancel</Button>
            <Button onClick={handleImport}>
              <Download data-icon="inline-start" />
              Import
            </Button>
          </DialogFooter>
        )}

        {status === 'done' && (
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Done</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
