"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, Check, Swords, Heart, Undo2 } from "lucide-react";
import { useEncounterStore } from "@/stores/encounter-store";
import { useMonsterStore } from "@/stores/monster-store";
import { useCampaignStore } from "@/stores/campaign-store";
import { ImagePicker } from "@/components/layout/ImagePicker";
import { openPresentWindow } from "@/lib/present-window";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { CONDITIONS as RULES_CONDITIONS } from "@/data/rules";
import type { Monster, MonsterAbility, TrackedEntity as PersistedEntity } from "@/types";

/** Map condition name → description for quick lookup */
const CONDITION_DESCRIPTIONS: Record<string, string> = Object.fromEntries(
  RULES_CONDITIONS.map((c) => [c.name, c.description])
);

/** Runtime entity — enriched with the full Monster object for display */
interface RuntimeEntity extends PersistedEntity {
  monster?: Monster;
}

const ARMOR_LABELS: Record<string, string> = { none: "None", medium: "Medium", heavy: "Heavy" };
const ARMOR_DESC: Record<string, string> = {
  none: "",
  medium: "Dice only, ignore modifiers",
  heavy: "Half dice, ignore modifiers",
};

const CONDITIONS = RULES_CONDITIONS.map((c) => c.name);

const MAX_UNDO_HISTORY = 50;

interface Snapshot {
  monsters: RuntimeEntity[];
  players: RuntimeEntity[];
  round: number;
}

/** Strip the monster object for persistence */
function toPersistedEntity(e: RuntimeEntity): PersistedEntity {
  return {
    instanceId: e.instanceId,
    label: e.label,
    kind: e.kind,
    monsterId: e.monsterId,
    currentHp: e.currentHp,
    maxHp: e.maxHp,
    isMinion: e.isMinion,
    conditions: e.conditions,
    turnTaken: e.turnTaken,
  };
}

/** Re-attach monster objects from the monster store */
function hydrateEntities(entities: PersistedEntity[], allMonsters: Monster[]): RuntimeEntity[] {
  return entities.map((e) => ({
    ...e,
    monster: e.monsterId ? allMonsters.find((m) => m.id === e.monsterId) : undefined,
  }));
}

