"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Search } from "lucide-react";
import { useEncounterStore } from "@/stores/encounter-store";
import { useMonsterStore } from "@/stores/monster-store";
import { useCampaignStore } from "@/stores/campaign-store";
import { ImageSelect } from "@/components/ui/image-select";
import type { EncounterMonster, DifficultyRating } from "@/types";
import { calcDifficulty, MINION_PRESSURE_LABEL } from "@/lib/difficulty";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const DIFFICULTY_COLORS: Record<DifficultyRating, string> = {
  easy: "bg-green-500",
  medium: "bg-yellow-500",
  hard: "bg-orange-500",
  deadly: "bg-red-500",
  "very-deadly": "bg-red-700",
};

const DIFFICULTY_TEXT_COLORS: Record<DifficultyRating, string> = {
  easy: "text-green-600",
  medium: "text-yellow-600",
  hard: "text-orange-600",
  deadly: "text-red-600",
  "very-deadly": "text-red-800",
};

export default function EncounterNewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const campaignId = params.id;

  const { addEncounter } = useEncounterStore();
  const { monsters } = useMonsterStore();
  const { campaigns } = useCampaignStore();
  const campaign = campaigns.find((c) => c.id === campaignId);

  const [name, setName] = useState("");
  const [partySize, setPartySize] = useState(campaign?.partySize ?? 4);
  const [partyLevel, setPartyLevel] = useState(campaign?.partyLevel ?? 1);
  const [encounterMonsters, setEncounterMonsters] = useState<EncounterMonster[]>([]);
  const [notes, setNotes] = useState("");
  const [monsterSearch, setMonsterSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<"any" | "at" | "below" | "above">("any");
  const [levelThreshold, setLevelThreshold] = useState(campaign?.partyLevel ?? 1);
  const [showBrowser, setShowBrowser] = useState(true);
  const [imageId, setImageId] = useState("");

  const filteredMonsters = useMemo(() => {
    let filtered = monsters;
    // Name filter
    if (monsterSearch) {
      const q = monsterSearch.toLowerCase();
      filtered = filtered.filter((m) => m.name.toLowerCase().includes(q));
    }
    // Level filter
    if (levelFilter === "at") {
      filtered = filtered.filter((m) => m.level === levelThreshold);
    } else if (levelFilter === "below") {
      filtered = filtered.filter((m) => m.level <= levelThreshold);
    } else if (levelFilter === "above") {
      filtered = filtered.filter((m) => m.level >= levelThreshold);
    }
    // Sort by level then name
    return filtered.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  }, [monsters, monsterSearch, levelFilter, levelThreshold]);

  const { rating, percent, minionCount, minionsPerHero, minionPressure } = useMemo(
    () => calcDifficulty(encounterMonsters, partySize, partyLevel),
    [encounterMonsters, partySize, partyLevel]
  );

  const addMonster = (monsterId: string) => {
    const monster = monsters.find((m) => m.id === monsterId);
    if (!monster) return;
    const existing = encounterMonsters.find((m) => m.monsterId === monsterId);
    if (existing) {
      setEncounterMonsters(
        encounterMonsters.map((m) =>
          m.monsterId === monsterId ? { ...m, count: m.count + 1 } : m
        )
      );
    } else {
      setEncounterMonsters([
        ...encounterMonsters,
        {
          monsterId,
          name: monster.name,
          level: monster.level,
          count: 1,
          isMinion: false,
        },
      ]);
    }
  };

  const updateMonsterCount = (monsterId: string, count: number) => {
    if (count <= 0) {
      setEncounterMonsters(encounterMonsters.filter((m) => m.monsterId !== monsterId));
    } else {
      setEncounterMonsters(
        encounterMonsters.map((m) =>
          m.monsterId === monsterId ? { ...m, count } : m
        )
      );
    }
  };

  const toggleMinion = (monsterId: string) => {
    setEncounterMonsters(
      encounterMonsters.map((m) =>
        m.monsterId === monsterId ? { ...m, isMinion: !m.isMinion } : m
      )
    );
  };

  const removeMonster = (monsterId: string) => {
    setEncounterMonsters(encounterMonsters.filter((m) => m.monsterId !== monsterId));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    addEncounter({
      campaignId,
      name: name.trim(),
      partySize,
      partyLevel,
      monsters: encounterMonsters,
      difficulty: rating,
      difficultyPercent: percent,
      notes,
      imageId: imageId || undefined,
    });
    router.push(`/campaign/${campaignId}/encounters`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/campaign/${campaignId}/encounters`)}
        >
          <ArrowLeft data-icon="inline-start" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">New Encounter</h1>
      </div>

      <div className="space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <Label>Encounter Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name this encounter"
          />
        </div>

        {/* Party Members */}
        {(campaign?.partyMembers?.length ?? 0) > 0 && (
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm font-medium mb-2">Party</p>
              <div className="flex flex-wrap gap-2">
                {campaign!.partyMembers.map((m) => (
                  <Badge key={m.id} variant="secondary">
                    {m.characterName}
                    {m.class ? ` (${m.class})` : ''}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Party info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Party Size</Label>
            <Input
              type="number"
              min={1}
              value={partySize}
              onChange={(e) => setPartySize(Math.max(1, Number(e.target.value)))}
            />
          </div>
          <div className="space-y-2">
            <Label>Party Level</Label>
            <Input
              type="number"
              min={1}
              value={partyLevel}
              onChange={(e) => setPartyLevel(Math.max(1, Number(e.target.value)))}
            />
          </div>
        </div>

        {/* Difficulty meter */}
        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Difficulty</span>
              <Badge
                variant="secondary"
                className={DIFFICULTY_TEXT_COLORS[rating]}
              >
                {rating.replace("-", " ").toUpperCase()} ({percent}%)
              </Badge>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${DIFFICULTY_COLORS[rating]}`}
                style={{ width: `${Math.min(percent, 200) / 2}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Easy</span>
              <span>Medium</span>
              <span>Hard</span>
              <span>Deadly</span>
              <span>Very Deadly</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Based on standard monster levels vs. party levels. Minions are rated separately.
            </p>

            {/* Minion pressure */}
            {minionCount > 0 && (
              <div className="pt-2 border-t space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Minion Pressure</span>
                  <Badge
                    variant="secondary"
                    className={
                      minionPressure === "slight"
                        ? "text-yellow-600"
                        : minionPressure === "noticeable"
                          ? "text-orange-600"
                          : "text-red-600"
                    }
                  >
                    {MINION_PRESSURE_LABEL[minionPressure]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{minionCount} minion{minionCount === 1 ? "" : "s"} / {partySize} hero{partySize === 1 ? "" : "es"}</span>
                  <span>{minionsPerHero.toFixed(1)} per hero</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  1/hero = slightly harder, 2–3/hero = noticeably harder, 4+/hero = much harder.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monster list */}
        <div className="space-y-3">
          <Label>Monsters</Label>

          {encounterMonsters.length > 0 && (
            <div className="space-y-2">
              {encounterMonsters.map((em) => (
                <div
                  key={em.monsterId}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <span className="font-medium">{em.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      Lv {em.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Minion</Label>
                    <Switch
                      checked={em.isMinion}
                      onCheckedChange={() => toggleMinion(em.monsterId)}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      onClick={() => updateMonsterCount(em.monsterId, em.count - 1)}
                    >
                      -
                    </Button>
                    <span className="w-6 text-center text-sm">{em.count}</span>
                    <Button
                      variant="outline"
                      size="icon-xs"
                      onClick={() => updateMonsterCount(em.monsterId, em.count + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon-xs"
                    onClick={() => removeMonster(em.monsterId)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Monster Browser */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Add Monsters</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBrowser((s) => !s)}
              >
                {showBrowser ? "Hide Browser" : "Show Browser"}
              </Button>
            </div>

            {showBrowser && (
              <div className="space-y-3 rounded-lg border p-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    value={monsterSearch}
                    onChange={(e) => setMonsterSearch(e.target.value)}
                    placeholder="Search by name..."
                    className="pl-8"
                  />
                </div>

                {/* Level filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Level:</span>
                  {(["any", "at", "below", "above"] as const).map((f) => (
                    <Button
                      key={f}
                      variant={levelFilter === f ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setLevelFilter(f)}
                    >
                      {f === "any" ? "Any" : f === "at" ? "Exactly" : f === "below" ? "At or Below" : "At or Above"}
                    </Button>
                  ))}
                  {levelFilter !== "any" && (
                    <Input
                      type="number"
                      min={0}
                      value={levelThreshold}
                      onChange={(e) => setLevelThreshold(Number(e.target.value))}
                      className="w-20 h-7 text-xs"
                    />
                  )}
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-y-auto">
                  <p className="text-xs text-muted-foreground mb-2">
                    {filteredMonsters.length} monster{filteredMonsters.length !== 1 ? "s" : ""}
                  </p>
                  {filteredMonsters.length === 0 ? (
                    <p className="p-3 text-sm text-muted-foreground text-center">
                      No monsters match your filters
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {filteredMonsters.map((m) => (
                        <div
                          key={m.id}
                          className="rounded border p-2.5 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{m.name}</span>
                              <Badge variant="outline" className="text-xs h-5">Lv {m.level}</Badge>
                              {m.armorType !== 'none' && (
                                <Badge variant="secondary" className="text-xs h-5">
                                  {m.armorType === 'medium' ? "Med" : "Heavy"} Armor
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {m.faction && (
                                <span className="text-xs text-muted-foreground">{m.faction}</span>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => addMonster(m.id)}
                              >
                                <Plus className="size-3 mr-1" />
                                Add
                              </Button>
                            </div>
                          </div>
                          <div className="flex gap-3 text-xs text-muted-foreground mb-1">
                            <span>HP {m.hp}</span>
                            {m.size !== 'medium' && <span className="capitalize">{m.size}</span>}
                            {m.saveDC && <span>DC {m.saveDC}</span>}
                            {m.specialMovement && <span>{m.specialMovement}</span>}
                          </div>
                          {m.abilities.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {m.abilities.map((a, i) => (
                                <span key={i} className="text-xs bg-muted rounded px-1.5 py-0.5" title={a.description}>
                                  {a.name}
                                  {a.actionType && a.actionType !== "passive" ? (
                                    <span className="text-muted-foreground ml-0.5">
                                      ({a.actionType === "action" ? "A" : a.actionType === "bonus-action" ? "BA" : "R"})
                                    </span>
                                  ) : a.actionType === "passive" ? (
                                    <span className="text-muted-foreground ml-0.5">(P)</span>
                                  ) : null}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Encounter Image */}
        <div className="space-y-2">
          <Label>Encounter Image</Label>
          <ImageSelect
            campaignId={campaignId}
            value={imageId}
            onChange={setImageId}
            uploadCategory="scene"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Encounter notes, tactics, terrain..."
            rows={4}
          />
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save Encounter
          </Button>
        </div>
      </div>
    </div>
  );
}
