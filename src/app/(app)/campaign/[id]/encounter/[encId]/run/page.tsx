"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEncounterStore } from "@/stores/encounter-store";
import { useMonsterStore } from "@/stores/monster-store";
import { useCampaignStore } from "@/stores/campaign-store";
import { ImagePicker } from "@/components/layout/ImagePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import type { Monster, MonsterAbility } from "@/types";

interface MonsterInstance {
  instanceId: string;
  monster: Monster;
  currentHp: number;
  maxHp: number;
  isMinion: boolean;
  conditions: string[];
  label: string;
}

const ARMOR_LABELS: Record<string, string> = { none: "None", medium: "Medium", heavy: "Heavy" };
const ARMOR_DESC: Record<string, string> = {
  none: "",
  medium: "Dice only, ignore modifiers",
  heavy: "Half dice, ignore modifiers",
};

const CONDITIONS = [
  "Blinded", "Bloodied", "Charmed", "Dazed", "Frightened", "Grappled",
  "Incapacitated", "Invisible", "Poisoned", "Prone", "Restrained", "Slowed", "Taunted",
];

export default function RunEncounterPage() {
  const params = useParams<{ id: string; encId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = params.id;
  const encId = params.encId;
  const fromSession = searchParams.get("from") === "session";
  const sessionId = searchParams.get("sid");

  const { encounters } = useEncounterStore();
  const { monsters: allMonsters } = useMonsterStore();
  const { campaigns } = useCampaignStore();

  const encounter = encounters.find((e) => e.id === encId && e.campaignId === campaignId);
  const campaign = campaigns.find((c) => c.id === campaignId);

  const initialInstances = useMemo(() => {
    if (!encounter) return [];
    const instances: MonsterInstance[] = [];
    for (const em of encounter.monsters) {
      const monster = allMonsters.find((m) => m.id === em.monsterId);
      if (!monster) continue;
      for (let i = 0; i < em.count; i++) {
        instances.push({
          instanceId: `${em.monsterId}-${i}`,
          monster,
          currentHp: em.isMinion ? 1 : monster.hp,
          maxHp: em.isMinion ? 1 : monster.hp,
          isMinion: em.isMinion,
          conditions: [],
          label: em.count > 1 ? `${monster.name} ${i + 1}` : monster.name,
        });
      }
    }
    return instances;
  }, [encounter, allMonsters]);

  const [instances, setInstances] = useState<MonsterInstance[]>(initialInstances);
  const [damageInputs, setDamageInputs] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(initialInstances[0]?.instanceId ?? null);
  const [round, setRound] = useState(1);

  // Unique monsters for the right panel (deduplicated by monster id)
  const uniqueMonsters = useMemo(() => {
    const seen = new Set<string>();
    const result: Monster[] = [];
    for (const inst of instances) {
      if (!seen.has(inst.monster.id)) {
        seen.add(inst.monster.id);
        result.push(inst.monster);
      }
    }
    return result;
  }, [instances]);

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

  function handleSelectInstance(instanceId: string) {
    setSelectedId(instanceId);
    const inst = instances.find((i) => i.instanceId === instanceId);
    if (inst) scrollToMonster(inst.monster.id);
  }

  const selectedInst = instances.find((i) => i.instanceId === selectedId);

  function applyDamage(instanceId: string, amount: number) {
    setInstances((prev) =>
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
    setDamageInputs((prev) => ({ ...prev, [instanceId]: "" }));
  }

  function toggleCondition(instanceId: string, condition: string) {
    setInstances((prev) =>
      prev.map((inst) => {
        if (inst.instanceId !== instanceId) return inst;
        const conditions = inst.conditions.includes(condition)
          ? inst.conditions.filter((c) => c !== condition)
          : [...inst.conditions, condition];
        return { ...inst, conditions };
      })
    );
  }

  function resetAll() {
    setInstances(initialInstances);
    setDamageInputs({});
    setRound(1);
  }

  const aliveCount = instances.filter((i) => i.currentHp > 0).length;

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
            R{round} &bull; {aliveCount}/{instances.length} alive
          </span>
        </div>
        <div className="flex gap-1">
          <ImagePicker campaignId={campaignId} />
          {encounter?.imageId && (
            <Button variant="outline" size="sm"
              onClick={() => window.open(`/present?img=${encounter.imageId}`, '_blank', 'noopener')}>
              Present to Players
            </Button>
          )}
          {fromSession && sessionId && (
            <Button variant="outline" size="sm"
              onClick={() => router.push(`/campaign/${campaignId}/session/${sessionId}`)}>
              Back to Session
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setRound((r) => Math.max(1, r - 1))}>
            − Round
          </Button>
          <Button variant="outline" size="sm" onClick={() => setRound((r) => r + 1)}>
            + Round
          </Button>
          <Button variant="destructive" size="sm" onClick={resetAll}>Reset</Button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* LEFT: Monster tracker */}
        <div className="w-1/2 border-r overflow-y-auto">
          <div className="divide-y">
            {instances.map((inst) => {
              const isDead = inst.currentHp <= 0;
              const hpPct = inst.maxHp > 0 ? (inst.currentHp / inst.maxHp) * 100 : 0;
              const dmg = damageInputs[inst.instanceId] ?? "";
              const isSelected = selectedId === inst.instanceId;

              return (
                <div
                  key={inst.instanceId}
                  className={`px-3 py-1.5 cursor-pointer transition-colors flex items-center gap-2 ${
                    isDead ? "opacity-40" : ""
                  } ${isSelected ? "bg-muted" : "hover:bg-muted/50"}`}
                  onClick={() => handleSelectInstance(inst.instanceId)}
                >
                  {/* Name + conditions */}
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className={`font-medium text-sm truncate ${isDead ? "line-through" : ""}`}>
                      {inst.label}
                    </span>
                    {inst.conditions.map((c) => (
                      <span key={c} className="text-[10px] bg-red-900/50 text-red-300 rounded px-1 shrink-0">
                        {c}
                      </span>
                    ))}
                  </div>

                  {/* Damage input + HP */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Input
                      type="number"
                      value={dmg}
                      onChange={(e) => setDamageInputs((p) => ({ ...p, [inst.instanceId]: e.target.value }))}
                      placeholder="±"
                      className="w-12 h-6 text-xs text-center"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && dmg) {
                          applyDamage(inst.instanceId, Number(dmg));
                        }
                      }}
                    />
                    {inst.isMinion ? (
                      isDead ? (
                        <span className="text-xs text-red-500 font-mono w-10 text-center">Dead</span>
                      ) : (
                        <Button variant="destructive" size="sm" className="h-6 text-xs px-2"
                          onClick={() => applyDamage(inst.instanceId, 1)}>Kill</Button>
                      )
                    ) : (
                      <>
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isDead ? "bg-red-700" : hpPct <= 25 ? "bg-red-500" : hpPct <= 50 ? "bg-yellow-500" : "bg-green-500"
                            }`}
                            style={{ width: `${hpPct}%` }}
                          />
                        </div>
                        <span className={`text-xs font-mono w-14 text-right ${
                          isDead ? "text-red-500" : hpPct <= 50 ? "text-yellow-500" : "text-muted-foreground"
                        }`}>
                          {inst.currentHp}/{inst.maxHp}
                        </span>
                      </>
                    )}
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

        {/* RIGHT: All monster stat blocks */}
        <div className="w-1/2 overflow-y-auto p-4 space-y-4" ref={detailPanelRef}>
          {uniqueMonsters.map((m) => {
            const isHighlighted = selectedInst?.monster.id === m.id;
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

          {/* Conditions for selected instance */}
          {selectedInst && (
            <div className="rounded-lg border p-4">
              <p className="text-sm font-semibold mb-2">
                Conditions — {selectedInst.label}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CONDITIONS.map((c) => (
                  <Button
                    key={c}
                    variant={selectedInst.conditions.includes(c) ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => toggleCondition(selectedInst.instanceId, c)}
                  >
                    {c}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
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
