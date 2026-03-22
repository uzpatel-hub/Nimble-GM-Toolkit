'use client';

import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { useImageStore } from '@/stores/image-store';
import { StoredImg } from '@/components/ui/stored-image';
import { Button } from '@/components/ui/button';
import type { ImageCategory } from '@/types';

interface ImageSelectProps {
  campaignId: string;
  /** Currently selected image ID (empty string or undefined = none) */
  value: string;
  onChange: (imageId: string) => void;
  /** Filter to a specific category, or show all if not set */
  category?: ImageCategory;
  /** Label for the upload button context */
  uploadCategory?: ImageCategory;
  /** Show a preview of the selected image */
  showPreview?: boolean;
  /** Class for the preview image */
  previewClassName?: string;
}

/**
 * Unified image selector: pick from existing uploads or upload a new image.
 */
export function ImageSelect({
  campaignId,
  value,
  onChange,
  category,
  uploadCategory,
  showPreview = true,
  previewClassName = 'h-24 w-full rounded-md object-cover object-top',
}: ImageSelectProps) {
  const { images, addImage } = useImageStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const filteredImages = category
    ? images.filter((img) => img.campaignId === campaignId && img.category === category)
    : images.filter((img) => img.campaignId === campaignId);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      const id = addImage({
        campaignId,
        name: file.name.replace(/\.[^.]+$/, ''),
        category: uploadCategory ?? category ?? 'scene',
        dataUri,
        sizeBytes: file.size,
      });
      onChange(id);
      setUploading(false);
    };
    reader.readAsDataURL(file);
    // Reset so same file can be re-selected
    e.target.value = '';
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">None</option>
          {filteredImages.map((img) => (
            <option key={img.id} value={img.id}>
              {img.name}{!category && ` (${img.category})`}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="size-3.5" />
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
      {showPreview && value && (
        <StoredImg imageId={value} alt="Selected image" className={previewClassName} />
      )}
    </div>
  );
}
