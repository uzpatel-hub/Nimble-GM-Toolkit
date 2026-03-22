import { useState, useEffect } from 'react';
import { getImageBlob } from '@/lib/image-db';

const cache = new Map<string, string>();

/**
 * Load an image dataUri from IndexedDB by key.
 * Returns the dataUri string or null while loading.
 * Results are cached in memory for the lifetime of the app.
 *
 * If `inlineDataUri` is provided (legacy data still on the object),
 * it is returned immediately without hitting IndexedDB.
 */
export function useImageData(
  key: string | undefined | null,
  inlineDataUri?: string
): string | null {
  const [dataUri, setDataUri] = useState<string | null>(() => {
    if (inlineDataUri) return inlineDataUri;
    if (!key) return null;
    return cache.get(key) ?? null;
  });

  useEffect(() => {
    if (inlineDataUri || !key) return;
    if (cache.has(key)) {
      setDataUri(cache.get(key)!);
      return;
    }
    let cancelled = false;
    getImageBlob(key).then((blob) => {
      if (blob && !cancelled) {
        cache.set(key, blob);
        setDataUri(blob);
      }
    });
    return () => { cancelled = true; };
  }, [key, inlineDataUri]);

  return dataUri;
}

/** Preload an image blob into the memory cache */
export function cacheImageData(key: string, dataUri: string) {
  cache.set(key, dataUri);
}
