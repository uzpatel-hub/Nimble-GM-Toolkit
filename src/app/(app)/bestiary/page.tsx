'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { useMonsterStore } from '@/stores/monster-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const LEVEL_RANGES = [
  { label: 'All Levels', value: 'all' },
  { label: 'Level 1-3', value: '1-3' },
  { label: 'Level 4-6', value: '4-6' },
  { label: 'Level 7-10', value: '7-10' },
];

export default function BestiaryPage() {
  const { monsters } = useMonsterStore();

  const [search, setSearch] = useState('');
  const [levelRange, setLevelRange] = useState('all');
  const [factionFilter, setFactionFilter] = useState('all');

  const factions = useMemo(() => {
    const set = new Set(monsters.map((m) => m.faction).filter(Boolean));
    return Array.from(set).sort();
  }, [monsters]);

  const filtered = useMemo(() => {
    return monsters.filter((m) => {
      if (search && !m.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (levelRange !== 'all') {
        const [min, max] = levelRange.split('-').map(Number);
        if (m.level < min || m.level > max) return false;
      }
      if (factionFilter !== 'all' && m.faction !== factionFilter) {
        return false;
      }
      return true;
    });
  }, [monsters, search, levelRange, factionFilter]);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Bestiary"
        actions={
          <Link href="/bestiary/new">
            <Button>Create Monster</Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search monsters by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={levelRange} onValueChange={(v) => setLevelRange(v ?? "all")}>
          <SelectTrigger className="sm:w-[160px]">
            <SelectValue placeholder="Level range" />
          </SelectTrigger>
          <SelectContent>
            {LEVEL_RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={factionFilter} onValueChange={(v) => setFactionFilter(v ?? "all")}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="Faction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Factions</SelectItem>
            {factions.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Monster Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-lg text-muted-foreground">
            {monsters.length === 0
              ? 'No monsters yet. Create your first monster to get started.'
              : 'No monsters match your filters.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((monster) => (
            <Link key={monster.id} href={`/bestiary/${monster.id}`}>
              <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer overflow-hidden">
                {monster.imageDataUri && (
                  <div className="h-32 overflow-hidden border-b">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={monster.imageDataUri}
                      alt={monster.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight">
                      {monster.name}
                    </CardTitle>
                    <div className="flex gap-1 shrink-0">
                      <Badge variant="secondary">Lv {monster.level}</Badge>
                      {monster.isCustom && (
                        <Badge variant="outline">Custom</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {monster.faction && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {monster.faction}
                    </p>
                  )}
                  <div className="flex gap-4 text-sm">
                    {monster.size !== 'medium' && (
                      <span>
                        <span className="text-muted-foreground">Size:</span>{' '}
                        <span className="capitalize">{monster.size}</span>
                      </span>
                    )}
                    <span>
                      <span className="text-muted-foreground">Armor:</span>{' '}
                      {monster.armorType === 'none' ? 'None' : monster.armorType === 'medium' ? 'Medium (M)' : 'Heavy (H)'}
                    </span>
                    <span>
                      <span className="text-muted-foreground">HP:</span>{' '}
                      {monster.hp}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
