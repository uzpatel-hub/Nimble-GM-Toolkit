'use client';

import { useEffect, useState } from 'react';
import { PRESENT_CHANNEL } from '@/lib/present-window';

export interface PresentStatus {
  imageId: string | null;
  mapId: string | null;
  showPins: boolean;
  name: string;
}

/**
 * Subscribes to the present window's broadcasts and returns what it is
 * currently showing players, or null when nothing is being presented.
 *
 * On mount it asks any already-open present window to report its state,
 * so the indicator survives a GM-side page reload.
 */
export function usePresentStatus(): PresentStatus | null {
  const [status, setStatus] = useState<PresentStatus | null>(null);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const ch = new BroadcastChannel(PRESENT_CHANNEL);

    ch.onmessage = (e) => {
      const msg = e.data;
      if (!msg || typeof msg !== 'object') return;
      if (msg.type === 'present:state') {
        setStatus({
          imageId: msg.imageId ?? null,
          mapId: msg.mapId ?? null,
          showPins: !!msg.showPins,
          name: msg.name ?? '',
        });
      } else if (msg.type === 'present:closed') {
        setStatus(null);
      }
    };

    // Ask any open present window to (re)announce its current state.
    ch.postMessage({ type: 'present:query' });

    return () => ch.close();
  }, []);

  return status;
}
