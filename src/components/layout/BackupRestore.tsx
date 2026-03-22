'use client';

import { useState, useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { downloadBackup, importBackup } from '@/lib/backup';
import { rehydrateAllStores } from '@/lib/store-registry';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// ---------- Full card (for Settings, Home page) ----------

export function BackupRestoreCard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [restoreMessage, setRestoreMessage] = useState('');

  async function handleExport() {
    try {
      await downloadBackup();
    } catch (err) {
      setRestoreStatus('error');
      setRestoreMessage(err instanceof Error ? err.message : 'Export failed');
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = await importBackup(reader.result as string);
        rehydrateAllStores();
        setRestoreStatus('success');
        setRestoreMessage(
          `Restored ${result.storeCount} data stores from backup (originally from "${result.username}"). Page will reload in 2 seconds...`
        );
        setTimeout(() => window.location.reload(), 2000);
      } catch (err) {
        setRestoreStatus('error');
        setRestoreMessage(err instanceof Error ? err.message : 'Import failed');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup & Restore</CardTitle>
        <CardDescription>
          Download a backup of all your data or restore from a previous backup.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download data-icon="inline-start" />
            Download Backup
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload data-icon="inline-start" />
            Restore from Backup
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {restoreStatus !== 'idle' && (
          <p className={`text-sm ${
            restoreStatus === 'success' ? 'text-green-600' : 'text-destructive'
          }`}>
            {restoreMessage}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          Backups include all campaigns, sessions, NPCs, notes, encounters, maps,
          images, and settings. Restoring will overwrite your current data.
        </p>
      </CardContent>
    </Card>
  );
}

// ---------- Compact inline (for sidebar) ----------

interface BackupRestoreInlineProps {
  collapsed?: boolean;
}

export function BackupRestoreInline({ collapsed = false }: BackupRestoreInlineProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'exporting' | 'restoring' | 'success' | 'error'>('idle');

  async function handleExport() {
    setStatus('exporting');
    try {
      await downloadBackup();
      setStatus('idle');
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('restoring');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await importBackup(reader.result as string);
        rehydrateAllStores();
        setStatus('success');
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 2000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  if (collapsed) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="w-full"
          onClick={handleExport}
          disabled={status !== 'idle'}
          title="Download Backup"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={status !== 'idle'}
          title="Restore from Backup"
        >
          <Upload className="h-4 w-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileSelect}
        />
      </>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        className="w-full justify-start gap-3"
        onClick={handleExport}
        disabled={status !== 'idle'}
      >
        <Download className="h-4 w-4 shrink-0" />
        <span>{status === 'exporting' ? 'Exporting...' : 'Backup'}</span>
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start gap-3"
        onClick={() => fileInputRef.current?.click()}
        disabled={status !== 'idle'}
      >
        <Upload className="h-4 w-4 shrink-0" />
        <span>
          {status === 'restoring' ? 'Restoring...' : status === 'success' ? 'Restored!' : status === 'error' ? 'Failed' : 'Restore'}
        </span>
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileSelect}
      />
    </>
  );
}
