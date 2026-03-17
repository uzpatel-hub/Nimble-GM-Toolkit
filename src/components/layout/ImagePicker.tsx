'use client';

import { useState, useMemo } from 'react';
import { ImageIcon, X, Maximize2 } from 'lucide-react';
import { useImageStore } from '@/stores/image-store';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { ImageCategory } from '@/types';

const CATEGORIES: ImageCategory[] = ['map', 'npc-portrait', 'scene', 'handout'];

const CATEGORY_LABELS: Record<ImageCategory, string> = {
  map: 'Maps',
  'npc-portrait': 'Portraits',
  scene: 'Scenes',
  handout: 'Handouts',
};

interface ImagePickerProps {
  campaignId: string;
}

export function ImagePicker({ campaignId }: ImagePickerProps) {
  const [open, setOpen] = useState(false);
  const { images } = useImageStore();

  const campaignImages = useMemo(
    () => images.filter((img) => img.campaignId === campaignId),
    [images, campaignId]
  );

  const imagesByCategory = useMemo(() => {
    const grouped: Record<ImageCategory, typeof campaignImages> = {
      map: [],
      'npc-portrait': [],
      scene: [],
      handout: [],
    };
    for (const img of campaignImages) {
      grouped[img.category]?.push(img);
    }
    return grouped;
  }, [campaignImages]);

  // Find the first category that has images for the default tab
  const defaultTab = CATEGORIES.find((c) => imagesByCategory[c].length > 0) ?? 'scene';

  function presentImage(imageId: string) {
    window.open(`/present?img=${imageId}`, '_blank', 'noopener');
  }

  if (campaignImages.length === 0) return null;

  return (
    <>
      {/* Toggle button */}
      <Button
        variant={open ? 'default' : 'outline'}
        size="sm"
        className="gap-2"
        onClick={() => setOpen(!open)}
      >
        <ImageIcon className="size-4" />
        Images
      </Button>

      {/* Floating panel */}
      {open && (
        <div className="fixed bottom-4 right-4 z-50 w-80 max-h-[420px] rounded-lg border bg-popover text-popover-foreground shadow-xl flex flex-col animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b shrink-0">
            <span className="text-sm font-semibold">Present Image</span>
            <Button variant="ghost" size="icon" className="size-6" onClick={() => setOpen(false)}>
              <X className="size-3.5" />
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue={defaultTab} className="flex flex-col flex-1 min-h-0">
            <TabsList className="mx-2 mt-2 shrink-0">
              {CATEGORIES.map((cat) => (
                <TabsTrigger key={cat} value={cat} disabled={imagesByCategory[cat].length === 0} className="text-xs">
                  {CATEGORY_LABELS[cat]}
                  {imagesByCategory[cat].length > 0 && (
                    <span className="ml-1 text-[10px] text-muted-foreground">
                      {imagesByCategory[cat].length}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {CATEGORIES.map((cat) => (
              <TabsContent key={cat} value={cat} className="flex-1 overflow-y-auto px-2 pb-2 mt-0">
                {imagesByCategory[cat].length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No {CATEGORY_LABELS[cat].toLowerCase()} uploaded
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5 pt-2">
                    {imagesByCategory[cat].map((img) => (
                      <button
                        key={img.id}
                        onClick={() => presentImage(img.id)}
                        className="group relative aspect-square rounded overflow-hidden border hover:border-primary transition-colors cursor-pointer"
                        title={img.name}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.dataUri}
                          alt={img.name}
                          className="size-full object-cover"
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                          <Maximize2 className="size-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {/* Name label */}
                        <div className="absolute bottom-0 inset-x-0 bg-black/70 px-1 py-0.5">
                          <p className="text-[10px] text-white truncate">{img.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </>
  );
}