export default function RunEncounterPage() {
  const params = useParams<{ id: string; encId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = params.id;
  const encId = params.encId;
  const querySessionId = searchParams.get("sid");
  const fromSession = searchParams.get("from") === "session";

  const { encounters, combatStates, saveCombatState, clearCombatState } = useEncounterStore();
  const { monsters: allMonsters } = useMonsterStore();
  const { campaigns, sessions } = useCampaignStore();

  const encounter = encounters.find((e) => e.id === encId && e.campaignId === campaignId);
  const campaign = campaigns.find((c) => c.id === campaignId);
  const linkedSession = sessions.find(
    (s) =>
      s.campaignId === campaignId &&
      (s.linkedEncounterIds.includes(encId) ||
        s.sessionEncounters?.some((se) => se.linkedEncounterId === encId))
  );
  const sessionId = querySessionId || linkedSession?.id;

  // Build fresh initial state from encounter definition
  const { freshMonsters, freshPlayers } = useMemo(() => {
    const monsters: RuntimeEntity[] = [];
    const players: RuntimeEntity[] = [];

    if (encounter) {
      for (const em of encounter.monsters) {
        const monster = allMonsters.find((m) => m.id === em.monsterId);
        if (!monster) continue;
        for (let i = 0; i < em.count; i++) {
          monsters.push({
            instanceId: `${em.monsterId}-${i}`,
            label: em.count > 1 ? `${monster.name} ${i + 1}` : monster.name,
            kind: "monster",
            monsterId: monster.id,
            monster,
            currentHp: em.isMinion ? 1 : monster.hp,
            maxHp: em.isMinion ? 1 : monster.hp,
            isMinion: em.isMinion,
            conditions: [],
            turnTaken: false,
          });
        }
      }
    }

    if (campaign) {
      for (const pm of campaign.partyMembers ?? []) {
        players.push({
          instanceId: `player-${pm.id}`,
          label: pm.characterName || pm.playerName,
          kind: "player",
          currentHp: 0,
          maxHp: 0,
          isMinion: false,
          conditions: [],
          turnTaken: false,
        });
      }
    }

    return { freshMonsters: monsters, freshPlayers: players };
  }, [encounter, allMonsters, campaign]);

  // On first render, restore from saved combat state if available
  const savedState = combatStates[encId];
  const [didInit] = useState(() => {
    // This only runs once — used to pick initial values
    return !!savedState;
  });

  const [monsters, setMonsters] = useState<RuntimeEntity[]>(() =>
    savedState ? hydrateEntities(savedState.monsters, allMonsters) : freshMonsters
  );
  const [players, setPlayers] = useState<RuntimeEntity[]>(() =>
    savedState ? hydrateEntities(savedState.players, allMonsters) : freshPlayers
  );
  const [round, setRound] = useState(() => savedState?.round ?? 1);

  const [damageInput, setDamageInput] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    () => (savedState ? hydrateEntities(savedState.monsters, allMonsters) : freshMonsters)[0]?.instanceId ?? null
  );
  const damageInputRef = useRef<HTMLInputElement | null>(null);

  // --- Undo history ---
  const undoStack = useRef<Snapshot[]>([]);

  function pushUndo() {
    undoStack.current.push({ monsters, players, round });
    if (undoStack.current.length > MAX_UNDO_HISTORY) {
      undoStack.current.shift();
    }
  }

  function undo() {
    const prev = undoStack.current.pop();
    if (!prev) return;
    setMonsters(prev.monsters);
    setPlayers(prev.players);
    setRound(prev.round);
  }

  const canUndo = undoStack.current.length > 0;

  // --- Auto-save to store on state changes ---
  const isFirstRender = useRef(true);
  useEffect(() => {
    // Skip the initial render to avoid saving the loaded state right back
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveCombatState({
      encounterId: encId,
      monsters: monsters.map(toPersistedEntity),
      players: players.map(toPersistedEntity),
      round,
      savedAt: new Date().toISOString(),
    });
  }, [monsters, players, round, encId, saveCombatState]);

  // Selected entity from either list
  const selectedEntity = useMemo(
    () => monsters.find((i) => i.instanceId === selectedId) ?? players.find((i) => i.instanceId === selectedId),
    [monsters, players, selectedId]
  );

  // Unique monsters for the right panel (deduplicated by monster id)
  const uniqueMonsters = useMemo(() => {
    const seen = new Set<string>();
    const result: Monster[] = [];
    for (const inst of monsters) {
      if (inst.monster && !seen.has(inst.monster.id)) {
        seen.add(inst.monster.id);
        result.push(inst.monster);
      }
    }
    return result;
  }, [monsters]);

  const detailRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const detailPanelRef = useRef<HTMLDivElement | null>(null);

  const scrollToMonster = useCallback((monsterId: string) => {
    const el = detailRefs.current[monsterId];
    const panel = detailPanelRef.current;
    if (el && panel) {
      panel.scrollTo({ top: el.offsetTop - panel.offsetTop, behavior: "smooth" });
    }
  }, []);

  if (!encounter || !campaign) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Encounter not found.</p>
        <Link href={`/campaign/${campaignId}/encounters`} className="text-primary underline mt-2 inline-block">
          Back to encounters
        </Link>
      </div>
    );
  }

  function handleSelectEntity(instanceId: string) {
    setSelectedId(instanceId);
    setDamageInput("");
    const inst = monsters.find((i) => i.instanceId === instanceId);
    if (inst?.monster) scrollToMonster(inst.monster.id);
    // Focus the damage input after React re-renders with the new selection
    setTimeout(() => damageInputRef.current?.focus(), 0);
  }

  function applyDamage(instanceId: string, amount: number) {
    pushUndo();
    setMonsters((prev) =>
      prev.map((inst) => {
        if (inst.instanceId !== instanceId) return inst;
        if (inst.isMinion && amount > 0) return { ...inst, currentHp: 0 };
        const newHp = Math.max(0, Math.min(inst.maxHp, inst.currentHp - amount));
        const conditions = [...inst.conditions];
        if (newHp <= inst.maxHp / 2 && newHp > 0 && !conditions.includes("Bloodied")) conditions.push("Bloodied");
        if (newHp > inst.maxHp / 2 && conditions.includes("Bloodied")) conditions.splice(conditions.indexOf("Bloodied"), 1);
        return { ...inst, currentHp: newHp, conditions };
      })
    );
    setDamageInput("");
    damageInputRef.current?.focus();
  }

  function toggleCondition(instanceId: string, condition: string) {
    pushUndo();
    const updater = (prev: RuntimeEntity[]) =>
      prev.map((inst) => {
        if (inst.instanceId !== instanceId) return inst;
        const conditions = inst.conditions.includes(condition)
          ? inst.conditions.filter((c) => c !== condition)
          : [...inst.conditions, condition];
        return { ...inst, conditions };
      });

    // Update whichever list contains this entity
    if (monsters.some((m) => m.instanceId === instanceId)) {
      setMonsters(updater);
    } else {
      setPlayers(updater);
    }
  }

  function toggleTurn(instanceId: string) {
    pushUndo();
    const updater = (prev: RuntimeEntity[]) =>
      prev.map((inst) =>
        inst.instanceId === instanceId ? { ...inst, turnTaken: !inst.turnTaken } : inst
      );
    if (monsters.some((m) => m.instanceId === instanceId)) {
      setMonsters(updater);
    } else {
      setPlayers(updater);
    }
  }

  function resetTurns() {
    setMonsters((prev) => prev.map((m) => ({ ...m, turnTaken: false })));
    setPlayers((prev) => prev.map((p) => ({ ...p, turnTaken: false })));
  }

  function nextRound() {
    pushUndo();
    setRound((r) => r + 1);
    resetTurns();
  }

  function prevRound() {
    pushUndo();
    setRound((r) => Math.max(1, r - 1));
    resetTurns();
  }

  function resetAll() {
    pushUndo();
    setMonsters(freshMonsters);
    setPlayers(freshPlayers);
    setDamageInput("");
    setRound(1);
    setSelectedId(freshMonsters[0]?.instanceId ?? null);
    clearCombatState(encId);
    undoStack.current = [];
  }

  const aliveCount = monsters.filter((i) => i.currentHp > 0).length;
  const hasChanges = savedState != null || didInit;

  return (
    <div className="flex flex-col h-[100dvh]">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 px-4 py-2 border-b shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm"
            onClick={() => router.push(`/campaign/${campaignId}/encounter/${encId}`)}>
            <ArrowLeft className="size-4" />
          </Button>
          <span className="font-bold">{encounter.name}</span>
          <span className="text-sm text-muted-foreground">
            R{round} &bull; {aliveCount}/{monsters.length} alive
          </span>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
            title="Undo last change"
          >
            <Undo2 className="size-4 mr-1" /> Undo
          </Button>
          <ImagePicker campaignId={campaignId} />
          {encounter?.imageId && (
            <Button variant="outline" size="sm"
              onClick={() => openPresentWindow(`/present?img=${encounter.imageId}`)}>
              Present to Players
            </Button>
          )}
          {sessionId && (
            <Button variant="outline" size="sm"
              onClick={() => router.push(`/campaign/${campaignId}/session/${sessionId}`)}>
              Back to Session
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={prevRound}>
            − Round
          </Button>
          <Button variant="outline" size="sm" onClick={nextRound}>
            + Round
          </Button>
          <Button variant="destructive" size="sm" onClick={resetAll}>Reset</Button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* LEFT: Tracker */}
        <div className="w-1/2 border-r overflow-y-auto">
          {/* Players section */}
            {players.length > 0 && (
              <>
                <div className="px-3 py-1 bg-blue-950/30 border-b">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                    <Shield className="size-3" /> Party
                  </span>
                </div>
                <div className="divide-y">
                  {players.map((player) => {
                    const isSelected = selectedId === player.instanceId;
                    return (
                      <div
                        key={player.instanceId}
                        className={`px-3 py-1.5 cursor-pointer transition-colors flex items-center gap-2 ${
                          player.turnTaken ? "opacity-50" : ""
                        } ${isSelected ? "bg-muted" : "hover:bg-muted/50"}`}
                        onClick={() => handleSelectEntity(player.instanceId)}
                      >
                        <button
                          className={`size-5 shrink-0 rounded border flex items-center justify-center transition-colors ${
                            player.turnTaken
                              ? "bg-blue-600 border-blue-500 text-white"
                              : "border-muted-foreground/40 hover:border-blue-400"
                          }`}
                          title={player.turnTaken ? "Mark turn not taken" : "Mark turn taken"}
                          onClick={(e) => { e.stopPropagation(); toggleTurn(player.instanceId); }}
                        >
                          {player.turnTaken && <Check className="size-3" />}
                        </button>
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span className={`font-medium text-sm truncate text-blue-300 ${player.turnTaken ? "line-through" : ""}`}>
                            {player.label}
                          </span>
                          {player.conditions.map((c) => (
                            <button
                              key={c}
                              className="text-[10px] bg-red-900/50 text-red-300 rounded px-1 shrink-0 hover:bg-red-700/60 hover:line-through transition-colors"
                              title={`${c} — click to remove`}
                              onClick={(e) => { e.stopPropagation(); toggleCondition(player.instanceId, c); }}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                        {player.conditions.length === 0 && (
                          <span className="text-[10px] text-muted-foreground">No conditions</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Monsters section */}
            <div className="px-3 py-1 bg-red-950/30 border-b border-t">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400">
                Monsters
              </span>
            </div>
            <div className="divide-y">
              {monsters.map((inst) => {
                const isDead = inst.currentHp <= 0;
                const hpPct = inst.maxHp > 0 ? (inst.currentHp / inst.maxHp) * 100 : 0;
                const isSelected = selectedId === inst.instanceId;

                return (
                  <div
                    key={inst.instanceId}
                    className={`cursor-pointer transition-colors ${
                      isDead ? "opacity-40" : inst.turnTaken ? "opacity-50" : ""
                    } ${isSelected ? "bg-muted" : "hover:bg-muted/50"}`}
                    onClick={() => handleSelectEntity(inst.instanceId)}
                  >
                    {/* Main row */}
                    <div className="px-3 py-1.5 flex items-center gap-2">
                      {/* Turn taken checkbox */}
                      <button
                        className={`size-5 shrink-0 rounded border flex items-center justify-center transition-colors ${
                          inst.turnTaken
                            ? "bg-green-600 border-green-500 text-white"
                            : "border-muted-foreground/40 hover:border-green-400"
                        }`}
                        title={inst.turnTaken ? "Mark turn not taken" : "Mark turn taken"}
                        onClick={(e) => { e.stopPropagation(); toggleTurn(inst.instanceId); }}
                      >
                        {inst.turnTaken && <Check className="size-3" />}
                      </button>

                      {/* Name + conditions */}
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className={`font-medium text-sm truncate ${isDead ? "line-through" : inst.turnTaken ? "line-through text-muted-foreground" : ""}`}>
                          {inst.label}
                        </span>
                        {inst.conditions.map((c) => (
                          <button
                            key={c}
                            className="text-[10px] bg-red-900/50 text-red-300 rounded px-1 shrink-0 hover:bg-red-700/60 hover:line-through transition-colors"
                            title={`${c} — click to remove`}
                            onClick={(e) => { e.stopPropagation(); toggleCondition(inst.instanceId, c); }}
                          >
                            {c}
                          </button>
                        ))}
                      </div>

                      {/* HP + inline damage controls */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {inst.isMinion ? (
                          isDead ? (
                            <span className="text-xs text-red-500 font-mono w-10 text-center">Dead</span>
                          ) : (
                            <Button variant="destructive" size="sm" className="h-6 text-xs px-2"
                              onClick={(e) => { e.stopPropagation(); applyDamage(inst.instanceId, 1); }}>Kill</Button>
                          )
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isDead ? "bg-red-700" : hpPct <= 25 ? "bg-red-500" : hpPct <= 50 ? "bg-yellow-500" : "bg-green-500"
                                }`}
                                style={{ width: `${hpPct}%` }}
                              />
                            </div>
                            <span className={`text-sm font-mono ${
                              isDead ? "text-red-500" : hpPct <= 50 ? "text-yellow-500" : "text-muted-foreground"
                            }`}>
                              {inst.currentHp}/{inst.maxHp}
                            </span>
                            {isSelected && (
                              <>
                                <Button
                                  size="sm"
                                  className="h-7 w-7 p-0 bg-red-600 hover:bg-red-500 text-white"
                                  disabled={!damageInput}
                                  title="Apply damage"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (damageInput) applyDamage(inst.instanceId, Math.abs(Number(damageInput)));
                                  }}
                                >
                                  <Swords className="size-3.5" />
                                </Button>
                                <Input
                                  ref={damageInputRef}
                                  type="number"
                                  value={damageInput}
                                  onChange={(e) => setDamageInput(e.target.value)}
                                  placeholder="0"
                                  className="h-7 w-16 text-sm text-center font-mono px-1"
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && damageInput) {
                                      applyDamage(inst.instanceId, Math.abs(Number(damageInput)));
                                    }
                                  }}
                                />
                                <Button
                                  size="sm"
                                  className="h-7 w-7 p-0 bg-green-600 hover:bg-green-500 text-white"
                                  disabled={!damageInput}
                                  title="Heal"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (damageInput) applyDamage(inst.instanceId, -Math.abs(Number(damageInput)));
                                  }}
                                >
                                  <Heart className="size-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Encounter notes at bottom */}
            {encounter.notes && (
              <div className="p-3 border-t">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Notes</p>
                <p className="text-xs whitespace-pre-wrap">{encounter.notes}</p>
              </div>
            )}
        </div>

        {/* RIGHT: All monster stat blocks + conditions */}
        <div className="w-1/2 overflow-y-auto p-4 space-y-4" ref={detailPanelRef}>
          {uniqueMonsters.map((m) => {
            const isHighlighted = selectedEntity?.kind === "monster" && selectedEntity.monster?.id === m.id;
            return (
              <div
                key={m.id}
                ref={(el) => { detailRefs.current[m.id] = el; }}
                className={`rounded-lg border p-4 space-y-3 transition-colors ${
                  isHighlighted ? "border-primary bg-muted/30" : ""
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold">{m.name}</h2>
                    <Badge variant="outline" className="text-xs">Lv {m.level}</Badge>
                    {m.size !== 'medium' && (
                      <Badge variant="outline" className="text-xs capitalize">{m.size}</Badge>
                    )}
                    {m.armorType !== 'none' && (
                      <Badge variant="secondary" className="text-xs">
                        {ARMOR_LABELS[m.armorType]} Armor
                      </Badge>
                    )}
                    {m.faction && (
                      <span className="text-xs text-muted-foreground">{m.faction}</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                {m.description && (
                  <p className="text-sm text-muted-foreground italic">{m.description}</p>
                )}

                {/* Stats row */}
                <div className="flex gap-4 text-sm">
                  <span><span className="text-muted-foreground">HP</span> <span className="font-bold">{m.hp}</span></span>
                  {m.saveDC && <span><span className="text-muted-foreground">DC</span> <span className="font-bold">{m.saveDC}</span></span>}
                  {m.specialMovement && <span><span className="text-muted-foreground">Movement</span> <span className="font-bold">{m.specialMovement}</span></span>}
                </div>

                {/* Armor reminder */}
                {m.armorType !== 'none' && ARMOR_DESC[m.armorType] && (
                  <p className="text-xs text-muted-foreground bg-muted rounded px-2 py-1">
                    <span className="font-semibold">{ARMOR_LABELS[m.armorType]} Armor:</span>{" "}
                    {ARMOR_DESC[m.armorType]}. Crits ignore armor.
                  </p>
                )}

                {/* Abilities */}
                {m.abilities.length > 0 && (
                  <div className="space-y-1.5">
                    {m.abilities.map((ability, idx) => (
                      <AbilityBlock key={idx} ability={ability} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Conditions for selected entity */}
          {selectedEntity && (
            <ConditionsPanel
              key={selectedEntity.instanceId}
              instanceId={selectedEntity.instanceId}
              label={selectedEntity.label}
              kind={selectedEntity.kind}
              activeConditions={selectedEntity.conditions}
              onToggle={toggleCondition}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ConditionsPanel({
  instanceId,
  label,
  kind,
  activeConditions,
  onToggle,
}: {
  instanceId: string;
  label: string;
  kind: "monster" | "player";
  activeConditions: string[];
  onToggle: (instanceId: string, condition: string) => void;
}) {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <p className="text-sm font-semibold flex items-center gap-2">
        Conditions —{" "}
        <span className={kind === "player" ? "text-blue-400" : ""}>{label}</span>
        {kind === "player" && <Badge variant="outline" className="text-[10px]">Player</Badge>}
      </p>

      {/* Toggle buttons */}
      <div className="flex flex-wrap gap-1.5">
        {CONDITIONS.map((c) => {
          const isActive = activeConditions.includes(c);
          return (
            <Button
              key={c}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => onToggle(instanceId, c)}
            >
              {c}
            </Button>
          );
        })}
      </div>

      {/* Active condition descriptions — only show what's toggled on */}
      {activeConditions.length > 0 && (
        <>
          <Separator />
          <div className="space-y-1.5">
            {activeConditions.map((c) => (
              <div key={c} className="rounded border border-primary/30 bg-primary/5 px-3 py-2">
                <span className="text-xs font-semibold text-primary">{c}</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {CONDITION_DESCRIPTIONS[c]}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AbilityBlock({ ability }: { ability: MonsterAbility }) {
  const typeLabel =
    ability.actionType === "action" ? "Action"
    : ability.actionType === "bonus-action" ? "Bonus"
    : ability.actionType === "reaction" ? "Reaction"
    : ability.actionType === "passive" ? "Passive"
    : null;

  return (
    <div className="rounded border p-2 bg-muted/30">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="font-medium text-sm">{ability.name}</span>
        {typeLabel && (
          <Badge variant="outline" className="text-[10px] h-4 px-1">{typeLabel}</Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{ability.description}</p>
    </div>
  );
}
