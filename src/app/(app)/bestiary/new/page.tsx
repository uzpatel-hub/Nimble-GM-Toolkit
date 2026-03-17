'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { useMonsterStore } from '@/stores/monster-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImagePlus, Trash2 } from 'lucide-react';
import type { MonsterAbility, MonsterSize, ArmorType } from '@/types';
import { MONSTER_STATS_BY_LEVEL } from '@/data/monster-tables';

const ACTION_TYPES = [
  { label: 'Action', value: 'action' },
  { label: 'Bonus Action', value: 'bonus-action' },
  { label: 'Reaction', value: 'reaction' },
  { label: 'Passive', value: 'passive' },
] as const;

export default function NewMonsterPage() {
  const router = useRouter();
  const { addMonster } = useMonsterStore();

  const [name, setName] = useState('');
  const [level, setLevel] = useState(1);
  const [faction, setFaction] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState<MonsterSize>('medium');
  const [armorType, setArmorType] = useState<ArmorType>('none');
  const [hp, setHp] = useState(10);
  const [saveDC, setSaveDC] = useState<number | undefined>(undefined);
  const [specialMovement, setSpecialMovement] = useState('');
  const [abilities, setAbilities] = useState<MonsterAbility[]>([]);
  const [imageDataUri, setImageDataUri] = useState<string | undefined>(undefined);

  function addAbility() {
    setAbilities((prev) => [
      ...prev,
      { name: '', description: '', actionType: 'action' },
    ]);
  }

  function updateAbility(index: number, updates: Partial<MonsterAbility>) {
    setAbilities((prev) =>
      prev.map((a, i) => (i === index ? { ...a, ...updates } : a))
    );
  }

  function removeAbility(index: number) {
    setAbilities((prev) => prev.filter((_, i) => i !== index));
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUri(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!name.trim()) return;
    const id = addMonster({
      name: name.trim(),
      level,
      faction: faction.trim(),
      description: description.trim(),
      size,
      armorType,
      hp,
      saveDC,
      specialMovement: specialMovement.trim() || undefined,
      abilities: abilities.filter((a) => a.name.trim()),
      isCustom: true,
      imageDataUri,
    });
    router.push(`/bestiary/${id}`);
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Create Monster"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Monster Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Shadow Drake"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Input
                    id="level"
                    type="number"
                    min={1}
                    max={20}
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="faction">Faction</Label>
                <Input
                  id="faction"
                  value={faction}
                  onChange={(e) => setFaction(e.target.value)}
                  placeholder="e.g. Beast, Undead, Humanoid, Dragon, Fey"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the monster's appearance and behavior..."
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
              {imageDataUri ? (
                <div className="space-y-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageDataUri}
                    alt={name || 'Monster'}
                    className="w-full max-h-64 object-contain rounded-lg border"
                  />
                  <div className="flex gap-2">
                    <Label
                      htmlFor="new-monster-image-replace"
                      className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs hover:bg-muted transition-colors"
                    >
                      <ImagePlus className="size-3.5" />
                      Replace
                    </Label>
                    <input
                      id="new-monster-image-replace"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive h-7 text-xs"
                      onClick={() => setImageDataUri(undefined)}
                    >
                      <Trash2 className="size-3.5 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <Label
                    htmlFor="new-monster-image"
                    className="cursor-pointer flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 hover:bg-muted/50 transition-colors"
                  >
                    <ImagePlus className="size-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload an image</span>
                  </Label>
                  <input
                    id="new-monster-image"
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
                  <Label htmlFor="size">Size</Label>
                  <Select
                    value={size}
                    onValueChange={(v) => v && setSize(v as MonsterSize)}
                  >
                    <SelectTrigger id="size">
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
                  <Label htmlFor="armorType">Armor Type</Label>
                  <Select
                    value={armorType}
                    onValueChange={(v) => v && setArmorType(v as ArmorType)}
                  >
                    <SelectTrigger id="armorType">
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
                  <Label htmlFor="hp">HP</Label>
                  <Input
                    id="hp"
                    type="number"
                    min={1}
                    value={hp}
                    onChange={(e) => setHp(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="saveDC">Save DC (optional)</Label>
                  <Input
                    id="saveDC"
                    type="number"
                    min={1}
                    value={saveDC ?? ''}
                    onChange={(e) => setSaveDC(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialMovement">Special Movement (optional)</Label>
                  <Input
                    id="specialMovement"
                    value={specialMovement}
                    onChange={(e) => setSpecialMovement(e.target.value)}
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
              {abilities.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No abilities added yet. Click &quot;Add Ability&quot; to start.
                </p>
              )}
              {abilities.map((ability, index) => (
                <div
                  key={index}
                  className="rounded-lg border p-4 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Ability Name</Label>
                          <Input
                            value={ability.name}
                            onChange={(e) =>
                              updateAbility(index, { name: e.target.value })
                            }
                            placeholder="e.g. Shadow Breath"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Action Type</Label>
                          <Select
                            value={ability.actionType || 'action'}
                            onValueChange={(value) =>
                              value && updateAbility(index, {
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
                            updateAbility(index, {
                              description: e.target.value,
                            })
                          }
                          placeholder="Describe what this ability does..."
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
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              Create Monster
            </Button>
          </div>
        </div>

        {/* Stats-by-Level Reference */}
        <div className="hidden lg:block">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-base">Stats-by-Level Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 pr-2 font-medium">Lv</th>
                      <th className="pb-2 pr-2 font-medium">HP</th>
                      <th className="pb-2 pr-2 font-medium">DPR</th>
                      <th className="pb-2 pr-2 font-medium">DC</th>
                      <th className="pb-2 font-medium">Attack</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MONSTER_STATS_BY_LEVEL.map((row) => (
                      <tr
                        key={row.level}
                        className={`border-b last:border-0 ${
                          row.level === level
                            ? 'bg-primary/10 font-medium'
                            : ''
                        }`}
                      >
                        <td className="py-2 pr-2">{row.level}</td>
                        <td className="py-2 pr-2">{row.hpNoArmor}</td>
                        <td className="py-2 pr-2">{row.damagePerRound}</td>
                        <td className="py-2 pr-2">{row.saveDC}</td>
                        <td className="py-2 text-xs">
                          {row.attackDice}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
