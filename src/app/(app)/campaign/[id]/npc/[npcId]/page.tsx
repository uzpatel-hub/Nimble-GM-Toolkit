"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Plus, X } from "lucide-react";
import { useNpcStore } from "@/stores/npc-store";
import { useCampaignStore } from "@/stores/campaign-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function NpcDetailPage() {
  const params = useParams<{ id: string; npcId: string }>();
  const router = useRouter();
  const campaignId = params.id;
  const npcId = params.npcId;

  const { npcs, updateNpc, deleteNpc } = useNpcStore();
  const { sessions } = useCampaignStore();
  const campaignSessions = sessions.filter((s) => s.campaignId === campaignId);
  const npc = npcs.find((n) => n.id === npcId && n.campaignId === campaignId);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [personality, setPersonality] = useState("");
  const [notes, setNotes] = useState("");
  const [linkedLocations, setLinkedLocations] = useState<string[]>([]);
  const [linkedSessionIds, setLinkedSessionIds] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState("");
  const [dirty, setDirty] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (npc) {
      setName(npc.name);
      setRole(npc.role);
      setDescription(npc.description);
      setPersonality(npc.personality);
      setNotes(npc.notes);
      setLinkedLocations(npc.linkedLocationNames);
      setLinkedSessionIds(npc.linkedSessionIds);
      setDirty(false);
    }
  }, [npc]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const markDirty = () => setDirty(true);

  const handleSave = () => {
    if (!npc || !name.trim()) return;
    updateNpc(npc.id, {
      name: name.trim(),
      role: role.trim(),
      description,
      personality,
      notes,
      linkedLocationNames: linkedLocations,
      linkedSessionIds,
    });
    setDirty(false);
  };

  const addLocation = () => {
    const loc = newLocation.trim();
    if (!loc || linkedLocations.includes(loc)) return;
    setLinkedLocations([...linkedLocations, loc]);
    setNewLocation("");
    markDirty();
  };

  const removeLocation = (loc: string) => {
    setLinkedLocations(linkedLocations.filter((l) => l !== loc));
    markDirty();
  };

  const toggleSession = (sessionId: string) => {
    if (linkedSessionIds.includes(sessionId)) {
      setLinkedSessionIds(linkedSessionIds.filter((id) => id !== sessionId));
    } else {
      setLinkedSessionIds([...linkedSessionIds, sessionId]);
    }
    markDirty();
  };

  const handleDelete = () => {
    if (!npc) return;
    deleteNpc(npc.id);
    router.push(`/campaign/${campaignId}/npcs`);
  };

  if (!npc) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">NPC not found</p>
        <Button
          variant="link"
          onClick={() => router.push(`/campaign/${campaignId}/npcs`)}
        >
          Back to NPCs
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/campaign/${campaignId}/npcs`)}
        >
          <ArrowLeft data-icon="inline-start" />
          Back to NPCs
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 data-icon="inline-start" />
          Delete
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                markDirty();
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Input
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                markDirty();
              }}
              placeholder="e.g. Merchant, Guard Captain"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                markDirty();
              }}
              placeholder="Physical description, background..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Personality</Label>
            <Textarea
              value={personality}
              onChange={(e) => {
                setPersonality(e.target.value);
                markDirty();
              }}
              placeholder="Personality traits, mannerisms..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                markDirty();
              }}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          {/* Linked Locations */}
          <div className="space-y-2">
            <Label>Linked Locations</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {linkedLocations.map((loc) => (
                <Badge key={loc} variant="secondary" className="gap-1">
                  {loc}
                  <button onClick={() => removeLocation(loc)}>
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
              {linkedLocations.length === 0 && (
                <span className="text-xs text-muted-foreground">None</span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Add location..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLocation();
                  }
                }}
              />
              <Button size="sm" variant="outline" onClick={addLocation}>
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          {/* Linked Sessions */}
          <div className="space-y-2">
            <Label>Linked Sessions</Label>
            <div className="flex flex-wrap gap-2">
              {campaignSessions.length === 0 ? (
                <span className="text-xs text-muted-foreground">
                  No sessions in this campaign
                </span>
              ) : (
                campaignSessions.map((session) => (
                  <Badge
                    key={session.id}
                    variant={
                      linkedSessionIds.includes(session.id)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => toggleSession(session.id)}
                  >
                    #{session.number} {session.title}
                  </Badge>
                ))
              )}
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={!dirty || !name.trim()}>
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
