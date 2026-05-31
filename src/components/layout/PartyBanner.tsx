'use client';

import { useParams } from 'next/navigation';
import { useCampaignStore } from '@/stores/campaign-store';
import { useMounted } from '@/hooks/use-mounted';
import { StoredImg } from '@/components/ui/stored-image';

export function PartyBanner() {
  const params = useParams<{ id: string }>();
  const campaignId = params?.id;
  const mounted = useMounted();
  const campaigns = useCampaignStore((s) => s.campaigns);
  const campaign = campaignId ? campaigns.find((c) => c.id === campaignId) : null;

  if (!mounted || !campaign || !campaign.partyMembers?.length) return null;

  return (
    <div className="flex items-center gap-4 overflow-x-auto border-b bg-muted/30 px-4 py-2">
      {campaign.partyMembers.map((m) => (
        <div key={m.id} className="flex items-center gap-2 shrink-0">
          {m.imageId && (
            <StoredImg
              imageId={m.imageId}
              alt={m.characterName || m.playerName}
              className="size-7 rounded-full object-cover object-top"
            />
          )}
          <div className="text-xs leading-tight">
            <span className="font-medium">{m.characterName || 'Unnamed'}</span>
            <span className="text-muted-foreground"> ({m.playerName})</span>
          </div>
        </div>
      ))}
    </div>
  );
}
