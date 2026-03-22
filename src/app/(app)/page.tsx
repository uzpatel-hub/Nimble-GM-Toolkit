'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCampaignStore } from '@/stores/campaign-store';
import { useMounted } from '@/hooks/use-mounted';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BackupRestoreCard } from '@/components/layout/BackupRestore';

export default function HomePage() {
  const mounted = useMounted();
  const { campaigns, addCampaign, deleteCampaign, setActiveCampaignId } =
    useCampaignStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [partySize, setPartySize] = useState(4);
  const [partyLevel, setPartyLevel] = useState(1);

  function handleCreate() {
    if (!name.trim()) return;
    const id = addCampaign({
      name: name.trim(),
      description: description.trim(),
      partySize,
      partyLevel,
      partyMembers: [],
    });
    setActiveCampaignId(id);
    setName('');
    setDescription('');
    setPartySize(4);
    setPartyLevel(1);
    setDialogOpen(false);
  }

  function handleDelete(id: string) {
    deleteCampaign(id);
    setDeleteConfirmId(null);
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Campaigns"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 cursor-pointer">
              New Campaign
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Campaign</DialogTitle>
                <DialogDescription>
                  Set up a new campaign for your Nimble TTRPG game.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Name</Label>
                  <Input
                    id="campaign-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. The Lost Mines"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign-desc">Description</Label>
                  <Textarea
                    id="campaign-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief overview of your campaign..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="party-size">Party Size</Label>
                    <Input
                      id="party-size"
                      type="number"
                      min={1}
                      max={10}
                      value={partySize}
                      onChange={(e) => setPartySize(Number(e.target.value))}
                    />
                  </div>
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
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!name.trim()}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {!mounted ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-lg text-muted-foreground">
            No campaigns yet. Create your first campaign to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="relative group">
              <Link href={`/campaign/${campaign.id}`} className="block">
                <CardHeader>
                  <CardTitle>{campaign.name}</CardTitle>
                  {campaign.description && (
                    <CardDescription className="line-clamp-2">
                      {campaign.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Party: {campaign.partyMembers?.length || campaign.partySize} players</span>
                    <span>Level {campaign.partyLevel}</span>
                  </div>
                  {(campaign.partyMembers?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {campaign.partyMembers.map((m) => (
                        <span
                          key={m.id}
                          className="text-xs bg-muted rounded px-1.5 py-0.5"
                        >
                          {m.characterName}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">
                    Created{' '}
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </p>
                </CardFooter>
              </Link>

              {/* Delete button */}
              <div className="absolute top-2 right-2">
                {deleteConfirmId === campaign.id ? (
                  <div className="flex gap-1" onClick={(e) => e.preventDefault()}>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(campaign.id);
                      }}
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        setDeleteConfirmId(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      setDeleteConfirmId(campaign.id);
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Backup & Restore */}
      <div className="max-w-2xl">
        <BackupRestoreCard />
      </div>
    </div>
  );
}
