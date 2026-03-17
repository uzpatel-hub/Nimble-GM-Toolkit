'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { PartyMember } from '@/types';

interface PartyMembersCardProps {
  members: PartyMember[];
  editable?: boolean;
  onChange?: (members: PartyMember[]) => void;
}

export function PartyMembersCard({
  members,
  editable = false,
  onChange,
}: PartyMembersCardProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [characterName, setCharacterName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [charClass, setCharClass] = useState('');
  const [race, setRace] = useState('');

  function resetForm() {
    setCharacterName('');
    setPlayerName('');
    setCharClass('');
    setRace('');
    setAdding(false);
    setEditingId(null);
  }

  function handleAdd() {
    if (!characterName.trim() || !playerName.trim()) return;
    const member: PartyMember = {
      id: crypto.randomUUID(),
      characterName: characterName.trim(),
      playerName: playerName.trim(),
      class: charClass.trim(),
      race: race.trim(),
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
  }

  function handleSaveEdit() {
    if (!characterName.trim() || !playerName.trim() || !editingId) return;
    onChange?.(
      members.map((m) =>
        m.id === editingId
          ? {
              ...m,
              characterName: characterName.trim(),
              playerName: playerName.trim(),
              class: charClass.trim(),
              race: race.trim(),
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
              onCharacterNameChange={setCharacterName}
              onPlayerNameChange={setPlayerName}
              onClassChange={setCharClass}
              onRaceChange={setRace}
              onSave={handleSaveEdit}
              onCancel={resetForm}
              saveLabel="Save"
            />
          ) : (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-md border p-3 group"
            >
              <div>
                <div className="font-medium">{member.characterName}</div>
                <div className="text-sm text-muted-foreground">
                  {[member.race, member.class].filter(Boolean).join(' ')}
                  {(member.race || member.class) && ' \u2022 '}
                  Played by {member.playerName}
                </div>
              </div>
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
              onCharacterNameChange={setCharacterName}
              onPlayerNameChange={setPlayerName}
              onClassChange={setCharClass}
              onRaceChange={setRace}
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
  onCharacterNameChange,
  onPlayerNameChange,
  onClassChange,
  onRaceChange,
  onSave,
  onCancel,
  saveLabel,
}: {
  characterName: string;
  playerName: string;
  charClass: string;
  race: string;
  onCharacterNameChange: (v: string) => void;
  onPlayerNameChange: (v: string) => void;
  onClassChange: (v: string) => void;
  onRaceChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saveLabel: string;
}) {
  return (
    <div className="space-y-3 rounded-md border p-3 bg-muted/30">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Character Name *</Label>
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
          <Label className="text-xs">Race</Label>
          <Input
            value={race}
            onChange={(e) => onRaceChange(e.target.value)}
            placeholder="e.g. Dwarf"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Class</Label>
          <Input
            value={charClass}
            onChange={(e) => onClassChange(e.target.value)}
            placeholder="e.g. Fighter"
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
          disabled={!characterName.trim() || !playerName.trim()}
        >
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}
