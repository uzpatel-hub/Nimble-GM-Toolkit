'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCampaignStore } from '@/stores/campaign-store';
import { useNpcStore } from '@/stores/npc-store';
import { useEncounterStore } from '@/stores/encounter-store';
import { useMapStore } from '@/stores/map-store';
import { useNotesStore } from '@/stores/notes-store';
import { useChatStore } from '@/stores/chat-store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { PartyMembersCard } from '@/components/party/PartyMembersCard';
import { StoredImg } from '@/components/ui/stored-image';
import { ShareExportDialog, ShareImportDialog } from '@/components/share/ShareExportImport';
import type { PartyMember } from '@/types';

export default function CampaignDashboard() {
  const params = useParams<{ id: string }>();
  const campaignId = params.id;

  const { campaigns, sessions, setActiveCampaignId, updateCampaign } = useCampaignStore();
  const { npcs } = useNpcStore();
  const { encounters } = useEncounterStore();
  const { maps } = useMapStore();
  const { notes } = useNotesStore();
  const { conversations } = useChatStore();

  const campaign = campaigns.find((c) => c.id === campaignId);

  useEffect(() => {
    setActiveCampaignId(campaignId);
  }, [campaignId, setActiveCampaignId]);

  if (!campaign) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Campaign not found.</p>
        <Link href="/" className="text-primary underline mt-2 inline-block">
          Back to campaigns
        </Link>
      </div>
    );
  }

  const campaignSessions = sessions
    .filter((s) => s.campaignId === campaignId)
    .sort((a, b) => b.number - a.number);
  const campaignNpcs = npcs.filter((n) => n.campaignId === campaignId);
  const campaignEncounters = encounters.filter(
    (e) => e.campaignId === campaignId
  );
  const campaignMaps = maps.filter((m) => m.campaignId === campaignId);
  const campaignNotes = notes.filter((n) => n.campaignId === campaignId);
  const campaignConversations = conversations.filter(
    (c) => c.campaignId === campaignId
  );

  const recentSessions = campaignSessions.slice(0, 3);

  const quickLinks = [
    {
      title: 'AI Story Chat',
      description: 'Brainstorm with your AI co-GM',
      href: `/campaign/${campaignId}/chat`,
      count: campaignConversations.length,
      label: 'conversations',
    },
    {
      title: 'Sessions',
      description: 'Plan and track your sessions',
      href: `/campaign/${campaignId}/sessions`,
      count: campaignSessions.length,
      label: 'sessions',
    },
    {
      title: 'NPCs',
      description: 'Characters in your world',
      href: `/campaign/${campaignId}/npcs`,
      count: campaignNpcs.length,
      label: 'NPCs',
    },
    {
      title: 'Encounters',
      description: 'Combat encounters & balancing',
      href: `/campaign/${campaignId}/encounters`,
      count: campaignEncounters.length,
      label: 'encounters',
    },
    {
      title: 'Maps',
      description: 'World & dungeon maps',
      href: `/campaign/${campaignId}/maps`,
      count: campaignMaps.length,
      label: 'maps',
    },
    {
      title: 'Notes',
      description: 'Lore, plot hooks & secrets',
      href: `/campaign/${campaignId}/notes`,
      count: campaignNotes.length,
      label: 'notes',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={campaign.name}
        description={campaign.description || `Party of ${campaign.partyMembers?.length || campaign.partySize} at level ${campaign.partyLevel}`}
        actions={
          <div className="flex gap-2">
            <ShareImportDialog campaignId={campaignId} />
            <ShareExportDialog campaignId={campaignId} />
          </div>
        }
      />

      {/* Party */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Party Level</p>
              <p className="text-xs text-muted-foreground">
                {campaign.partyMembers?.length || campaign.partySize} players at level {campaign.partyLevel}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                disabled={campaign.partyLevel <= 1}
                onClick={() => updateCampaign(campaignId, { partyLevel: campaign.partyLevel - 1 })}
              >
                <Minus className="size-4" />
              </Button>
              <span className="text-2xl font-bold w-8 text-center">{campaign.partyLevel}</span>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                disabled={campaign.partyLevel >= 20}
                onClick={() => updateCampaign(campaignId, { partyLevel: campaign.partyLevel + 1 })}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <PartyMembersCard
        members={campaign.partyMembers ?? []}
        editable
        campaignId={campaignId}
        onChange={(members: PartyMember[]) =>
          updateCampaign(campaignId, { partyMembers: members })
        }
      />

      {/* Quick Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold">{campaignSessions.length}</div>
            <p className="text-xs text-muted-foreground">Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold">{campaignNpcs.length}</div>
            <p className="text-xs text-muted-foreground">NPCs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold">{campaignEncounters.length}</div>
            <p className="text-xs text-muted-foreground">Encounters</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold">{campaignMaps.length}</div>
            <p className="text-xs text-muted-foreground">Maps</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold">{campaignNotes.length}</div>
            <p className="text-xs text-muted-foreground">Notes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold">
              {campaignConversations.length}
            </div>
            <p className="text-xs text-muted-foreground">Chats</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/campaign/${campaignId}/session/${session.id}`}
                  className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      #{session.number}
                    </span>
                    <span className="text-sm">{session.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        session.status === 'completed'
                          ? 'default'
                          : session.status === 'in-progress'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {session.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{link.title}</CardTitle>
                  <Badge variant="secondary">
                    {link.count} {link.label}
                  </Badge>
                </div>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
