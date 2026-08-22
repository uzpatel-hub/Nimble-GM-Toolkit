"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { useMapStore } from "@/stores/map-store";
import { useImageStore } from "@/stores/image-store";
import { ImageSelect } from "@/components/ui/image-select";
import { StoredImg } from "@/components/ui/stored-image";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getImageBlob } from "@/lib/image-db";

export default function MapsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const campaignId = params.id;

  const { maps, addMap, deleteMap } = useMapStore();
  const { images } = useImageStore();
  const campaignMaps = maps.filter((m) => m.campaignId === campaignId);

  // Find map-category images that don't already have a map entry
  const mapImageIds = new Set(campaignMaps.map((m) => m.imageId).filter(Boolean));
  const unmappedImages = images.filter(
    (img) => img.campaignId === campaignId && img.category === "map" && !mapImageIds.has(img.id)
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newImageId, setNewImageId] = useState("");

  const handleCreate = async () => {
    if (!newName.trim() || !newImageId) return;
    // Get the dataUri from IndexedDB
    const dataUri = await getImageBlob(`img:${newImageId}`);
    if (!dataUri) return;
    addMap({
      campaignId,
      name: newName.trim(),
      imageDataUri: dataUri,
      imageId: newImageId,
    });
    setNewName("");
    setNewImageId("");
    setDialogOpen(false);
  };

  const handleCreateFromImage = async (imageId: string, imageName: string) => {
    const dataUri = await getImageBlob(`img:${imageId}`);
    if (!dataUri) return;
    addMap({
      campaignId,
      name: imageName,
      imageDataUri: dataUri,
      imageId,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Maps"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button>
                  <Plus data-icon="inline-start" />
                  New Map
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>New Map</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Map name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Image</Label>
                  <ImageSelect
                    campaignId={campaignId}
                    value={newImageId}
                    onChange={setNewImageId}
                    category="map"
                    uploadCategory="map"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={!newName.trim() || !newImageId}>
                  Create Map
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Unlinked map images banner */}
      {unmappedImages.length > 0 && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <p className="text-sm font-medium">
            {unmappedImages.length} uploaded map image{unmappedImages.length !== 1 ? "s" : ""} not yet added as maps
          </p>
          <div className="flex flex-wrap gap-2">
            {unmappedImages.map((img) => (
              <Button
                key={img.id}
                variant="outline"
                size="sm"
                onClick={() => handleCreateFromImage(img.id, img.name)}
              >
                <Plus className="size-3.5 mr-1" />
                {img.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {campaignMaps.length === 0 && unmappedImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <MapPin className="mb-4 size-12 opacity-40" />
          <p className="text-lg font-medium">No maps yet</p>
          <p className="text-sm">Upload a map to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaignMaps.map((map) => (
            <MapCard key={map.id} map={map} campaignId={campaignId} onDelete={deleteMap} onClick={() => router.push(`/campaign/${campaignId}/map/${map.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

function MapCard({ map, campaignId, onDelete, onClick }: {
  map: { id: string; name: string; imageDataUri: string; imageId?: string; pins: { length: number } };
  campaignId: string;
  onDelete: (id: string) => void;
  onClick: () => void;
}) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      {map.imageId ? (
        <StoredImg imageId={map.imageId} alt={map.name} className="h-40 w-full object-cover" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={map.imageDataUri} alt={map.name} className="h-40 w-full object-cover" />
      )}
      <CardHeader>
        <CardTitle>{map.name}</CardTitle>
        <CardAction>
          <Button
            variant="destructive"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(map.id);
            }}
          >
            <Trash2 />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" />
          {map.pins.length} pin{map.pins.length !== 1 ? "s" : ""}
        </div>
      </CardContent>
    </Card>
  );
}
