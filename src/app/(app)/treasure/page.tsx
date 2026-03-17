'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTreasureStore } from '@/stores/treasure-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { BoonTier } from '@/types';
import { GOLD_BY_LEVEL, LOOT_TABLES } from '@/data/treasure';

const TIER_OPTIONS: { label: string; value: BoonTier }[] = [
  { label: 'Temporary', value: 'temporary' },
  { label: 'Minor', value: 'minor' },
  { label: 'Major', value: 'major' },
  { label: 'Epic', value: 'epic' },
];

function tierBadgeVariant(tier: BoonTier) {
  switch (tier) {
    case 'temporary':
      return 'secondary' as const;
    case 'minor':
      return 'outline' as const;
    case 'major':
      return 'default' as const;
    case 'epic':
      return 'destructive' as const;
  }
}

export default function TreasurePage() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Treasure Tools" />
      <Tabs defaultValue="gold" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gold">Gold Calculator</TabsTrigger>
          <TabsTrigger value="loot">Loot Roller</TabsTrigger>
          <TabsTrigger value="boons">Boon Browser</TabsTrigger>
        </TabsList>

        <TabsContent value="gold">
          <GoldCalculatorTab />
        </TabsContent>
        <TabsContent value="loot">
          <LootRollerTab />
        </TabsContent>
        <TabsContent value="boons">
          <BoonBrowserTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- Gold Calculator ---
function GoldCalculatorTab() {
  const [partyLevel, setPartyLevel] = useState(1);
  const [monsterCount, setMonsterCount] = useState(1);

  const goldEntry = GOLD_BY_LEVEL.find((g) => g.level === partyLevel) ?? GOLD_BY_LEVEL[0];
  const totalIndividual = goldEntry.individual * monsterCount;
  const totalHoard = goldEntry.hoard * monsterCount;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Encounter Parameters</CardTitle>
          <CardDescription>
            Set the party level and number of monsters to calculate gold
            rewards.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="party-level">Party Level</Label>
            <Input
              id="party-level"
              type="number"
              min={1}
              max={20}
              value={partyLevel}
              onChange={(e) => setPartyLevel(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monster-count">Number of Monsters</Label>
            <Input
              id="monster-count"
              type="number"
              min={1}
              max={100}
              value={monsterCount}
              onChange={(e) => setMonsterCount(Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gold Reward</CardTitle>
          <CardDescription>
            Individual: {goldEntry.individual} gp | Hoard: {goldEntry.hoard} gp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <div className="text-sm text-muted-foreground mb-1">
              Total Gold Range
            </div>
            <div className="text-4xl font-bold">
              {totalIndividual.toLocaleString()} - {totalHoard.toLocaleString()} gp
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Reference Table
            </h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1 font-medium">Level</th>
                  <th className="text-right py-1 font-medium">Individual</th>
                  <th className="text-right py-1 font-medium">Hoard</th>
                </tr>
              </thead>
              <tbody>
                {GOLD_BY_LEVEL.map((row) => (
                  <tr
                    key={row.level}
                    className={`border-b last:border-0 ${
                      row.level === partyLevel ? 'bg-primary/10 font-medium' : ''
                    }`}
                  >
                    <td className="py-1">{row.level}</td>
                    <td className="text-right py-1">
                      {row.individual.toLocaleString()} gp
                    </td>
                    <td className="text-right py-1">
                      {row.hoard.toLocaleString()} gp
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Loot Roller ---
function LootRollerTab() {
  const [faction, setFaction] = useState('Beast');
  const [lootResult, setLootResult] = useState<string | null>(null);

  function rollLoot() {
    const table = LOOT_TABLES[faction];
    if (!table || table.length === 0) return;
    const item = table[Math.floor(Math.random() * table.length)];
    setLootResult(item);
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Loot Roller</CardTitle>
        <CardDescription>
          Select a faction and roll for random loot.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="loot-faction">Faction / Monster Type</Label>
          <Select value={faction} onValueChange={(v) => setFaction(v ?? "Beast")}>
            <SelectTrigger id="loot-faction">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(LOOT_TABLES).map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={rollLoot} className="w-full">
          Roll Loot
        </Button>

        {lootResult && (
          <div className="rounded-lg border bg-muted/50 p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">
              You found:
            </div>
            <div className="text-lg font-semibold">{lootResult}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- Boon Browser ---
function BoonBrowserTab() {
  const { boons, addBoon } = useTreasureStore();
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  // New boon form
  const [newName, setNewName] = useState('');
  const [newTier, setNewTier] = useState<BoonTier>('minor');
  const [newDescription, setNewDescription] = useState('');

  const filtered = useMemo(() => {
    if (tierFilter === 'all') return boons;
    return boons.filter((b) => b.tier === tierFilter);
  }, [boons, tierFilter]);

  function handleCreateBoon() {
    if (!newName.trim()) return;
    addBoon({
      name: newName.trim(),
      tier: newTier,
      description: newDescription.trim(),
      isCustom: true,
    });
    setNewName('');
    setNewTier('minor');
    setNewDescription('');
    setDialogOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select value={tierFilter} onValueChange={(v) => setTierFilter(v ?? "all")}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            {TIER_OPTIONS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 cursor-pointer">
            Create Custom Boon
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Boon</DialogTitle>
              <DialogDescription>
                Add a new boon to your collection.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="boon-name">Name</Label>
                <Input
                  id="boon-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Cloak of Shadows"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="boon-tier">Tier</Label>
                <Select
                  value={newTier}
                  onValueChange={(v) => v && setNewTier(v as BoonTier)}
                >
                  <SelectTrigger id="boon-tier">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIER_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="boon-desc">Description</Label>
                <Textarea
                  id="boon-desc"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe the boon's effects..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateBoon} disabled={!newName.trim()}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">
            {boons.length === 0
              ? 'No boons yet. Create your first custom boon.'
              : 'No boons match the selected tier.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((boon) => (
            <Card key={boon.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{boon.name}</CardTitle>
                  <Badge variant={tierBadgeVariant(boon.tier)}>
                    {boon.tier}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {boon.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
