'use client';

import { Monitor, X, ExternalLink } from 'lucide-react';
import { usePresentStatus } from '@/hooks/use-present-status';
import { useImageStore } from '@/stores/image-store';
import { useMapStore } from '@/stores/map-store';
import { useImageData } from '@/hooks/use-image-data';
import { focusPresentWindow, closePresentWindow } from '@/lib/present-window';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Floating card shown in the GM app while a present window is open,
 * mirroring exactly what players are currently seeing.
 */
export function PresentIndicator() {
  const status = usePresentStatus();
  const { images } = useImageStore();
  const { maps } = useMapStore();

  const image = status?.imageId ? images.find((i) => i.id === status.imageId) : null;
  const map = status?.mapId ? maps.find((m) => m.id === status.mapId) : null;

  // Mirror the present page's image resolution exactly.
  const imageBlob = useImageData(
    status?.imageId ? `img:${status.imageId}` : null,
    image?.dataUri || undefined
  );
  const src = imageBlob ?? map?.imageDataUri ?? null;

  if (!status) return null;

  const name = status.name || image?.name || map?.name || 'Presenting';

  return (
    <div className="fixed bottom-4 right-4 z-50 w-60 overflow-hidden rounded-lg border bg-card/95 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b">
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex size-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-red-500" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
            Players are seeing
          </span>
        </div>
        <button
          onClick={closePresentWindow}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          aria-label="Stop presenting"
          title="Stop presenting"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="relative aspect-video bg-black flex items-center justify-center">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} className="max-w-full max-h-full object-contain" />
        ) : (
          <Monitor className="size-8 text-white/30" />
        )}
      </div>

      <div className="flex items-center gap-2 px-3 py-2">
        <span className="text-sm truncate flex-1" title={name}>
          {name}
        </span>
        {status.showPins && (
          <Badge variant="secondary" className="text-xs shrink-0">
            pins
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2 px-3 pb-3">
        <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={focusPresentWindow}>
          <ExternalLink data-icon="inline-start" />
          Focus
        </Button>
        <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={closePresentWindow}>
          <X data-icon="inline-start" />
          Stop
        </Button>
      </div>
    </div>
  );
}
