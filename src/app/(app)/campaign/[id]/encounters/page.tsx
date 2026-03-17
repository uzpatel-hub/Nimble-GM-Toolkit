"use client";

import { useParams, useRouter } from "next/navigation";
import { Plus, Trash2, Swords } from "lucide-react";
import { useEncounterStore } from "@/stores/encounter-store";
import type { DifficultyRating } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card";

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
        <div className="space-y-3">
          {campaignEncounters.map((enc) => {
            const monsterCount = enc.monsters.reduce(
              (sum, m) => sum + m.count,
              0
            );
            return (
              <Card
                key={enc.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() =>
                  router.push(`/campaign/${campaignId}/encounter/${enc.id}`)
                }
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {enc.name}
                    <Badge
                      variant="secondary"
                      className={DIFFICULTY_COLORS[enc.difficulty]}
                    >
                      {enc.difficulty.replace("-", " ")}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {monsterCount} monster{monsterCount !== 1 ? "s" : ""} &middot;
                    Party of {enc.partySize} (Lv {enc.partyLevel})
                  </CardDescription>
                  <CardAction>
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEncounter(enc.id);
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {enc.monsters.map((m, i) => (
                      <Badge key={i} variant="outline">
                        {m.name} x{m.count}
                        {m.isMinion && " (minion)"}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(enc.updatedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
