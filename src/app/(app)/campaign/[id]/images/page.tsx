"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2, ImageIcon, FolderOpen, MonitorPlay, Pencil } from "lucide-react";
import { useImageStore } from "@/stores/image-store";
import { openPresentWindow } from "@/lib/present-window";
import { StoredImg } from "@/components/ui/stored-image";
import type { ImageCategory, StoredImage } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

  const { images, addImage, updateImage, deleteImage } = useImageStore();
  const campaignImages = images.filter((img) => img.campaignId === campaignId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewImageId, setViewImageId] = useState<string | null>(null);
  const viewImage = viewImageId ? campaignImages.find((i) => i.id === viewImageId) : null;
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<ImageCategory>("scene");
  const [newDataUri, setNewDataUri] = useState("");
  const [newSize, setNewSize] = useState(0);

  // Bulk upload state
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkCategory, setBulkCategory] = useState<ImageCategory>("scene");
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  // Edit (name / description / category) state
  const [editImageId, setEditImageId] = useState<string | null>(null);
  const editImage = editImageId ? campaignImages.find((i) => i.id === editImageId) : null;
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState<ImageCategory>("scene");

  // Hydrate the edit form whenever a new image is opened for editing.
  useEffect(() => {
    if (editImage) {
      setEditName(editImage.name);
      setEditDescription(editImage.description ?? "");
      setEditCategory(editImage.category);
    }
  }, [editImageId, editImage]);

  const totalBytes = useMemo(
    () => campaignImages.reduce((sum, img) => sum + img.sizeBytes, 0),
    [campaignImages]
  );

  // Real browser storage quota (origin-wide), refreshed as images change.
  // Falls back to a fixed denominator if the Storage API is unavailable.
  const FALLBACK_QUOTA = 500 * 1024 * 1024;
  const [storage, setStorage] = useState<{ usage: number; quota: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
      navigator.storage
        .estimate()
        .then((est) => {
          if (!cancelled) {
            setStorage({ usage: est.usage ?? 0, quota: est.quota ?? FALLBACK_QUOTA });
          }
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [images.length, totalBytes, FALLBACK_QUOTA]);

  const storageUsed = storage?.usage ?? totalBytes;
  const storageQuota = storage?.quota ?? FALLBACK_QUOTA;
  const storagePct = Math.min((storageUsed / storageQuota) * 100, 100);

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
      description: newDescription.trim() || undefined,
      category: newCategory,
      dataUri: newDataUri,
      sizeBytes: newSize,
    });
    setNewName("");
    setNewDescription("");
    setNewDataUri("");
    setNewSize(0);
    setNewCategory("scene");
    setDialogOpen(false);
  };

  const handleBulkFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) =>
      f.type.startsWith("image/")
    );
    setBulkFiles(files);
  };

  const handleBulkUpload = useCallback(async () => {
    if (bulkFiles.length === 0) return;
    setBulkUploading(true);
    setBulkProgress(0);

    for (let i = 0; i < bulkFiles.length; i++) {
      const file = bulkFiles[i];
      const name = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
      const dataUri = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      addImage({ campaignId, name, category: bulkCategory, dataUri, sizeBytes: file.size });
      setBulkProgress(i + 1);
    }

    setBulkFiles([]);
    setBulkUploading(false);
    setBulkProgress(0);
    setBulkDialogOpen(false);
    // Reset file inputs so the same folder can be re-selected
    if (folderInputRef.current) folderInputRef.current.value = "";
    if (multiFileInputRef.current) multiFileInputRef.current.value = "";
  }, [bulkFiles, bulkCategory, campaignId, addImage]);

  const handleSaveEdit = () => {
    if (!editImageId || !editName.trim()) return;
    updateImage(editImageId, {
      name: editName.trim(),
      description: editDescription.trim() || undefined,
      category: editCategory,
    });
    setEditImageId(null);
  };

  const handlePresent = (imageId: string) => {
    openPresentWindow(`/present?img=${imageId}`);
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
          <ImageCard key={img.id} img={img} onDelete={deleteImage} onView={setViewImageId} onEdit={setEditImageId} onPresent={handlePresent} />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Images"
        description={`Storage: ${formatBytes(totalBytes)}`}
        actions={
          <div className="flex gap-2">
            <Dialog open={bulkDialogOpen} onOpenChange={(open) => { setBulkDialogOpen(open); if (!open) { setBulkFiles([]); setBulkUploading(false); } }}>
              <DialogTrigger
                render={
                  <Button variant="outline">
                    <FolderOpen data-icon="inline-start" />
                    Bulk Upload
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Bulk Upload Images</DialogTitle>
                  <DialogDescription>
                    Select a folder or multiple files to upload all images at once.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Category for all images</Label>
                    <Select
                      value={bulkCategory}
                      onValueChange={(val) => val && setBulkCategory(val as ImageCategory)}
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
                    <Label>Select Folder</Label>
                    {/* @ts-expect-error webkitdirectory is non-standard */}
                    <Input ref={folderInputRef} type="file" accept="image/*" webkitdirectory="" onChange={handleBulkFilesSelected} />
                  </div>
                  <div className="space-y-2">
                    <Label>Or Select Files</Label>
                    <Input ref={multiFileInputRef} type="file" accept="image/*" multiple onChange={handleBulkFilesSelected} />
                  </div>
                  {bulkFiles.length > 0 && (
                    <div className="rounded-md bg-muted p-3 text-sm">
                      <p className="font-medium">{bulkFiles.length} image{bulkFiles.length !== 1 ? "s" : ""} selected</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Total: {formatBytes(bulkFiles.reduce((s, f) => s + f.size, 0))}
                      </p>
                    </div>
                  )}
                  {bulkUploading && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Uploading...</span>
                        <span>{bulkProgress} / {bulkFiles.length}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(bulkProgress / bulkFiles.length) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={handleBulkUpload} disabled={bulkFiles.length === 0 || bulkUploading}>
                    Upload {bulkFiles.length > 0 ? `${bulkFiles.length} Images` : ""}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

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
                    <Label>Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Notes about this image..."
                      rows={2}
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
          </div>
        }
      />

      {/* Storage indicator — reflects real browser storage quota */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Storage Used{storage ? "" : " (this campaign)"}</span>
          <span>
            {formatBytes(storageUsed)} / {formatBytes(storageQuota)}
            {" "}({storagePct.toFixed(storagePct < 1 ? 1 : 0)}%)
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${storagePct}%` }}
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

      {/* Edit Image Dialog — name, description, category */}
      <Dialog open={!!editImageId} onOpenChange={(open) => { if (!open) setEditImageId(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
            <DialogDescription>
              Update the name, description, and category.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Image name"
              />
            </div>
            <div className="space-y-2">
              <Label>Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Notes about this image..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={editCategory}
                onValueChange={(val) => val && setEditCategory(val as ImageCategory)}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditImageId(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {viewImageId && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center cursor-pointer"
          onClick={() => setViewImageId(null)}
        >
          <Button
            variant="secondary"
            className="absolute top-4 right-4 z-10"
            onClick={(e) => { e.stopPropagation(); handlePresent(viewImageId); }}
          >
            <MonitorPlay data-icon="inline-start" />
            Present to Players
          </Button>
          <figure className="flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <StoredImg
              imageId={viewImageId}
              alt={viewImage?.name ?? "Full view"}
              className="max-w-[90vw] max-h-[80vh] object-contain cursor-default"
            />
            {viewImage && (viewImage.name || viewImage.description) && (
              <figcaption className="max-w-[90vw] text-center text-white">
                <p className="text-sm font-medium">{viewImage.name}</p>
                {viewImage.description && (
                  <p className="mt-1 text-xs text-white/70 whitespace-pre-wrap">{viewImage.description}</p>
                )}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </div>
  );
}

function ImageCard({ img, onDelete, onView, onEdit, onPresent }: { img: StoredImage; onDelete: (id: string) => void; onView: (id: string) => void; onEdit: (id: string) => void; onPresent: (id: string) => void }) {
  return (
    <div className="group rounded-md border overflow-hidden bg-card">
      <div className="cursor-pointer relative" onDoubleClick={() => onView(img.id)}>
        <StoredImg imageId={img.id} alt={img.name} className="h-24 w-full object-cover object-top" />
        <Button
          variant="secondary"
          size="icon-xs"
          className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Present to players"
          onClick={(e) => { e.stopPropagation(); onPresent(img.id); }}
        >
          <MonitorPlay />
        </Button>
        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon-xs"
            title="Edit image"
            onClick={(e) => { e.stopPropagation(); onEdit(img.id); }}
          >
            <Pencil />
          </Button>
          <Button
            variant="destructive"
            size="icon-xs"
            title="Delete image"
            onClick={(e) => { e.stopPropagation(); onDelete(img.id); }}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
      <div className="px-2 py-1.5">
        <p className="text-xs font-medium truncate" title={img.name}>{img.name}</p>
        {img.description && (
          <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5" title={img.description}>
            {img.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-0.5">
          <button
            type="button"
            className={`text-[10px] rounded px-1 py-0.5 cursor-pointer hover:ring-1 hover:ring-primary/50 transition-all ${CATEGORY_COLORS[img.category]}`}
            onClick={() => onEdit(img.id)}
            title="Click to edit"
          >
            {CATEGORY_LABELS[img.category]}
          </button>
          <span className="text-[10px] text-muted-foreground">
            {formatBytes(img.sizeBytes)}
          </span>
        </div>
      </div>
    </div>
  );
}
