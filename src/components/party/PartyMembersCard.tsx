'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ImageSelect } from '@/components/ui/image-select';
import { StoredImg } from '@/components/ui/stored-image';
import type { PartyMember } from '@/types';

const ANCESTRIES = {
  Common: ['Human', 'Dwarf', 'Elf', 'Halfling', 'Gnome'],
  Exotic: [
    'Birdfolk', 'Bunbun', 'Celestial', 'Changeling', 'Crystalborn',
    'Dragonborn', 'Dryad/Shroomling', 'Fiendkin', 'Goblin', 'Half-Giant',
    'Kobold', 'Minotaur/Beastfolk', 'Oozeling/Construct', 'Orc',
    'Planarbeing', 'Ratfolk', 'Stoatling', 'Turtlefolk', 'Wyrdling',
  ],
};

const CLASSES = [
  'Artificer', 'Berserker', 'The Cheat', 'Commander', 'Hexbinder',
  'Hunter', 'Mage', 'Oathsworn', 'Shadowmancer', 'Shepherd',
  'Songweaver', 'Stormshifter', 'Zephyr',
];

interface PartyMembersCardProps {
  members: PartyMember[];
  editable?: boolean;
  onChange?: (members: PartyMember[]) => void;
  campaignId?: string;
}

export function PartyMembersCard({
  members,
  editable = false,
  onChange,
  campaignId,
}: PartyMembersCardProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [characterName, setCharacterName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [charClass, setCharClass] = useState('');
  const [race, setRace] = useState('');
  const [imageId, setImageId] = useState('');
  const [motivation, setMotivation] = useState('');
  const [personality, setPersonality] = useState('');
  const [backstory, setBackstory] = useState('');

  function resetForm() {
    setCharacterName('');
    setPlayerName('');
    setCharClass('');
    setRace('');
    setImageId('');
    setMotivation('');
    setPersonality('');
    setBackstory('');
    setAdding(false);
    setEditingId(null);
  }

  function handleAdd() {
    if (!playerName.trim()) return;
    const member: PartyMember = {
      id: crypto.randomUUID(),
      characterName: characterName.trim(),
      playerName: playerName.trim(),
      class: charClass.trim(),
      race: race.trim(),
      imageId: imageId || undefined,
      motivation: motivation.trim() || undefined,
      personality: personality.trim() || undefined,
      backstory: backstory.trim() || undefined,
    };
    onChange?.([...members, member]);
    resetForm();
  }

  function handleEdit(member: PartyMember) {
    setEditingId(member.id);
    setCharacterName(member.characterName);
    setPlayerName(member.playerName);
    setCharClass(member.class);
    setRace(member.race);
    setImageId(member.imageId ?? '');
    setMotivation(member.motivation ?? '');
    setPersonality(member.personality ?? '');
    setBackstory(member.backstory ?? '');
  }

  function handleSaveEdit() {
    if (!playerName.trim() || !editingId) return;
    onChange?.(
      members.map((m) =>
        m.id === editingId
          ? {
              ...m,
              characterName: characterName.trim(),
              playerName: playerName.trim(),
              class: charClass.trim(),
              race: race.trim(),
              imageId: imageId || undefined,
              motivation: motivation.trim() || undefined,
              personality: personality.trim() || undefined,
              backstory: backstory.trim() || undefined,
            }
          : m
      )
    );
    resetForm();
  }

  function handleDelete(id: string) {
    onChange?.(members.filter((m) => m.id !== id));
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Party Members</CardTitle>
          {editable && !adding && !editingId && (
            <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
              Add Member
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {members.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">No party members yet.</p>
        )}

        {members.map((member) =>
          editingId === member.id ? (
            <MemberForm
              key={member.id}
              characterName={characterName}
              playerName={playerName}
              charClass={charClass}
              race={race}
              imageId={imageId}
              campaignId={campaignId}
              motivation={motivation}
              personality={personality}
              backstory={backstory}
              onCharacterNameChange={setCharacterName}
              onPlayerNameChange={setPlayerName}
              onClassChange={setCharClass}
              onRaceChange={setRace}
              onImageIdChange={setImageId}
              onMotivationChange={setMotivation}
              onPersonalityChange={setPersonality}
              onBackstoryChange={setBackstory}
              onSave={handleSaveEdit}
              onCancel={resetForm}
              saveLabel="Save"
            />
          ) : (
            <div
              key={member.id}
              className="rounded-md border p-3 group"
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
                  onClick={() => {
                    if (member.motivation || member.personality || member.backstory) {
                      setExpandedIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(member.id)) next.delete(member.id);
                        else next.add(member.id);
                        return next;
                      });
                    }
                  }}
                >
                  {member.imageId && (
                    <StoredImg imageId={member.imageId} alt={member.characterName || member.playerName} className="size-10 rounded-full object-cover object-top shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">
                      {member.characterName || <span className="text-muted-foreground italic">No character name</span>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {[member.race, member.class].filter(Boolean).join(' ')}
                      {(member.race || member.class) && ' \u2022 '}
                      Played by {member.playerName}
                    </div>
                  </div>
                </button>
                <div className="flex gap-1 shrink-0">
                  {editable && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(member)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(member.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              {expandedIds.has(member.id) && (
                <div className="mt-3 space-y-2 border-t pt-3 text-sm">
                  {member.motivation && (
                    <div>
                      <span className="font-medium text-muted-foreground">Motivation: </span>
                      <span>{member.motivation}</span>
                    </div>
                  )}
                  {member.personality && (
                    <div>
                      <span className="font-medium text-muted-foreground">Personality: </span>
                      <span>{member.personality}</span>
                    </div>
                  )}
                  {member.backstory && (
                    <div>
                      <span className="font-medium text-muted-foreground">Backstory: </span>
                      <span>{member.backstory}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        )}

        {adding && (
          <>
            {members.length > 0 && <Separator />}
            <MemberForm
              characterName={characterName}
              playerName={playerName}
              charClass={charClass}
              race={race}
              imageId={imageId}
              campaignId={campaignId}
              motivation={motivation}
              personality={personality}
              backstory={backstory}
              onCharacterNameChange={setCharacterName}
              onPlayerNameChange={setPlayerName}
              onClassChange={setCharClass}
              onRaceChange={setRace}
              onImageIdChange={setImageId}
              onMotivationChange={setMotivation}
              onPersonalityChange={setPersonality}
              onBackstoryChange={setBackstory}
              onSave={handleAdd}
              onCancel={resetForm}
              saveLabel="Add"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function MemberForm({
  characterName,
  playerName,
  charClass,
  race,
  imageId,
  campaignId,
  motivation,
  personality,
  backstory,
  onCharacterNameChange,
  onPlayerNameChange,
  onClassChange,
  onRaceChange,
  onImageIdChange,
  onMotivationChange,
  onPersonalityChange,
  onBackstoryChange,
  onSave,
  onCancel,
  saveLabel,
}: {
  characterName: string;
  playerName: string;
  charClass: string;
  race: string;
  imageId: string;
  campaignId?: string;
  motivation: string;
  personality: string;
  backstory: string;
  onCharacterNameChange: (v: string) => void;
  onPlayerNameChange: (v: string) => void;
  onClassChange: (v: string) => void;
  onRaceChange: (v: string) => void;
  onImageIdChange: (v: string) => void;
  onMotivationChange: (v: string) => void;
  onPersonalityChange: (v: string) => void;
  onBackstoryChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saveLabel: string;
}) {
  return (
    <div className="space-y-3 rounded-md border p-3 bg-muted/30">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Character Name</Label>
          <Input
            value={characterName}
            onChange={(e) => onCharacterNameChange(e.target.value)}
            placeholder="e.g. Thorin"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Player Name *</Label>
          <Input
            value={playerName}
            onChange={(e) => onPlayerNameChange(e.target.value)}
            placeholder="e.g. John"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Ancestry</Label>
          <Select value={race || null} onValueChange={(v) => onRaceChange(v ?? '')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select ancestry" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Common</SelectLabel>
                {ANCESTRIES.Common.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Exotic</SelectLabel>
                {ANCESTRIES.Exotic.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Class</Label>
          <Select value={charClass || null} onValueChange={(v) => onClassChange(v ?? '')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {CLASSES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {campaignId && (
        <div className="space-y-1">
          <Label className="text-xs">Portrait</Label>
          <ImageSelect
            campaignId={campaignId}
            value={imageId}
            onChange={onImageIdChange}
            uploadCategory="player-portrait"
            previewClassName="size-16 rounded-full object-cover object-top"
          />
        </div>
      )}
      <Separator />
      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Motivation</Label>
          <Textarea
            value={motivation}
            onChange={(e) => onMotivationChange(e.target.value)}
            placeholder="What drives this character? Goals, desires, fears..."
            rows={2}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Personality</Label>
          <Textarea
            value={personality}
            onChange={(e) => onPersonalityChange(e.target.value)}
            placeholder="Traits, quirks, temperament..."
            rows={2}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Backstory</Label>
          <Textarea
            value={backstory}
            onChange={(e) => onBackstoryChange(e.target.value)}
            placeholder="Past events, origins, key relationships..."
            rows={3}
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={!playerName.trim()}
        >
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}
