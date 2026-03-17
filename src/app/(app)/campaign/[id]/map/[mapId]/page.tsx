"use client";

import { useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  User,
  Swords,
  Gem,
  FileText,
  Trash2,
  X,
  CheckCircle2,
  Link as LinkIcon,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  Monitor,
  Eye,
  EyeOff,
} from "lucide-react";
import { useMapStore } from "@/stores/map-store";
import { useCampaignStore } from "@/stores/campaign-store";
import type { PinType, MapPin as MapPinType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const PIN_ICONS: Record<PinType, { icon: typeof MapPin; color: string }> = {
  location: { icon: MapPin, color: "text-blue-500" },
  npc: { icon: User, color: "text-green-500" },
  encounter: { icon: Swords, color: "text-red-500" },
  loot: { icon: Gem, color: "text-yellow-500" },
  note: { icon: FileText, color: "text-purple-500" },
};

const PIN_TYPES: PinType[] = ["location", "npc", "encounter", "loot", "note"];

export default function MapViewerPage() {
  const params = useParams<{ id: string; mapId: string }>();
  const router = useRouter();
  const campaignId = params.id;
  const mapId = params.mapId;

  const { maps, addPin, updatePin, deletePin } = useMapStore();
  const map = maps.find((m) => m.id === mapId && m.campaignId === campaignId);
  const sessions = useCampaignStore((s) => s.sessions).filter(
    (s) => s.campaignId === campaignId
  );

  // Pan & zoom state
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Pin creation dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [clickPos, setClickPos] = useState({ x: 0, y: 0 });
  const [pinTitle, setPinTitle] = useState("");
  const [pinDesc, setPinDesc] = useState("");
  const [pinType, setPinType] = useState<PinType>("location");
  const [pinLinkedSessionId, setPinLinkedSessionId] = useState("");
  const [pinShowToPlayers, setPinShowToPlayers] = useState(false);

  // Pin detail panel
  const [selectedPin, setSelectedPin] = useState<MapPinType | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editType, setEditType] = useState<PinType>("location");
  const [editVisited, setEditVisited] = useState(false);
  const [editShowToPlayers, setEditShowToPlayers] = useState(false);
  const [editLinkedSessionId, setEditLinkedSessionId] = useState("");

  // Track mouse movement to distinguish click from drag
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.min(5, Math.max(0.25, s - e.deltaY * 0.001)));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    mouseDownPos.current = { x: e.clientX, y: e.clientY };
    setIsPanning(true);
    setPanStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setTranslate({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsPanning(false);
    if (!mouseDownPos.current) return;
    const dx = Math.abs(e.clientX - mouseDownPos.current.x);
    const dy = Math.abs(e.clientY - mouseDownPos.current.y);
    // Only treat as click if mouse barely moved
    if (dx < 5 && dy < 5) {
      handleMapClick(e);
    }
    mouseDownPos.current = null;
  };

  const handleMapClick = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (x < 0 || x > 100 || y < 0 || y > 100) return;
    setClickPos({ x, y });
    setPinTitle("");
    setPinDesc("");
    setPinType("location");
    setPinLinkedSessionId("");
    setPinShowToPlayers(false);
    setAddDialogOpen(true);
  };

  const handleAddPin = () => {
    if (!pinTitle.trim()) return;
    addPin(mapId, {
      mapId,
      x: clickPos.x,
      y: clickPos.y,
      title: pinTitle.trim(),
      description: pinDesc,
      pinType: pinType,
      showToPlayers: pinShowToPlayers,
      linkedSessionId: pinLinkedSessionId || undefined,
    });
    setAddDialogOpen(false);
  };

  const handleSelectPin = (pin: MapPinType, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPin(pin);
    setEditTitle(pin.title);
    setEditDesc(pin.description);
    setEditType(pin.pinType);
    setEditVisited(pin.visited ?? false);
    setEditShowToPlayers(pin.showToPlayers ?? false);
    setEditLinkedSessionId(pin.linkedSessionId ?? "");
  };

  const handleUpdatePin = () => {
    if (!selectedPin || !editTitle.trim()) return;
    updatePin(mapId, selectedPin.id, {
      title: editTitle.trim(),
      description: editDesc,
      pinType: editType,
      visited: editVisited,
      showToPlayers: editShowToPlayers,
      linkedSessionId: editLinkedSessionId || undefined,
    });
    setSelectedPin(null);
  };

  const handleDeletePin = (pinId: string) => {
    deletePin(mapId, pinId);
    if (selectedPin?.id === pinId) setSelectedPin(null);
  };

  const handleFitToScreen = useCallback(() => {
    if (!containerRef.current || !imageRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    const img = imageRef.current;
    const scaleX = container.width / img.naturalWidth;
    const scaleY = container.height / img.naturalHeight;
    const fitScale = Math.min(scaleX, scaleY, 1);
    const offsetX = (container.width - img.naturalWidth * fitScale) / 2;
    const offsetY = (container.height - img.naturalHeight * fitScale) / 2;
    setScale(fitScale);
    setTranslate({ x: offsetX, y: offsetY });
  }, []);

  const handleResetZoom = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  const handlePresentToPlayers = useCallback((withPins: boolean) => {
    const url = withPins ? `/present?map=${mapId}&pins=1` : `/present?map=${mapId}`;
    window.open(url, '_blank', 'popup=true');
  }, [mapId]);

  if (!map) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">Map not found</p>
        <Button
          variant="link"
          onClick={() => router.push(`/campaign/${campaignId}/maps`)}
        >
          Back to Maps
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/campaign/${campaignId}/maps`)}
        >
          <ArrowLeft data-icon="inline-start" />
          Back
        </Button>
        <span className="text-sm font-medium">{map.name}</span>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setScale((s) => Math.min(5, s * 1.25))}
            title="Zoom in"
          >
            <ZoomIn className="size-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setScale((s) => Math.max(0.25, s / 1.25))}
            title="Zoom out"
          >
            <ZoomOut className="size-4" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleFitToScreen}
            title="Fit to screen"
          >
            <Maximize className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleResetZoom}
            title="Reset zoom"
          >
            <RotateCcw className="size-4" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresentToPlayers(false)}
            title="Show map only"
          >
            <Monitor className="size-4 mr-1" />
            Present Map
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresentToPlayers(true)}
            title="Show map with visible pins and descriptions"
          >
            <Eye className="size-4 mr-1" />
            Present with Pins
          </Button>
        </div>
      </div>

      {/* Map container */}
      <div
        ref={containerRef}
        className="relative flex-1 cursor-grab overflow-hidden bg-muted/30 active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsPanning(false)}
        onWheel={handleWheel}
      >
        <div
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
          className="relative inline-block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            src={map.imageDataUri}
            alt={map.name}
            className="pointer-events-none max-w-none select-none"
            draggable={false}
          />

          {/* Pins */}
          {map.pins.map((pin) => {
            const { icon: Icon, color } = PIN_ICONS[pin.pinType];
            return (
              <button
                key={pin.id}
                className={`absolute -translate-x-1/2 -translate-y-full cursor-pointer transition-transform hover:scale-125 ${
                  pin.visited ? 'opacity-50' : ''
                } ${color}`}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                onClick={(e) => handleSelectPin(pin, e)}
                onMouseDown={(e) => e.stopPropagation()}
                title={`${pin.title}${pin.visited ? ' (Visited)' : ''}`}
              >
                <Icon className="size-6 drop-shadow-md" />
                {pin.visited && (
                  <CheckCircle2 className="absolute -top-1 -right-1 size-3 text-green-400 drop-shadow-md" />
                )}
                {pin.linkedSessionId && (
                  <LinkIcon className="absolute -bottom-1 -right-1 size-3 text-orange-400 drop-shadow-md" />
                )}
                {pin.showToPlayers && (
                  <Eye className="absolute -top-1 -left-1 size-3 text-cyan-400 drop-shadow-md" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Pin Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Pin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={pinTitle}
                onChange={(e) => setPinTitle(e.target.value)}
                placeholder="Pin title"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={pinDesc}
                onChange={(e) => setPinDesc(e.target.value)}
                placeholder="Description (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={pinType} onValueChange={(val) => val && setPinType(val as PinType)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PIN_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Link Session (optional)</Label>
              <Select
                value={pinLinkedSessionId}
                onValueChange={(val) => setPinLinkedSessionId(!val || val === "_none" ? "" : val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="No session linked" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">None</SelectItem>
                  {sessions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      Session {s.number}: {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setPinShowToPlayers(!pinShowToPlayers)}
                className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                  pinShowToPlayers
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-400'
                    : 'bg-background border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {pinShowToPlayers ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                {pinShowToPlayers ? 'Visible to players' : 'Hidden from players'}
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddPin} disabled={!pinTitle.trim()}>
              Add Pin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pin Detail Panel */}
      {selectedPin && (
        <div className="absolute right-4 top-20 z-50 w-80 rounded-xl border bg-background p-4 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium">Pin Details</h3>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSelectedPin(null)}
            >
              <X />
            </Button>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={editType} onValueChange={(val) => val && setEditType(val as PinType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PIN_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Link Session</Label>
              <Select
                value={editLinkedSessionId}
                onValueChange={(val) => setEditLinkedSessionId(!val || val === "_none" ? "" : val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="No session linked" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">None</SelectItem>
                  {sessions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      Session {s.number}: {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editLinkedSessionId && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-6 px-0 text-xs"
                  onClick={() =>
                    router.push(
                      `/campaign/${campaignId}/session/${editLinkedSessionId}`
                    )
                  }
                >
                  <ExternalLink className="size-3 mr-1" />
                  Go to Session
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setEditVisited(!editVisited)}
                className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                  editVisited
                    ? 'bg-green-500/15 border-green-500/50 text-green-400'
                    : 'bg-background border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <CheckCircle2 className="size-3.5" />
                {editVisited ? 'Visited' : 'Not visited'}
              </button>
              <button
                type="button"
                onClick={() => setEditShowToPlayers(!editShowToPlayers)}
                className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                  editShowToPlayers
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-400'
                    : 'bg-background border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {editShowToPlayers ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                {editShowToPlayers ? 'Visible to players' : 'Hidden from players'}
              </button>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleUpdatePin}>
                Save
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeletePin(selectedPin.id)}
              >
                <Trash2 data-icon="inline-start" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
