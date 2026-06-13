'use client';

import { useState } from 'react';
import { useCampaignStore } from '@/stores/campaign-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Session } from '@/types';

/**
 * Rename dialog for a session (title + number).
 * Controlled by passing the `session` to edit; pass `null` to close.
 */
export function SessionRenameDialog({
  session,
  onClose,
}: {
  session: Session | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!session} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Session</DialogTitle>
          <DialogDescription>Update the session number and title.</DialogDescription>
        </DialogHeader>
        {/* Keyed by id so the form re-initializes when a different session opens. */}
        {session && <RenameForm key={session.id} session={session} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function RenameForm({ session, onClose }: { session: Session; onClose: () => void }) {
  const updateSession = useCampaignStore((s) => s.updateSession);
  const [title, setTitle] = useState(session.title);
  const [number, setNumber] = useState(session.number);

  function handleSave() {
    if (!title.trim()) return;
    updateSession(session.id, {
      title: title.trim(),
      number: Math.max(1, Math.floor(number) || 1),
    });
    onClose();
  }

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rename-session-number">Session Number</Label>
          <Input
            id="rename-session-number"
            type="number"
            min={1}
            value={number}
            onChange={(e) => setNumber(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rename-session-title">Title</Label>
          <Input
            id="rename-session-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Into the Darkwood"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
              }
            }}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!title.trim()}>
          Save Changes
        </Button>
      </DialogFooter>
    </>
  );
}
