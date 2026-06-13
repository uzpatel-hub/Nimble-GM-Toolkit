'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SessionRenameDialog } from '@/components/session/SessionRenameDialog';
import { useCampaignStore } from '@/stores/campaign-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function SessionsPage() {
  const params = useParams<{ id: string }>();
  const campaignId = params.id;

  const { campaigns, sessions, addSession, setActiveCampaignId } =
    useCampaignStore();

  const campaign = campaigns.find((c) => c.id === campaignId);

  useEffect(() => {
    setActiveCampaignId(campaignId);
  }, [campaignId, setActiveCampaignId]);

  const campaignSessions = sessions
    .filter((s) => s.campaignId === campaignId)
    .sort((a, b) => a.number - b.number);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');

  // Rename state — which session is being renamed (null = closed)
  const [editId, setEditId] = useState<string | null>(null);
  const editSession = editId ? campaignSessions.find((s) => s.id === editId) ?? null : null;

  const [sessionNumber, setSessionNumber] = useState(
    campaignSessions.length > 0
      ? Math.max(...campaignSessions.map((s) => s.number)) + 1
      : 1
  );

  // Update default session number when sessions change
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (campaignSessions.length > 0) {
      setSessionNumber(
        Math.max(...campaignSessions.map((s) => s.number)) + 1
      );
    } else {
      setSessionNumber(1);
    }
  }, [campaignSessions.length]); // eslint-disable-line react-hooks/exhaustive-deps
  /* eslint-enable react-hooks/set-state-in-effect */

  function handleCreate() {
    if (!title.trim()) return;
    addSession({
      campaignId,
      number: sessionNumber,
      title: title.trim(),
      notes: '',
      status: 'planned',
      checklist: [],
      sessionEncounters: [],
      linkedEncounterIds: [],
      linkedMapIds: [],
      linkedTreasureIds: [],
    });
    setTitle('');
    setDialogOpen(false);
  }

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

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Sessions"
        description={campaign.name}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 cursor-pointer">
              New Session
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Session</DialogTitle>
                <DialogDescription>
                  Add a new session to your campaign.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session-number">Session Number</Label>
                  <Input
                    id="session-number"
                    type="number"
                    min={1}
                    value={sessionNumber}
                    onChange={(e) => setSessionNumber(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-title">Title</Label>
                  <Input
                    id="session-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Into the Darkwood"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!title.trim()}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {campaignSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-lg text-muted-foreground">
            No sessions yet. Create your first session to start planning.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {campaignSessions.map((session) => (
            <div
              key={session.id}
              className="group flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <Link
                href={`/campaign/${campaignId}/session/${session.id}`}
                className="flex items-center gap-4 flex-1 min-w-0"
              >
                <span className="text-lg font-bold text-muted-foreground w-10 text-right">
                  #{session.number}
                </span>
                <div className="min-w-0">
                  <p className="font-medium truncate">{session.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-2 shrink-0 pl-3">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Rename session"
                  onClick={() => setEditId(session.id)}
                >
                  <Pencil />
                </Button>
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
              </div>
            </div>
          ))}
        </div>
      )}

      <SessionRenameDialog session={editSession} onClose={() => setEditId(null)} />
    </div>
  );
}
