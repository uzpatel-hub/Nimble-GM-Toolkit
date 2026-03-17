"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2, Search, Link2 } from "lucide-react";
import { useNotesStore } from "@/stores/notes-store";
import type { NoteView, NoteTag, StoryNote } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardAction } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

const ALL_TAGS: NoteTag[] = ["npc", "plot-hook", "secret", "lore", "encounter", "treasure"];

const TAG_COLORS: Record<NoteTag, string> = {
  npc: "bg-green-500/10 text-green-600",
  "plot-hook": "bg-blue-500/10 text-blue-600",
  secret: "bg-red-500/10 text-red-600",
  lore: "bg-purple-500/10 text-purple-600",
  encounter: "bg-orange-500/10 text-orange-600",
  treasure: "bg-yellow-500/10 text-yellow-600",
};

export default function StoryPage() {
  const params = useParams<{ id: string }>();
  const campaignId = params.id;

  const { notes, addNote, updateNote, deleteNote } = useNotesStore();
  const campaignNotes = notes.filter((n) => n.campaignId === campaignId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTags, setFilterTags] = useState<NoteTag[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // New note form state
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newView, setNewView] = useState<NoteView>("location");
  const [newLocationName, setNewLocationName] = useState("");
  const [newSessionNumber, setNewSessionNumber] = useState("");
  const [newTags, setNewTags] = useState<NoteTag[]>([]);

  // Edit state
  const [editingNote, setEditingNote] = useState<StoryNote | null>(null);

  const toggleTag = (tag: NoteTag, current: NoteTag[], setter: (tags: NoteTag[]) => void) => {
    setter(current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]);
  };

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    addNote({
      campaignId,
      title: newTitle.trim(),
      content: newContent,
      view: newView,
      locationName: newView === "location" ? newLocationName : undefined,
      sessionNumber: newView === "timeline" ? Number(newSessionNumber) || undefined : undefined,
      tags: newTags,
      linkedNoteIds: [],
    });
    setNewTitle("");
    setNewContent("");
    setNewView("location");
    setNewLocationName("");
    setNewSessionNumber("");
    setNewTags([]);
    setDialogOpen(false);
  };

  const handleSaveEdit = () => {
    if (!editingNote) return;
    updateNote(editingNote.id, {
      title: editingNote.title,
      content: editingNote.content,
      tags: editingNote.tags,
      locationName: editingNote.locationName,
      sessionNumber: editingNote.sessionNumber,
    });
    setEditingNote(null);
    setExpandedId(null);
  };

  const filteredNotes = useMemo(() => {
    return campaignNotes.filter((n) => {
      const matchesSearch =
        !searchQuery ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTags =
        filterTags.length === 0 || filterTags.some((t) => n.tags.includes(t));
      return matchesSearch && matchesTags;
    });
  }, [campaignNotes, searchQuery, filterTags]);

  const locationNotes = filteredNotes.filter((n) => n.view === "location");
  const timelineNotes = filteredNotes.filter((n) => n.view === "timeline");

  const renderNoteCard = (note: StoryNote) => {
    const isExpanded = expandedId === note.id;
    const isEditing = editingNote?.id === note.id;
    const linkedNotes = note.linkedNoteIds
      .map((lid) => campaignNotes.find((n) => n.id === lid))
      .filter(Boolean);

    return (
      <Card key={note.id} size="sm">
        <CardHeader>
          <CardTitle
            className="cursor-pointer"
            onClick={() => {
              if (isExpanded) {
                setExpandedId(null);
                setEditingNote(null);
              } else {
                setExpandedId(note.id);
                setEditingNote({ ...note });
              }
            }}
          >
            {isEditing ? (
              <Input
                value={editingNote.title}
                onChange={(e) =>
                  setEditingNote({ ...editingNote, title: e.target.value })
                }
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              note.title
            )}
          </CardTitle>
          <CardAction>
            <Button
              variant="destructive"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation();
                deleteNote(note.id);
              }}
            >
              <Trash2 />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1 mb-2">
            {note.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className={TAG_COLORS[tag]}>
                {tag}
              </Badge>
            ))}
          </div>
          {note.view === "location" && note.locationName && (
            <p className="text-xs text-muted-foreground mb-1">
              Location: {note.locationName}
            </p>
          )}
          {note.view === "timeline" && note.sessionNumber != null && (
            <p className="text-xs text-muted-foreground mb-1">
              Session #{note.sessionNumber}
            </p>
          )}
          {isExpanded && isEditing ? (
            <div className="space-y-3 mt-2">
              <Textarea
                value={editingNote!.content}
                onChange={(e) =>
                  setEditingNote({ ...editingNote!, content: e.target.value })
                }
                rows={6}
              />
              <div className="space-y-1">
                <Label className="text-xs">Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {ALL_TAGS.map((tag) => (
                    <label key={tag} className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={editingNote!.tags.includes(tag)}
                        onChange={() =>
                          toggleTag(tag, editingNote!.tags, (tags) =>
                            setEditingNote({ ...editingNote!, tags })
                          )
                        }
                      />
                      {tag}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setExpandedId(null);
                    setEditingNote(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {note.content}
            </p>
          )}
          {linkedNotes.length > 0 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Link2 className="size-3" />
              Linked:
              {linkedNotes.map((ln) => (
                <Badge
                  key={ln!.id}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => {
                    setExpandedId(ln!.id);
                    setEditingNote({ ...ln! });
                  }}
                >
                  {ln!.title}
                </Badge>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {new Date(note.updatedAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Story Notes"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button>
                  <Plus data-icon="inline-start" />
                  New Note
                </Button>
              }
            />
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>New Story Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Note title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Note content"
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>View Type</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-sm">
                      <input
                        type="radio"
                        name="viewType"
                        checked={newView === "location"}
                        onChange={() => setNewView("location")}
                      />
                      By Location
                    </label>
                    <label className="flex items-center gap-1.5 text-sm">
                      <input
                        type="radio"
                        name="viewType"
                        checked={newView === "timeline"}
                        onChange={() => setNewView("timeline")}
                      />
                      By Timeline
                    </label>
                  </div>
                </div>
                {newView === "location" && (
                  <div className="space-y-2">
                    <Label>Location Name</Label>
                    <Input
                      value={newLocationName}
                      onChange={(e) => setNewLocationName(e.target.value)}
                      placeholder="Location name"
                    />
                  </div>
                )}
                {newView === "timeline" && (
                  <div className="space-y-2">
                    <Label>Session Number</Label>
                    <Input
                      type="number"
                      value={newSessionNumber}
                      onChange={(e) => setNewSessionNumber(e.target.value)}
                      placeholder="Session number"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-3">
                    {ALL_TAGS.map((tag) => (
                      <label key={tag} className="flex items-center gap-1.5 text-sm">
                        <input
                          type="checkbox"
                          checked={newTags.includes(tag)}
                          onChange={() => toggleTag(tag, newTags, setNewTags)}
                        />
                        {tag}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={!newTitle.trim()}>
                  Create Note
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Search & Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map((tag) => (
            <Badge
              key={tag}
              variant={filterTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleTag(tag, filterTags, setFilterTags)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <Tabs defaultValue="location">
        <TabsList>
          <TabsTrigger value="location">
            By Location ({locationNotes.length})
          </TabsTrigger>
          <TabsTrigger value="timeline">
            By Timeline ({timelineNotes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="location">
          {locationNotes.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No location notes yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
              {locationNotes.map(renderNoteCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline">
          {timelineNotes.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No timeline notes yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
              {timelineNotes
                .sort((a, b) => (a.sessionNumber ?? 0) - (b.sessionNumber ?? 0))
                .map(renderNoteCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
