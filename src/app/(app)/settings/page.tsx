'use client';

import { useState, useCallback, useRef } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useSettingsStore } from '@/stores/settings-store';
import { createProvider } from '@/lib/ai/provider';
import { downloadBackup, importBackup } from '@/lib/backup';
import { rehydrateAllStores } from '@/lib/store-registry';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { AIProviderType } from '@/types';

export default function SettingsPage() {
  const { aiSettings, updateAISettings } = useSettingsStore();

  const [provider, setProvider] = useState<AIProviderType>(aiSettings.provider);
  const [apiKey, setApiKey] = useState(aiSettings.apiKey);
  const [model, setModel] = useState(aiSettings.model);
  const [userContext, setUserContext] = useState(aiSettings.userContext);
  const [showKey, setShowKey] = useState(false);

  const [testStatus, setTestStatus] = useState<
    'idle' | 'testing' | 'success' | 'error'
  >('idle');
  const [testMessage, setTestMessage] = useState('');
  const [saved, setSaved] = useState(false);

  const modelPlaceholder =
    provider === 'claude'
      ? 'claude-sonnet-4-20250514'
      : provider === 'gemini'
        ? 'gemini-2.0-flash'
        : provider === 'openrouter'
          ? 'nvidia/nemotron-3-nano-30b-a3b:free'
          : 'gpt-4o';

  const handleTestConnection = useCallback(async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('Please enter an API key first.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('');

    try {
      const ai = createProvider(provider, apiKey.trim(), model.trim() || modelPlaceholder);
      let _response = '';
      await ai.sendMessage(
        [{ role: 'user', content: 'Hello' }],
        'Respond with exactly: Connection successful.',
        (chunk) => {
          _response += chunk;
        }
      );
      setTestStatus('success');
      setTestMessage('Connection successful! API key is valid.');
    } catch (err) {
      setTestStatus('error');
      setTestMessage(
        err instanceof Error ? err.message : 'Connection failed. Check your API key and try again.'
      );
    }
  }, [provider, apiKey, model, modelPlaceholder]);

  function handleSave() {
    updateAISettings({
      provider,
      apiKey: apiKey.trim(),
      model: model.trim() || modelPlaceholder,
      userContext: userContext.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Settings" />

      <div className="max-w-2xl space-y-6">
        {/* AI Provider */}
        <Card>
          <CardHeader>
            <CardTitle>AI Provider</CardTitle>
            <CardDescription>
              Configure which AI model to use for the assistant.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select
                value={provider}
                onValueChange={(v) => {
                  if (!v) return;
                  const p = v as AIProviderType;
                  setProvider(p);
                  if (p === 'claude' && (!model || !model.startsWith('claude'))) {
                    setModel('claude-sonnet-4-20250514');
                  } else if (p === 'openai' && (!model || !model.startsWith('gpt'))) {
                    setModel('gpt-4o');
                  } else if (p === 'gemini' && (!model || !model.startsWith('gemini'))) {
                    setModel('gemini-2.0-flash');
                  } else if (p === 'openrouter') {
                    setModel('nvidia/nemotron-3-nano-30b-a3b:free');
                  }
                }}
              >
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude">Claude (Anthropic)</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="gemini">Gemini (Google)</SelectItem>
                  <SelectItem value="openrouter">OpenRouter (Free Models)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    provider === 'claude'
                      ? 'sk-ant-...'
                      : provider === 'gemini'
                        ? 'AIza...'
                        : provider === 'openrouter'
                          ? 'sk-or-...'
                          : 'sk-...'
                  }
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowKey((s) => !s)}
                  className="shrink-0"
                >
                  {showKey ? 'Hide' : 'Show'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={modelPlaceholder}
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
              >
                {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
              </Button>
              {testStatus === 'success' && (
                <Badge variant="default" className="bg-green-600">
                  Success
                </Badge>
              )}
              {testStatus === 'error' && (
                <Badge variant="destructive">Error</Badge>
              )}
            </div>
            {testMessage && (
              <p
                className={`text-sm ${
                  testStatus === 'success'
                    ? 'text-green-600'
                    : testStatus === 'error'
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                }`}
              >
                {testMessage}
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              API keys are stored locally in your browser and never sent to our
              servers.
            </p>
          </CardContent>
        </Card>

        {/* User Context */}
        <Card>
          <CardHeader>
            <CardTitle>User Context</CardTitle>
            <CardDescription>
              This context will be included in all AI conversations. Add your
              preferred style, campaign themes, house rules, etc.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={userContext}
              onChange={(e) => setUserContext(e.target.value)}
              placeholder="e.g. My campaign is a dark fantasy setting. I prefer brief, atmospheric descriptions. We use milestone leveling..."
              rows={6}
            />
          </CardContent>
        </Card>

        {/* Backup & Restore */}
        <BackupRestoreCard />

        {/* Save */}
        <div className="flex items-center gap-3">
          <Button onClick={handleSave}>Save Settings</Button>
          {saved && (
            <span className="text-sm text-green-600">Settings saved!</span>
          )}
        </div>
      </div>
    </div>
  );
}

function BackupRestoreCard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [restoreMessage, setRestoreMessage] = useState('');

  function handleExport() {
    try {
      downloadBackup();
    } catch (err) {
      setRestoreStatus('error');
      setRestoreMessage(err instanceof Error ? err.message : 'Export failed');
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = importBackup(reader.result as string);
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

    // Reset file input so the same file can be selected again
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
            Download Backup
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
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
