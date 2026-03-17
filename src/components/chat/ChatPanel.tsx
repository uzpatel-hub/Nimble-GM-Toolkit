'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import { MessageSquare, X } from 'lucide-react';
import { useChatStream } from '@/hooks/useChatStream';
import { MessageContent } from '@/components/chat/MessageContent';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { useNotesStore } from '@/stores/notes-store';
import { useNpcStore } from '@/stores/npc-store';
import type { ChatContext, ChatMessage, Campaign, Session, Encounter, Monster } from '@/types';
import type { ContextData } from '@/lib/ai/context-builder';

export interface ChatAction {
  label: string;
  onClick: (messageContent: string) => void;
}

interface ChatPanelProps {
  context: ChatContext;
  campaign: Campaign;
  session?: Session;
  encounter?: Encounter;
  encounterMonsters?: Monster[];
  chatHistorySummary?: string;
  extraActions?: ChatAction[];
}

const PanelBubble = memo(function PanelBubble({
  msg,
  actions,
}: {
  msg: ChatMessage;
  actions: ChatAction[];
}) {
  return (
    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[90%] rounded-lg px-3 py-2 ${
          msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}
      >
        <div className="text-base">
          {msg.role === 'user' ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <MessageContent content={msg.content} />
          )}
        </div>
        {msg.role === 'assistant' && actions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 pt-1.5 border-t border-border/50">
            {actions.map((action) => (
              <Button
                key={action.label}
                variant="ghost"
                size="sm"
                className="h-5 text-[10px] px-1.5"
                onClick={() => action.onClick(msg.content)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export function ChatPanel({
  context,
  campaign,
  session,
  encounter,
  encounterMonsters,
  chatHistorySummary,
  extraActions,
}: ChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [panelSize, setPanelSize] = useState<'sm' | 'md' | 'lg'>('md');

  // Save dialogs
  const [saveNoteOpen, setSaveNoteOpen] = useState(false);
  const [saveNpcOpen, setSaveNpcOpen] = useState(false);
  const [saveContent, setSaveContent] = useState('');
  const [saveTitle, setSaveTitle] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contextData: ContextData = {
    campaign,
    session,
    encounter,
    encounterMonsters,
    chatHistorySummary,
  };

  const {
    contextConversations,
    activeConversation,
    activeConversationId,
    isStreaming,
    streamingContent,
    error,
    hasApiKey,
    sendMessage,
    cancel,
    createConversation,
    selectConversation,
    deleteConversation,
  } = useChatStream(context, contextData);

  // Auto-select first conversation when opening
  useEffect(() => {
    if (open && !activeConversationId && contextConversations.length > 0) {
      selectConversation(contextConversations[0].id);
    }
  }, [open, activeConversationId, contextConversations, selectConversation]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages.length, streamingContent, scrollToBottom]);

  function handleSend() {
    if (!input.trim() || isStreaming) return;
    const msg = input.trim();
    setInput('');
    sendMessage(msg);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const openSaveNote = useCallback((content: string) => {
    setSaveContent(content);
    setSaveTitle('');
    setSaveNoteOpen(true);
  }, []);

  const openSaveNpc = useCallback((content: string) => {
    setSaveContent(content);
    setSaveTitle('');
    setSaveNpcOpen(true);
  }, []);

  // Build action list for bubbles
  const bubbleActions: ChatAction[] = [
    { label: 'Save as Note', onClick: openSaveNote },
    { label: 'Save as NPC', onClick: openSaveNpc },
    ...(extraActions ?? []),
  ];

  const contextLabel =
    context.type === 'campaign' ? 'Campaign'
    : context.type === 'session' ? `Session`
    : 'Encounter';

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-3 shadow-lg hover:bg-primary/90 transition-colors"
      >
        <MessageSquare className="size-5" />
        <span className="text-sm font-medium">AI Chat</span>
      </button>

      {/* Non-modal side panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full flex flex-col bg-background border-l shadow-xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          width: panelSize === 'sm' ? '400px' : panelSize === 'md' ? '560px' : '50vw',
        }}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-2 border-b shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{contextLabel} Chat</h2>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {(['sm', 'md', 'lg'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setPanelSize(size)}
                    className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
                      panelSize === size
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground border-border hover:bg-muted'
                    }`}
                  >
                    {size === 'sm' ? 'S' : size === 'md' ? 'M' : 'L'}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <select
              value={activeConversationId ?? ''}
              onChange={(e) => {
                if (e.target.value) selectConversation(e.target.value);
              }}
              className="flex-1 rounded-md border bg-background px-2 py-1 text-xs"
            >
              {contextConversations.length === 0 && (
                <option value="">No conversations</option>
              )}
              {contextConversations.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.messages.length} msgs)
                </option>
              ))}
            </select>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={createConversation}>
              New
            </Button>
            {activeConversationId && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => deleteConversation(activeConversationId)}
              >
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
          {!hasApiKey ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  No API key configured.
                </p>
                <Link href="/settings">
                  <Button variant="outline" size="sm">Go to Settings</Button>
                </Link>
              </div>
            </div>
          ) : !activeConversation ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Start a conversation to chat with your AI co-GM.
                </p>
                <Button size="sm" onClick={createConversation}>New Conversation</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {activeConversation.messages.length === 0 && !isStreaming && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  {context.type === 'campaign' && 'Ask about campaign arcs, world building, plot hooks...'}
                  {context.type === 'session' && 'Plan this session — encounters, pacing, read-aloud text...'}
                  {context.type === 'encounter' && 'Get help with tactics, monster choices, terrain ideas...'}
                </p>
              )}

              {activeConversation.messages.map((msg) => (
                <PanelBubble key={msg.id} msg={msg} actions={bubbleActions} />
              ))}

              {isStreaming && streamingContent && (
                <div className="flex justify-start">
                  <div className="max-w-[90%] rounded-lg px-3 py-2 bg-muted">
                    <div className="text-sm">
                      <MessageContent content={streamingContent} />
                    </div>
                  </div>
                </div>
              )}

              {isStreaming && !streamingContent && (
                <div className="flex justify-start">
                  <div className="rounded-lg px-3 py-2 bg-muted">
                    <p className="text-xs text-muted-foreground animate-pulse">Thinking...</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-1.5 bg-destructive/10 text-destructive text-xs border-t">
            {error}
          </div>
        )}

        {/* Input */}
        {hasApiKey && (
          <div className="border-t px-4 py-3 shrink-0">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your AI co-GM..."
                rows={2}
                className="resize-none flex-1 text-sm"
                disabled={isStreaming}
              />
              {isStreaming ? (
                <Button variant="destructive" size="sm" onClick={cancel} className="self-end">
                  Cancel
                </Button>
              ) : (
                <Button size="sm" onClick={handleSend} disabled={!input.trim()} className="self-end">
                  Send
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Save as Note Dialog */}
      <Dialog open={saveNoteOpen} onOpenChange={setSaveNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Note</DialogTitle>
            <DialogDescription>Save this response as a story note.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="panel-note-title">Title</Label>
              <Input
                id="panel-note-title"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="Note title..."
              />
            </div>
            <div className="max-h-32 overflow-y-auto rounded border p-2 text-xs text-muted-foreground">
              {saveContent.slice(0, 500)}
              {saveContent.length > 500 && '...'}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveNoteOpen(false)}>Cancel</Button>
            <SaveNoteButton
              campaignId={context.campaignId}
              title={saveTitle}
              content={saveContent}
              onDone={() => setSaveNoteOpen(false)}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save as NPC Dialog */}
      <Dialog open={saveNpcOpen} onOpenChange={setSaveNpcOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as NPC</DialogTitle>
            <DialogDescription>Save this response as an NPC.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="panel-npc-name">NPC Name</Label>
              <Input
                id="panel-npc-name"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="NPC name..."
              />
            </div>
            <div className="max-h-32 overflow-y-auto rounded border p-2 text-xs text-muted-foreground">
              {saveContent.slice(0, 500)}
              {saveContent.length > 500 && '...'}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveNpcOpen(false)}>Cancel</Button>
            <SaveNpcButton
              campaignId={context.campaignId}
              name={saveTitle}
              content={saveContent}
              onDone={() => setSaveNpcOpen(false)}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SaveNoteButton({ campaignId, title, content, onDone }: {
  campaignId: string; title: string; content: string; onDone: () => void;
}) {
  const { addNote } = useNotesStore();
  return (
    <Button
      disabled={!title.trim()}
      onClick={() => {
        addNote({
          campaignId,
          title: title.trim(),
          content,
          view: 'location' as const,
          tags: [],
          linkedNoteIds: [],
        });
        onDone();
      }}
    >
      Save Note
    </Button>
  );
}

function SaveNpcButton({ campaignId, name, content, onDone }: {
  campaignId: string; name: string; content: string; onDone: () => void;
}) {
  const { addNpc } = useNpcStore();
  return (
    <Button
      disabled={!name.trim()}
      onClick={() => {
        addNpc({
          campaignId,
          name: name.trim(),
          role: '',
          description: content,
          personality: '',
          notes: '',
          linkedLocationNames: [],
          linkedSessionIds: [],
        });
        onDone();
      }}
    >
      Save NPC
    </Button>
  );
}
