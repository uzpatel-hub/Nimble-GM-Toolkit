'use client';

import { useImageData } from '@/hooks/use-image-data';

interface StoredImageProps {
  imageId: string;
  alt: string;
  className?: string;
  inlineDataUri?: string;
  draggable?: boolean;
  onLoad?: () => void;
  imgRef?: React.Ref<HTMLImageElement>;
}

/**
 * Renders an image whose dataUri lives in IndexedDB.
 * Shows a placeholder while loading.
 */
export function StoredImg({
  imageId,
  alt,
  className,
  inlineDataUri,
  draggable,
  onLoad,
  imgRef,
}: StoredImageProps) {
  const src = useImageData(`img:${imageId}`, inlineDataUri);

  if (!src) {
    return (
      <div className={`bg-muted animate-pulse ${className ?? ''}`} />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={className}
      draggable={draggable}
      onLoad={onLoad}
    />
  );
}
