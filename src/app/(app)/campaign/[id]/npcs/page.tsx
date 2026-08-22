"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Trash2, Search, Users } from "lucide-react";
import { useNpcStore } from "@/stores/npc-store";
import { StoredImg } from "@/components/ui/stored-image";
import { ImageSelect } from "@/components/ui/image-select";
import { ShareExportDialog, ShareImportDialog } from "@/components/share/ShareExportImport";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function NpcsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const campaignId = params.id;

  const { npcs, addNpc, deleteNpc } = useNpcStore();
  const campaignNpcs = npcs.filter((n) => n.campaignId === campaignId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // New NPC form
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPersonality, setNewPersonality] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newImageId, setNewImageId] = useState("");

  const filteredNpcs = useMemo(() => {
    if (!searchQuery) return campaignNpcs;
    const q = searchQuery.toLowerCase();
    return campaignNpcs.filter(
      (n) =>
        n.name.toLowerCase().includes(q) || n.role.toLowerCase().includes(q)
    );
  }, [campaignNpcs, searchQuery]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = addNpc({
      campaignId,
      name: newName.trim(),
      role: newRole.trim(),
      description: newDescription,
      personality: newPersonality,
      notes: newNotes,
      imageId: newImageId || undefined,
      linkedLocationNames: [],
      linkedSessionIds: [],
    });
    setNewName("");
    setNewRole("");
    setNewDescription("");
    setNewPersonality("");
    setNewNotes("");
    setNewImageId("");
    setDialogOpen(false);
    router.push(`/campaign/${campaignId}/npc/${id}`);
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="NPCs"
        actions={
          <div className="flex gap-2">
            <ShareImportDialog campaignId={campaignId} />
            <ShareExportDialog campaignId={campaignId} />
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger
                render={
                  <Button>
                    <Plus data-icon="inline-start" />
                    New NPC
                  </Button>
                }
              />
            <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New NPC</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="NPC name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="e.g. Merchant, Guard Captain"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Physical description, background..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Personality</Label>
                  <Textarea
                    value={newPersonality}
                    onChange={(e) => setNewPersonality(e.target.value)}
                    placeholder="Personality traits, mannerisms..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Additional notes"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Portrait</Label>
                  <ImageSelect
                    campaignId={campaignId}
                    value={newImageId}
                    onChange={setNewImageId}
                    uploadCategory="npc-portrait"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={!newName.trim()}>
                  Create NPC
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        }
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search NPCs by name..."
          className="pl-8"
        />
      </div>

      {filteredNpcs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Users className="mb-4 size-12 opacity-40" />
          <p className="text-lg font-medium">
            {searchQuery ? "No NPCs match your search" : "No NPCs yet"}
          </p>
          {!searchQuery && <p className="text-sm">Create an NPC to get started.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNpcs.map((npc) => (
            <NpcCard
              key={npc.id}
              npc={npc}
              campaignId={campaignId}
              onDelete={deleteNpc}
              onClick={() => router.push(`/campaign/${campaignId}/npc/${npc.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NpcCard({
  npc,
  campaignId,
  onDelete,
  onClick,
}: {
  npc: { id: string; name: string; role: string; description: string; imageId?: string };
  campaignId: string;
  onDelete: (id: string) => void;
  onClick: () => void;
}) {
  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md overflow-hidden" onClick={onClick}>
      {npc.imageId && (
        <StoredImg imageId={npc.imageId} alt={npc.name} className="h-32 w-full object-cover object-top" />
      )}
      <CardHeader>
        <CardTitle>{npc.name}</CardTitle>
        <CardDescription>{npc.role}</CardDescription>
        <CardAction>
          <Button
            variant="destructive"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(npc.id);
            }}
          >
            <Trash2 />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {npc.description || "No description"}
        </p>
      </CardContent>
    </Card>
  );
}
