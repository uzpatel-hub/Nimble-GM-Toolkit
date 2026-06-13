'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCampaignStore } from '@/stores/campaign-store';
import { useEncounterStore } from '@/stores/encounter-store';
import { useMapStore } from '@/stores/map-store';
import { useTreasureStore } from '@/stores/treasure-store';
import { ImageSelect } from '@/components/ui/image-select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { ImagePicker } from '@/components/layout/ImagePicker';
import { openPresentWindow } from '@/lib/present-window';
import { Minus, Plus, RotateCcw, Check, Pencil } from 'lucide-react';
import { EncounterBudget } from '@/components/session/EncounterBudget';
import { SessionRenameDialog } from '@/components/session/SessionRenameDialog';
import type { ChecklistItem, Encounter, Session, SessionEncounter, SessionEncounterType } from '@/types';

export default function SessionDetailPage() {
  const params = useParams<{ id: string; sid: string }>();
  const campaignId = params.id;
  const sessionId = params.sid;

  const { campaigns, sessions, updateSession, setActiveCampaignId } =
    useCampaignStore();
  const { encounters } = useEncounterStore();
  const { maps } = useMapStore();
  const { treasures } = useTreasureStore();

  const campaign = campaigns.find((c) => c.id === campaignId);
  const session = sessions.find((s) => s.id === sessionId);

  // Local editable state
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Session['status']>('planned');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [sessionEncounters, setSessionEncounters] = useState<SessionEncounter[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [renaming, setRenaming] = useState(false);

  // Session encounter form state
  const [sessionPartyLevel, setSessionPartyLevel] = useState<number | null>(null);
  const [addingEncounter, setAddingEncounter] = useState(false);
  const [editingEncounterId, setEditingEncounterId] = useState<string | null>(null);
  const [encTitle, setEncTitle] = useState('');
  const [encType, setEncType] = useState<SessionEncounterType>('battle');
  const [encDescription, setEncDescription] = useState('');
  const [encLinkedId, setEncLinkedId] = useState('');
  const [encNotes, setEncNotes] = useState('');
  const [encImageId, setEncImageId] = useState('');
  const [expandedEncId, setExpandedEncId] = useState<string | null>(null);

  useEffect(() => {
    setActiveCampaignId(campaignId);
  }, [campaignId, setActiveCampaignId]);

  // Initialize local state from session
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (session) {
      setNotes(session.notes);
      setStatus(session.status);
      setChecklist(session.checklist);
      setSessionEncounters(session.sessionEncounters ?? []);
      setSessionPartyLevel(session.partyLevelOverride ?? null);
      setHasChanges(false);
    }
  }, [session?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  /* eslint-enable react-hooks/set-state-in-effect */

  function markChanged() {
    setHasChanges(true);
  }

  function handleSave() {
    if (!session) return;
    updateSession(sessionId, {
      notes,
      status,
      checklist,
      sessionEncounters,
      partyLevelOverride: sessionPartyLevel ?? undefined,
    });
    setHasChanges(false);
  }

  function handleAddChecklistItem() {
    if (!newChecklistItem.trim()) return;
    const item: ChecklistItem = {
      id: crypto.randomUUID(),
      text: newChecklistItem.trim(),
      done: false,
    };
    setChecklist((prev) => [...prev, item]);
    setNewChecklistItem('');
    markChanged();
  }

  function handleToggleChecklistItem(itemId: string) {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item
      )
    );
    markChanged();
  }

  function handleRemoveChecklistItem(itemId: string) {
    setChecklist((prev) => prev.filter((item) => item.id !== itemId));
    markChanged();
  }

  function handleStatusChange(value: string) {
    setStatus(value as Session['status']);
    markChanged();
  }

  function resetEncounterForm() {
    setEncTitle('');
    setEncType('battle');
    setEncDescription('');
    setEncNotes('');
    setEncLinkedId('');
    setEncImageId('');
    setAddingEncounter(false);
    setEditingEncounterId(null);
  }

  function saveSessionEncounters(updated: SessionEncounter[]) {
    setSessionEncounters(updated);
    updateSession(sessionId, {
      notes,
      status,
      checklist,
      sessionEncounters: updated,
    });
  }

  function handleAddEncounter() {
    if (!encTitle.trim()) return;
    const enc: SessionEncounter = {
      id: crypto.randomUUID(),
      title: encTitle.trim(),
      type: encType,
      description: encDescription.trim(),
      notes: encNotes.trim() || undefined,
      linkedEncounterId: encLinkedId || undefined,
      imageId: encImageId || undefined,
    };
    saveSessionEncounters([...sessionEncounters, enc]);
    resetEncounterForm();
  }

  function handleEditEncounter(enc: SessionEncounter) {
    setEditingEncounterId(enc.id);
    setEncTitle(enc.title);
    setEncType(enc.type);
    setEncDescription(enc.description);
    setEncNotes(enc.notes ?? '');
    setEncLinkedId(enc.linkedEncounterId ?? '');
    setEncImageId(enc.imageId ?? '');
  }

  function handleSaveEditEncounter() {
    if (!encTitle.trim() || !editingEncounterId) return;
    const updated = sessionEncounters.map((e) =>
      e.id === editingEncounterId
        ? {
            ...e,
            title: encTitle.trim(),
            type: encType,
            description: encDescription.trim(),
            notes: encNotes.trim() || undefined,
            linkedEncounterId: encLinkedId || undefined,
            imageId: encImageId || undefined,
          }
        : e
    );
    saveSessionEncounters(updated);
    resetEncounterForm();
  }

  function handleToggleCompleted(id: string) {
    saveSessionEncounters(
      sessionEncounters.map((e) =>
        e.id === id ? { ...e, completed: !e.completed } : e
      )
    );
  }

  function handleDeleteEncounter(id: string) {
    saveSessionEncounters(sessionEncounters.filter((e) => e.id !== id));
  }

  function handleMoveEncounter(id: string, direction: 'up' | 'down') {
    const idx = sessionEncounters.findIndex((e) => e.id === id);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sessionEncounters.length) return;
    const next = [...sessionEncounters];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    saveSessionEncounters(next);
  }

  const ENCOUNTER_TYPE_LABELS: Record<SessionEncounterType, string> = {
    battle: 'Battle',
    'skill-check': 'Skill Check',
    'npc-interaction': 'NPC Interaction',
  };

  const ENCOUNTER_TYPE_COLORS: Record<SessionEncounterType, string> = {
    battle: 'bg-red-600',
    'skill-check': 'bg-blue-600',
    'npc-interaction': 'bg-green-600',
  };

  // Combat encounters available to link
  const campaignEncounters = encounters.filter(
    (e) => e.campaignId === campaignId
  );

  if (!campaign || !session) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">
          {!campaign ? 'Campaign' : 'Session'} not found.
        </p>
        <Link
          href={campaign ? `/campaign/${campaignId}/sessions` : '/'}
          className="text-primary underline mt-2 inline-block"
        >
          {campaign ? 'Back to sessions' : 'Back to campaigns'}
        </Link>
      </div>
    );
  }

  // Linked resources
  const linkedEncounters = encounters.filter((e) =>
    session.linkedEncounterIds.includes(e.id)
  );
  const linkedMaps = maps.filter((m) =>
    session.linkedMapIds.includes(m.id)
  );
  const linkedTreasures = treasures.filter((t) =>
    session.linkedTreasureIds.includes(t.id)
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={`#${session.number}: ${session.title}`}
        description={campaign.name}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setRenaming(true)}>
              <Pencil data-icon="inline-start" />
              Rename
            </Button>
            <ImagePicker campaignId={campaignId} />
            <Link href={`/campaign/${campaignId}/sessions`}>
              <Button variant="outline">Back to Sessions</Button>
            </Link>
            <Button onClick={handleSave} disabled={!hasChanges}>
              {hasChanges ? 'Save Changes' : 'Saved'}
            </Button>
          </div>
        }
      />

      <SessionRenameDialog
        session={renaming ? session : null}
        onClose={() => setRenaming(false)}
      />

      {/* Party banner */}
      {(campaign.partyMembers?.length ?? 0) > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 px-4 py-2.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">Party</span>
          {campaign.partyMembers!.map((m) => (
            <div key={m.id} className="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5">
              <span className="font-semibold text-base">{m.characterName || '—'}</span>
              <span className="text-sm text-muted-foreground">{m.playerName}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content - Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={status} onValueChange={(v) => v && handleStatusChange(v)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Planned</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="in-progress">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">In Progress</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Completed</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Session Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  markChanged();
                }}
                placeholder="Write your session notes, prep, recap, or anything else..."
                rows={12}
                className="resize-y"
              />
            </CardContent>
          </Card>

          {/* Session Encounters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Encounters</CardTitle>
                {!addingEncounter && !editingEncounterId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddingEncounter(true)}
                  >
                    Add Encounter
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessionEncounters.length === 0 && !addingEncounter && (
                <p className="text-sm text-muted-foreground">
                  No encounters planned for this session yet.
                </p>
              )}

              {sessionEncounters.map((enc, idx) =>
                editingEncounterId === enc.id ? (
                  <EncounterForm
                    key={enc.id}
                    title={encTitle}
                    type={encType}
                    description={encDescription}
                    notes={encNotes}
                    linkedId={encLinkedId}
                    imageId={encImageId}
                    campaignId={campaignId}
                    campaignEncounters={campaignEncounters}
                    onTitleChange={setEncTitle}
                    onTypeChange={setEncType}
                    onDescriptionChange={setEncDescription}
                    onNotesChange={setEncNotes}
                    onLinkedIdChange={setEncLinkedId}
                    onImageIdChange={setEncImageId}
                    onSave={handleSaveEditEncounter}
                    onCancel={resetEncounterForm}
                    saveLabel="Save"
                  />
                ) : (() => {
                  const isExpanded = expandedEncId === enc.id;
                  return (
                    <div
                      key={enc.id}
                      className={`rounded-md border p-3 space-y-2 group cursor-pointer hover:bg-muted/30 transition-colors ${enc.completed ? 'opacity-60' : ''}`}
                      onClick={() => setExpandedEncId(isExpanded ? null : enc.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            className={`size-5 shrink-0 rounded border flex items-center justify-center transition-colors ${
                              enc.completed
                                ? 'bg-green-600 border-green-500 text-white'
                                : 'border-muted-foreground/40 hover:border-green-400'
                            }`}
                            title={enc.completed ? 'Mark incomplete' : 'Mark completed'}
                            onClick={(e) => { e.stopPropagation(); handleToggleCompleted(enc.id); }}
                          >
                            {enc.completed && <Check className="size-3" />}
                          </button>
                          <Badge
                            className={`${ENCOUNTER_TYPE_COLORS[enc.type]} text-white text-xs`}
                          >
                            {ENCOUNTER_TYPE_LABELS[enc.type]}
                          </Badge>
                          <span className={`font-medium ${enc.completed ? 'line-through text-muted-foreground' : ''}`}>{enc.title}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => e.stopPropagation()}>
                          {idx > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleMoveEncounter(enc.id, 'up')}
                            >
                              ↑
                            </Button>
                          )}
                          {idx < sessionEncounters.length - 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleMoveEncounter(enc.id, 'down')}
                            >
                              ↓
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => handleEditEncounter(enc)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => handleDeleteEncounter(enc.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                      {enc.description && (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-5">
                          {enc.description}
                        </p>
                      )}
                      {isExpanded && (
                        <div className="pl-5 space-y-2">
                          {enc.notes && (
                            <div className="rounded border bg-muted/30 p-2">
                              <p className="text-xs font-semibold text-muted-foreground mb-1">Notes</p>
                              <p className="text-sm whitespace-pre-wrap">{enc.notes}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-3 flex-wrap" onClick={(e) => e.stopPropagation()}>
                            {enc.linkedEncounterId && (
                              <>
                                <Link
                                  href={`/campaign/${campaignId}/encounter/${enc.linkedEncounterId}`}
                                  className="text-xs text-primary hover:underline"
                                >
                                  View encounter →
                                </Link>
                                <Link
                                  href={`/campaign/${campaignId}/encounter/${enc.linkedEncounterId}/run?from=session&sid=${sessionId}`}
                                >
                                  <Button variant="default" size="sm" className="h-6 text-xs">
                                    Run Encounter
                                  </Button>
                                </Link>
                              </>
                            )}
                            {enc.type === 'battle' && !enc.linkedEncounterId && (
                              <p className="text-xs text-muted-foreground italic">
                                Link a combat encounter to enable Run Encounter
                              </p>
                            )}
                            {enc.imageId && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => openPresentWindow(`/present?img=${enc.imageId}`)}
                              >
                                Present to Players
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}

              {addingEncounter && (
                <>
                  {sessionEncounters.length > 0 && <Separator />}
                  <EncounterForm
                    title={encTitle}
                    type={encType}
                    description={encDescription}
                    notes={encNotes}
                    linkedId={encLinkedId}
                    imageId={encImageId}
                    campaignId={campaignId}
                    campaignEncounters={campaignEncounters}
                    onTitleChange={setEncTitle}
                    onTypeChange={setEncType}
                    onDescriptionChange={setEncDescription}
                    onNotesChange={setEncNotes}
                    onLinkedIdChange={setEncLinkedId}
                    onImageIdChange={setEncImageId}
                    onSave={handleAddEncounter}
                    onCancel={resetEncounterForm}
                    saveLabel="Add"
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Encounter Budget */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Encounter Budget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Party level for this session */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">Session Party Level</p>
                  {sessionPartyLevel != null && sessionPartyLevel !== campaign.partyLevel && (
                    <p className="text-[10px] text-muted-foreground">
                      Campaign level: {campaign.partyLevel}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    disabled={(sessionPartyLevel ?? campaign.partyLevel) <= 1}
                    onClick={() => {
                      const newLevel = Math.max(1, (sessionPartyLevel ?? campaign.partyLevel) - 1);
                      setSessionPartyLevel(newLevel);
                      updateSession(sessionId, { partyLevelOverride: newLevel });
                    }}
                  >
                    <Minus className="size-3" />
                  </Button>
                  <span className="text-lg font-bold w-6 text-center">
                    {sessionPartyLevel ?? campaign.partyLevel}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    disabled={(sessionPartyLevel ?? campaign.partyLevel) >= 20}
                    onClick={() => {
                      const newLevel = Math.min(20, (sessionPartyLevel ?? campaign.partyLevel) + 1);
                      setSessionPartyLevel(newLevel);
                      updateSession(sessionId, { partyLevelOverride: newLevel });
                    }}
                  >
                    <Plus className="size-3" />
                  </Button>
                  {sessionPartyLevel != null && sessionPartyLevel !== campaign.partyLevel && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      title="Reset to campaign level"
                      onClick={() => { setSessionPartyLevel(null); updateSession(sessionId, { partyLevelOverride: undefined }); }}
                    >
                      <RotateCcw className="size-3" />
                    </Button>
                  )}
                </div>
              </div>
              <Separator />
              <EncounterBudget
                partySize={campaign.partyMembers?.length || campaign.partySize}
                partyLevel={sessionPartyLevel ?? campaign.partyLevel}
                sessionEncounters={sessionEncounters}
                encounters={campaignEncounters}
              />
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {checklist.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No checklist items yet.
                </p>
              )}
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 group"
                >
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => handleToggleChecklistItem(item.id)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span
                    className={`flex-1 text-sm ${
                      item.done
                        ? 'line-through text-muted-foreground'
                        : ''
                    }`}
                  >
                    {item.text}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                  >
                    x
                  </Button>
                </div>
              ))}
              <Separator />
              <div className="flex gap-2">
                <Input
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklistItem();
                    }
                  }}
                  placeholder="Add item..."
                  className="text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddChecklistItem}
                  disabled={!newChecklistItem.trim()}
                >
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Linked Encounters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Linked Encounters</CardTitle>
            </CardHeader>
            <CardContent>
              {linkedEncounters.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No linked encounters.
                </p>
              ) : (
                <div className="space-y-2">
                  {linkedEncounters.map((enc) => (
                    <Link
                      key={enc.id}
                      href={`/campaign/${campaignId}/encounters`}
                      className="block text-sm text-primary hover:underline"
                    >
                      {enc.name}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Linked Maps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Linked Maps</CardTitle>
            </CardHeader>
            <CardContent>
              {linkedMaps.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No linked maps.
                </p>
              ) : (
                <div className="space-y-2">
                  {linkedMaps.map((m) => (
                    <Link
                      key={m.id}
                      href={`/campaign/${campaignId}/maps`}
                      className="block text-sm text-primary hover:underline"
                    >
                      {m.name}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Linked Treasures */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Linked Treasures</CardTitle>
            </CardHeader>
            <CardContent>
              {linkedTreasures.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No linked treasures.
                </p>
              ) : (
                <div className="space-y-2">
                  {linkedTreasures.map((t) => (
                    <span
                      key={t.id}
                      className="block text-sm"
                    >
                      {t.name}{' '}
                      <span className="text-muted-foreground">
                        ({t.goldValue}g)
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ChatPanel
        context={{ type: 'session', campaignId, sessionId }}
        campaign={campaign}
        session={session}
        extraActions={[
          {
            label: 'Set as Session Notes',
            onClick: (content) => {
              setNotes(content);
              markChanged();
            },
          },
        ]}
      />
    </div>
  );
}

function EncounterForm({
  title,
  type,
  description,
  notes,
  linkedId,
  imageId,
  campaignId,
  campaignEncounters,
  onTitleChange,
  onTypeChange,
  onDescriptionChange,
  onNotesChange,
  onLinkedIdChange,
  onImageIdChange,
  onSave,
  onCancel,
  saveLabel,
}: {
  title: string;
  type: SessionEncounterType;
  description: string;
  notes: string;
  linkedId: string;
  imageId: string;
  campaignId: string;
  campaignEncounters: Encounter[];
  onTitleChange: (v: string) => void;
  onTypeChange: (v: SessionEncounterType) => void;
  onDescriptionChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onLinkedIdChange: (v: string) => void;
  onImageIdChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saveLabel: string;
}) {
  return (
    <div className="space-y-3 rounded-md border p-3 bg-muted/30">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Title *</Label>
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g. Ambush at the Bridge"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Type</Label>
          <Select
            value={type}
            onValueChange={(v) => v && onTypeChange(v as SessionEncounterType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="battle">Battle</SelectItem>
              <SelectItem value="skill-check">Skill Check</SelectItem>
              <SelectItem value="npc-interaction">NPC Interaction</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Description</Label>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Brief description of this encounter..."
          rows={2}
          className="resize-y"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Notes</Label>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="GM notes, reminders, tactics..."
          rows={3}
          className="resize-y"
        />
      </div>
      {type === 'battle' && campaignEncounters.length > 0 && (
        <div className="space-y-1">
          <Label className="text-xs">Link Combat Encounter (optional)</Label>
          <Select
            value={linkedId || '_none'}
            onValueChange={(v) => onLinkedIdChange(v === '_none' ? '' : (v ?? ''))}
          >
            <SelectTrigger>
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">None</SelectItem>
              {campaignEncounters.map((enc) => (
                <SelectItem key={enc.id} value={enc.id}>
                  {enc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-1">
        <Label className="text-xs">Image (optional)</Label>
        <ImageSelect
          campaignId={campaignId}
          value={imageId}
          onChange={onImageIdChange}
          uploadCategory="scene"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={onSave} disabled={!title.trim()}>
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}
