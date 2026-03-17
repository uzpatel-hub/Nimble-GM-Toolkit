"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { useMapStore } from "@/stores/map-store";
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

export default function MapsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const campaignId = params.id;

  const { maps, addMap, deleteMap } = useMapStore();
  const campaignMaps = maps.filter((m) => m.campaignId === campaignId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setNewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!newName.trim() || !newImage) return;
    addMap({
      campaignId,
      name: newName.trim(),
      imageDataUri: newImage,
    });
    setNewName("");
    setNewImage("");
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maps"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button>
                  <Plus data-icon="inline-start" />
                  Upload Map
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Map</DialogTitle>
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
                  <Input type="file" accept="image/*" onChange={handleFileChange} />
                  {newImage && (
                    <img
                      src={newImage}
                      alt="Preview"
                      className="mt-2 h-32 w-full rounded-md object-cover"
                    />
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUpload} disabled={!newName.trim() || !newImage}>
                  Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {campaignMaps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <MapPin className="mb-4 size-12 opacity-40" />
          <p className="text-lg font-medium">No maps yet</p>
          <p className="text-sm">Upload a map to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaignMaps.map((map) => (
            <Card
              key={map.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/campaign/${campaignId}/map/${map.id}`)}
            >
              <img
                src={map.imageDataUri}
                alt={map.name}
                className="h-40 w-full object-cover"
              />
              <CardHeader>
                <CardTitle>{map.name}</CardTitle>
                <CardAction>
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMap(map.id);
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
          ))}
        </div>
      )}
    </div>
  );
}
