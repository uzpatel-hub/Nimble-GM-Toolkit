import { PartyBanner } from '@/components/layout/PartyBanner';

export default function CampaignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PartyBanner />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </>
  );
}
