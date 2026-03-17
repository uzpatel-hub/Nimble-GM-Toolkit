'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCampaignStore } from '@/stores/campaign-store';
import { useChatStore } from '@/stores/chat-store';
import { useSettingsStore } from '@/stores/settings-store';
import { useNpcStore } from '@/stores/npc-store';
import { useNotesStore } from '@/stores/notes-store';
import { createProvider } from '@/lib/ai/provider';
import { buildSystemPrompt } from '@/lib/ai/context-builder';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MessageContent } from '@/components/chat/MessageContent';
import type { ChatMessage } from '@/types';

const ChatBubble = memo(function ChatBubble({
  msg,
  onSaveAsNote,
  onSaveAsNpc,
}: {
  msg: ChatMessage;
  onSaveAsNote: (content: string) => void;
  onSaveAsNpc: (content: string) => void;
}) {
  return (
    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}
      >
        <div className="text-lg">
          {msg.role === 'user' ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <MessageContent content={msg.content} />
          )}
        </div>
        {msg.role === 'assistant' && (
          <div className="flex gap-2 mt-2 pt-2 border-t border-border/50">
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => onSaveAsNote(msg.content)}>
              Save as Note
            </Button>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => onSaveAsNpc(msg.content)}>
              Save as NPC
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const campaignId = params.id;

  const { campaigns } = useCampaignStore();
  const {
    conversations,
    addConversation,
    addMessage,
    deleteConversation,
  } = useChatStore();
  const { aiSettings } = useSettingsStore();
  const { addNpc } = useNpcStore();
  const { addNote } = useNotesStore();

  const campaign = campaigns.find((c) => c.id === campaignId);
  const campaignConversations = conversations
    .filter((c) => c.campaignId === campaignId && (c.contextType === 'campaign' || !c.contextType))
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(campaignConversations[0]?.id ?? null);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Save-as dialogs
  const [saveAsNoteOpen, setSaveAsNoteOpen] = useState(false);
  const [saveAsNpcOpen, setSaveAsNpcOpen] = useState(false);
  const [saveContent, setSaveContent] = useState('');
  const [saveTitle, setSaveTitle] = useState('');

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages.length, streamingContent, scrollToBottom]);

  // Sync activeConversationId if conversations change
  useEffect(() => {
    if (
      activeConversationId &&
      !conversations.find((c) => c.id === activeConversationId)
    ) {
      setActiveConversationId(campaignConversations[0]?.id ?? null);
    }
  }, [conversations, activeConversationId, campaignConversations]);

  function handleNewConversation() {
    const id = addConversation({ type: 'campaign', campaignId }, 'New Conversation');
    setActiveConversationId(id);
  }

  function handleDeleteConversation(id: string) {
    deleteConversation(id);
    if (activeConversationId === id) {
      const remaining = campaignConversations.filter((c) => c.id !== id);
      setActiveConversationId(remaining[0]?.id ?? null);
    }
  }

  function handleCancel() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsStreaming(false);
  }

  async function handleSend() {
    if (!input.trim() || !activeConversationId || isStreaming) return;

    if (!aiSettings.apiKey) {
      setError(
        'No API key configured. Please go to Settings to add your API key.'
      );
      return;
    }

    setError(null);
    const userMessage = input.trim();
    setInput('');

    // Add user message to store
    addMessage(activeConversationId, {
      role: 'user',
      content: userMessage,
    });

    // Build messages history for the API
    const currentConv = conversations.find(
      (c) => c.id === activeConversationId
    );
    const history = [
      ...(currentConv?.messages ?? []).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: userMessage },
    ];

    // Build system prompt with campaign context
    let campaignContext: string | undefined;
    if (campaign) {
      const lines = [
        `Campaign: ${campaign.name}`,
        `Description: ${campaign.description}`,
        `Party: ${campaign.partyMembers?.length || campaign.partySize} players at level ${campaign.partyLevel}`,
      ];
      if (campaign.partyMembers?.length) {
        lines.push('Party Members:');
        for (const m of campaign.partyMembers) {
          const details = [m.race, m.class].filter(Boolean).join(' ');
          lines.push(`- ${m.characterName} (${details || 'no class/race'}) — played by ${m.playerName}`);
        }
      }
      campaignContext = lines.join('\n');
    }
    const systemPrompt = buildSystemPrompt(
      campaignContext,
      aiSettings.userContext
    );

    // Stream the response
    setIsStreaming(true);
    setStreamingContent('');
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let fullContent = '';

    try {
      const provider = createProvider(
        aiSettings.provider,
        aiSettings.apiKey,
        aiSettings.model
      );
      await provider.sendMessage(
        history,
        systemPrompt,
        (chunk) => {
          fullContent += chunk;
          setStreamingContent(fullContent);
        },
        controller.signal
      );

      // Add assistant message to store
      addMessage(activeConversationId, {
        role: 'assistant',
        content: fullContent,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User cancelled; save partial content if any
        if (fullContent) {
          addMessage(activeConversationId, {
            role: 'assistant',
            content: fullContent + '\n\n[Response cancelled]',
          });
        }
      } else {
        const message =
          err instanceof Error ? err.message : 'An error occurred';
        setError(message);
      }
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      abortControllerRef.current = null;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const openSaveAsNote = useCallback((content: string) => {
    setSaveContent(content);
    setSaveTitle('');
    setSaveAsNoteOpen(true);
  }, []);

  const openSaveAsNpc = useCallback((content: string) => {
    setSaveContent(content);
    setSaveTitle('');
    setSaveAsNpcOpen(true);
  }, []);

  function handleSaveNote() {
    if (!saveTitle.trim()) return;
    addNote({
      campaignId,
      title: saveTitle.trim(),
      content: saveContent,
      view: 'location',
      tags: [],
      linkedNoteIds: [],
    });
    setSaveAsNoteOpen(false);
  }

  function handleSaveNpc() {
    if (!saveTitle.trim()) return;
    addNpc({
      campaignId,
      name: saveTitle.trim(),
      role: '',
      description: saveContent,
      personality: '',
      notes: '',
      linkedLocationNames: [],
      linkedSessionIds: [],
    });
    setSaveAsNpcOpen(false);
  }

  const hasApiKey = Boolean(aiSettings.apiKey);

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Sidebar - Conversation List */}
      <div className="w-64 shrink-0 border-r flex flex-col">
        <div className="p-3 border-b">
          <Button
            onClick={handleNewConversation}
            className="w-full"
            size="sm"
          >
            New Conversation
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {campaignConversations.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No conversations yet
              </p>
            ) : (
              campaignConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center justify-between rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-muted/50 ${
                    activeConversationId === conv.id
                      ? 'bg-muted'
                      : ''
                  }`}
                  onClick={() => setActiveConversationId(conv.id)}
                >
                  <span className="truncate flex-1">{conv.title}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conv.id);
                    }}
                  >
                    x
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 border-b">
          <PageHeader
            title={activeConversation?.title ?? 'AI Story Chat'}
            description={campaign?.name}
          />
        </div>

        {!hasApiKey ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center space-y-3">
              <p className="text-muted-foreground">
                No API key configured. Add your API key in settings to start
                chatting.
              </p>
              <Link href="/settings">
                <Button variant="outline">Go to Settings</Button>
              </Link>
            </div>
          </div>
        ) : !activeConversation ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center space-y-3">
              <p className="text-muted-foreground">
                Start a new conversation to chat with your AI co-GM.
              </p>
              <Button onClick={handleNewConversation}>
                New Conversation
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              <div className="max-w-3xl mx-auto space-y-4">
                {activeConversation.messages.length === 0 &&
                  !isStreaming && (
                    <p className="text-center text-muted-foreground py-12">
                      Send a message to start the conversation. Try asking
                      for plot hooks, NPC ideas, or encounter suggestions.
                    </p>
                  )}

                {activeConversation.messages.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    msg={msg}
                    onSaveAsNote={openSaveAsNote}
                    onSaveAsNpc={openSaveAsNpc}
                  />
                ))}

                {/* Streaming message */}
                {isStreaming && streamingContent && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg px-4 py-3 bg-muted">
                      <div className="text-lg">
                        <MessageContent content={streamingContent} />
                      </div>
                    </div>
                  </div>
                )}

                {isStreaming && !streamingContent && (
                  <div className="flex justify-start">
                    <div className="rounded-lg px-4 py-3 bg-muted">
                      <p className="text-sm text-muted-foreground animate-pulse">
                        Thinking...
                      </p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm border-t">
                {error}
              </div>
            )}

            {/* Input */}
            <div className="border-t p-4">
              <div className="max-w-3xl mx-auto flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe what you need help with..."
                  rows={2}
                  className="resize-none flex-1 text-lg"
                  disabled={isStreaming}
                />
                {isStreaming ? (
                  <Button
                    variant="destructive"
                    onClick={handleCancel}
                    className="self-end"
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="self-end"
                  >
                    Send
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Save as Note Dialog */}
      <Dialog open={saveAsNoteOpen} onOpenChange={setSaveAsNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Note</DialogTitle>
            <DialogDescription>
              Save this AI response as a story note in your campaign.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="Note title..."
              />
            </div>
            <div className="max-h-40 overflow-y-auto rounded border p-2 text-sm text-muted-foreground">
              {saveContent.slice(0, 500)}
              {saveContent.length > 500 && '...'}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveAsNoteOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveNote} disabled={!saveTitle.trim()}>
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save as NPC Dialog */}
      <Dialog open={saveAsNpcOpen} onOpenChange={setSaveAsNpcOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as NPC</DialogTitle>
            <DialogDescription>
              Save this AI response as an NPC in your campaign.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="npc-name">NPC Name</Label>
              <Input
                id="npc-name"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="NPC name..."
              />
            </div>
            <div className="max-h-40 overflow-y-auto rounded border p-2 text-sm text-muted-foreground">
              {saveContent.slice(0, 500)}
              {saveContent.length > 500 && '...'}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveAsNpcOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveNpc} disabled={!saveTitle.trim()}>
              Save NPC
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
