'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { useMonsterStore } from '@/stores/monster-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { ImagePlus, Trash2 } from 'lucide-react';
import type { MonsterAbility, MonsterSize, ArmorType } from '@/types';

const ACTION_TYPES = [
  { label: 'Action', value: 'action' },
  { label: 'Bonus Action', value: 'bonus-action' },
  { label: 'Reaction', value: 'reaction' },
  { label: 'Passive', value: 'passive' },
] as const;

function actionTypeLabel(type?: string) {
  return ACTION_TYPES.find((t) => t.value === type)?.label || 'Action';
}

function actionTypeBadgeVariant(type?: string) {
  switch (type) {
    case 'bonus-action':
      return 'secondary' as const;
    case 'reaction':
      return 'outline' as const;
    case 'passive':
      return 'default' as const;
    default:
      return 'destructive' as const;
  }
}

export default function MonsterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { monsters, updateMonster } = useMonsterStore();

  const monster = useMemo(
    () => monsters.find((m) => m.id === id),
    [monsters, id]
  );

  const [editing, setEditing] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editLevel, setEditLevel] = useState(1);
  const [editFaction, setEditFaction] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSize, setEditSize] = useState<MonsterSize>('medium');
  const [editArmorType, setEditArmorType] = useState<ArmorType>('none');
  const [editHp, setEditHp] = useState(10);
  const [editSaveDC, setEditSaveDC] = useState<number | undefined>(undefined);
  const [editSpecialMovement, setEditSpecialMovement] = useState('');
  const [editAbilities, setEditAbilities] = useState<MonsterAbility[]>([]);
  const [editImageDataUri, setEditImageDataUri] = useState<string | undefined>(undefined);

  function startEditing() {
    if (!monster) return;
    setEditName(monster.name);
    setEditLevel(monster.level);
    setEditFaction(monster.faction);
    setEditDescription(monster.description);
    setEditSize(monster.size);
    setEditArmorType(monster.armorType);
    setEditHp(monster.hp);
    setEditSaveDC(monster.saveDC);
    setEditSpecialMovement(monster.specialMovement ?? '');
    setEditAbilities([...monster.abilities]);
    setEditImageDataUri(monster.imageDataUri);
    setEditing(true);
  }

  function addAbility() {
    setEditAbilities((prev) => [
      ...prev,
      { name: '', description: '', actionType: 'action' },
    ]);
  }

  function updateAbilityField(index: number, updates: Partial<MonsterAbility>) {
    setEditAbilities((prev) =>
      prev.map((a, i) => (i === index ? { ...a, ...updates } : a))
    );
  }

  function removeAbility(index: number) {
    setEditAbilities((prev) => prev.filter((_, i) => i !== index));
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEditImageDataUri(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!editName.trim()) return;
    updateMonster(id, {
      name: editName.trim(),
      level: editLevel,
      faction: editFaction.trim(),
      description: editDescription.trim(),
      size: editSize,
      armorType: editArmorType,
      hp: editHp,
      saveDC: editSaveDC,
      specialMovement: editSpecialMovement.trim() || undefined,
      abilities: editAbilities.filter((a) => a.name.trim()),
      imageDataUri: editImageDataUri,
    });
    setEditing(false);
  }

  if (!monster) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader title="Monster Not Found" />
        <p className="text-muted-foreground">
          This monster could not be found.
        </p>
        <Link href="/bestiary">
          <Button variant="outline">Back to Bestiary</Button>
        </Link>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader
          title={`Edit: ${monster.name}`}
          actions={
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          }
        />

        <div className="max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-level">Level</Label>
                  <Input
                    id="edit-level"
                    type="number"
                    min={1}
                    max={20}
                    value={editLevel}
                    onChange={(e) => setEditLevel(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-faction">Faction</Label>
                <Input
                  id="edit-faction"
                  value={editFaction}
                  onChange={(e) => setEditFaction(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc">Description</Label>
                <Textarea
                  id="edit-desc"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Image</CardTitle>
            </CardHeader>
            <CardContent>
              {editImageDataUri ? (
                <div className="space-y-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={editImageDataUri}
                    alt={editName || 'Monster'}
                    className="w-full max-h-64 object-contain rounded-lg border"
                  />
                  <div className="flex gap-2">
                    <Label
                      htmlFor="edit-monster-image-replace"
                      className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs hover:bg-muted transition-colors"
                    >
                      <ImagePlus className="size-3.5" />
                      Replace
                    </Label>
                    <input
                      id="edit-monster-image-replace"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive h-7 text-xs"
                      onClick={() => setEditImageDataUri(undefined)}
                    >
                      <Trash2 className="size-3.5 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <Label
                    htmlFor="edit-monster-image"
                    className="cursor-pointer flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 hover:bg-muted/50 transition-colors"
                  >
                    <ImagePlus className="size-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload an image</span>
                  </Label>
                  <input
                    id="edit-monster-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Combat Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Select
                    value={editSize}
                    onValueChange={(v) => v && setEditSize(v as MonsterSize)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan'] as const).map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Armor Type</Label>
                  <Select
                    value={editArmorType}
                    onValueChange={(v) => v && setEditArmorType(v as ArmorType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(['none', 'medium', 'heavy'] as const).map((a) => (
                        <SelectItem key={a} value={a}>
                          {a.charAt(0).toUpperCase() + a.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>HP</Label>
                  <Input
                    type="number"
                    min={1}
                    value={editHp}
                    onChange={(e) => setEditHp(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Save DC (optional)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={editSaveDC ?? ''}
                    onChange={(e) => setEditSaveDC(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Special Movement (optional)</Label>
                  <Input
                    value={editSpecialMovement}
                    onChange={(e) => setEditSpecialMovement(e.target.value)}
                    placeholder="e.g. Fly 60, Swim 40"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Abilities</CardTitle>
                <Button variant="outline" size="sm" onClick={addAbility}>
                  Add Ability
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editAbilities.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No abilities. Click &quot;Add Ability&quot; to add one.
                </p>
              )}
              {editAbilities.map((ability, index) => (
                <div key={index} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={ability.name}
                            onChange={(e) =>
                              updateAbilityField(index, { name: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Action Type</Label>
                          <Select
                            value={ability.actionType || 'action'}
                            onValueChange={(value) =>
                              value && updateAbilityField(index, {
                                actionType: value as MonsterAbility['actionType'],
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ACTION_TYPES.map((t) => (
                                <SelectItem key={t.value} value={t.value}>
                                  {t.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={ability.description}
                          onChange={(e) =>
                            updateAbilityField(index, {
                              description: e.target.value,
                            })
                          }
                          rows={2}
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAbility(index)}
                      className="text-destructive hover:text-destructive shrink-0"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!editName.trim()}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // View mode
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={monster.name}
        actions={
          <div className="flex gap-2">
            <Link href="/bestiary">
              <Button variant="outline">Back to Bestiary</Button>
            </Link>
            {monster.isCustom && (
              <Button onClick={startEditing}>Edit</Button>
            )}
          </div>
        }
      />

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">Level {monster.level}</Badge>
              {monster.faction && <Badge variant="outline">{monster.faction}</Badge>}
              {monster.isCustom && <Badge>Custom</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Monster image */}
            {monster.imageDataUri && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={monster.imageDataUri}
                  alt={monster.name}
                  className="w-full max-h-72 object-contain rounded-lg"
                />
              </>
            )}

            {/* Core stats row */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Size
                </div>
                <div className="text-2xl font-bold capitalize">{monster.size}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Armor Type
                </div>
                <div className="text-2xl font-bold capitalize">{monster.armorType}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  HP
                </div>
                <div className="text-2xl font-bold">{monster.hp}</div>
              </div>
            </div>

            {/* Optional stats */}
            {(monster.saveDC || monster.specialMovement) && (
              <div className="flex gap-4 flex-wrap">
                {monster.saveDC && (
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Save DC
                    </div>
                    <div className="text-xl font-semibold">{monster.saveDC}</div>
                  </div>
                )}
                {monster.specialMovement && (
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Special Movement
                    </div>
                    <div className="text-xl font-semibold">{monster.specialMovement}</div>
                  </div>
                )}
              </div>
            )}

            {/* Abilities */}
            {monster.abilities.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                    Abilities
                  </h3>
                  {monster.abilities.map((ability, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{ability.name}</span>
                        <Badge variant={actionTypeBadgeVariant(ability.actionType)}>
                          {actionTypeLabel(ability.actionType)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {ability.description}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Description */}
            {monster.description && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2">
                    Description
                  </h3>
                  <p className="text-sm leading-relaxed">{monster.description}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
