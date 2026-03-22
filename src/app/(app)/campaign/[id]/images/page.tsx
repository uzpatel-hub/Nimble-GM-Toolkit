"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2, ImageIcon } from "lucide-react";
import { useImageStore } from "@/stores/image-store";
import { StoredImg } from "@/components/ui/stored-image";
import type { ImageCategory, StoredImage } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const CATEGORIES: ImageCategory[] = ["map", "npc-portrait", "player-portrait", "scene", "handout"];

const CATEGORY_LABELS: Record<ImageCategory, string> = {
  map: "Maps",
  "npc-portrait": "NPC Portraits",
  "player-portrait": "Player Portraits",
  scene: "Scenes",
  handout: "Handouts",
};

const CATEGORY_COLORS: Record<ImageCategory, string> = {
  map: "bg-blue-500/10 text-blue-600",
  "npc-portrait": "bg-green-500/10 text-green-600",
  "player-portrait": "bg-cyan-500/10 text-cyan-600",
  scene: "bg-purple-500/10 text-purple-600",
  handout: "bg-orange-500/10 text-orange-600",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImagesPage() {
  const params = useParams<{ id: string }>();
  const campaignId = params.id;

  const { images, addImage, deleteImage } = useImageStore();
  const campaignImages = images.filter((img) => img.campaignId === campaignId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewImageId, setViewImageId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<ImageCategory>("scene");
  const [newDataUri, setNewDataUri] = useState("");
  const [newSize, setNewSize] = useState(0);

  const totalBytes = useMemo(
    () => campaignImages.reduce((sum, img) => sum + img.sizeBytes, 0),
    [campaignImages]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewSize(file.size);
    const reader = new FileReader();
    reader.onload = () => {
      setNewDataUri(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!newName.trim() || !newDataUri) return;
    addImage({
      campaignId,
      name: newName.trim(),
      category: newCategory,
      dataUri: newDataUri,
      sizeBytes: newSize,
    });
    setNewName("");
    setNewDataUri("");
    setNewSize(0);
    setNewCategory("scene");
    setDialogOpen(false);
  };

  const renderImageGrid = (imgs: typeof campaignImages) => {
    if (imgs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <ImageIcon className="mb-3 size-10 opacity-40" />
          <p className="text-sm">No images in this category.</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {imgs.map((img) => (
          <ImageCard key={img.id} img={img} onDelete={deleteImage} onView={setViewImageId} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Images"
        description={`Storage: ${formatBytes(totalBytes)}`}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button>
                  <Plus data-icon="inline-start" />
                  Upload Image
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Image</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Image name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newCategory}
                    onValueChange={(val) => val && setNewCategory(val as ImageCategory)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {CATEGORY_LABELS[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>File</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {newDataUri && (
                    <div className="space-y-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={newDataUri}
                        alt="Preview"
                        className="mt-2 h-32 w-full rounded-md object-cover object-top"
                      />
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(newSize)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleUpload}
                  disabled={!newName.trim() || !newDataUri}
                >
                  Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Storage indicator */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Storage Used</span>
          <span>{formatBytes(totalBytes)}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${Math.min((totalBytes / (50 * 1024 * 1024)) * 100, 100)}%`,
            }}
          />
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({campaignImages.length})</TabsTrigger>
          {CATEGORIES.map((cat) => {
            const count = campaignImages.filter((i) => i.category === cat).length;
            return (
              <TabsTrigger key={cat} value={cat}>
                {CATEGORY_LABELS[cat]} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {renderImageGrid(campaignImages)}
        </TabsContent>

        {CATEGORIES.map((cat) => (
          <TabsContent key={cat} value={cat} className="mt-4">
            {renderImageGrid(campaignImages.filter((i) => i.category === cat))}
          </TabsContent>
        ))}
      </Tabs>

      {/* Lightbox */}
      {viewImageId && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center cursor-pointer"
          onClick={() => setViewImageId(null)}
        >
          <StoredImg
            imageId={viewImageId}
            alt="Full view"
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
        </div>
      )}
    </div>
  );
}

function ImageCard({ img, onDelete, onView }: { img: StoredImage; onDelete: (id: string) => void; onView: (id: string) => void }) {
  return (
    <div className="group rounded-md border overflow-hidden bg-card">
      <div className="cursor-pointer relative" onDoubleClick={() => onView(img.id)}>
        <StoredImg imageId={img.id} alt={img.name} className="h-24 w-full object-cover object-top" />
        <Button
          variant="destructive"
          size="icon-xs"
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => { e.stopPropagation(); onDelete(img.id); }}
        >
          <Trash2 />
        </Button>
      </div>
      <div className="px-2 py-1.5">
        <p className="text-xs font-medium truncate" title={img.name}>{img.name}</p>
        <div className="flex items-center justify-between mt-0.5">
          <span className={`text-[10px] ${CATEGORY_COLORS[img.category]}`}>
            {CATEGORY_LABELS[img.category]}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatBytes(img.sizeBytes)}
          </span>
        </div>
      </div>
    </div>
  );
}
