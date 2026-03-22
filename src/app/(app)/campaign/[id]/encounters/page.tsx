"use client";

import { useParams, useRouter } from "next/navigation";
import { Plus, Trash2, Swords } from "lucide-react";
import { useEncounterStore } from "@/stores/encounter-store";
import type { DifficultyRating } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DIFFICULTY_COLORS: Record<DifficultyRating, string> = {
  easy: "bg-green-500/10 text-green-600",
  medium: "bg-yellow-500/10 text-yellow-600",
  hard: "bg-orange-500/10 text-orange-600",
  deadly: "bg-red-500/10 text-red-600",
  "very-deadly": "bg-red-700/10 text-red-800",
};

export default function EncountersPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const campaignId = params.id;

  const { encounters, deleteEncounter } = useEncounterStore();
  const campaignEncounters = encounters.filter(
    (e) => e.campaignId === campaignId
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Encounters"
        actions={
          <Button
            onClick={() => router.push(`/campaign/${campaignId}/encounter/new`)}
          >
            <Plus data-icon="inline-start" />
            New Encounter
          </Button>
        }
      />

      {campaignEncounters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Swords className="mb-4 size-12 opacity-40" />
          <p className="text-lg font-medium">No encounters yet</p>
          <p className="text-sm">Build your first encounter.</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_auto_auto_minmax(0,2fr)_auto_auto] gap-x-4 items-center px-4 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
            <span>Name</span>
            <span>Difficulty</span>
            <span>Party</span>
            <span>Monsters</span>
            <span>Updated</span>
            <span className="w-8" />
          </div>

          {/* Encounter rows */}
          <div className="divide-y">
            {campaignEncounters.map((enc) => {
              const monsterCount = enc.monsters.reduce((sum, m) => sum + m.count, 0);
              return (
                <div
                  key={enc.id}
                  className="grid grid-cols-[1fr_auto_auto_minmax(0,2fr)_auto_auto] gap-x-4 items-center px-4 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => router.push(`/campaign/${campaignId}/encounter/${enc.id}`)}
                >
                  {/* Name */}
                  <span className="font-medium text-sm truncate">{enc.name}</span>

                  {/* Difficulty */}
                  <Badge variant="secondary" className={`${DIFFICULTY_COLORS[enc.difficulty]} capitalize text-xs whitespace-nowrap`}>
                    {enc.difficulty.replace("-", " ")}
                  </Badge>

                  {/* Party */}
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {enc.partySize} x Lv{enc.partyLevel}
                  </span>

                  {/* Monsters */}
                  <div className="flex flex-wrap gap-1 min-w-0">
                    {enc.monsters.map((m, i) => (
                      <Badge key={i} variant="outline" className="text-[11px] h-5 shrink-0">
                        {m.name} x{m.count}{m.isMinion ? " (m)" : ""}
                      </Badge>
                    ))}
                    <span className="text-[10px] text-muted-foreground self-center ml-1">
                      ({monsterCount})
                    </span>
                  </div>

                  {/* Updated */}
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(enc.updatedAt).toLocaleDateString()}
                  </span>

                  {/* Delete */}
                  <Button
                    variant="destructive"
                    size="icon-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteEncounter(enc.id);
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
