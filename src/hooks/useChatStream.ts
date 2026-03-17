import { useState, useRef, useCallback, useMemo } from 'react';
import { useChatStore } from '@/stores/chat-store';
import { useSettingsStore } from '@/stores/settings-store';
import { createProvider } from '@/lib/ai/provider';
import { buildContextualSystemPrompt, type ContextData } from '@/lib/ai/context-builder';
import type { ChatContext } from '@/types';

export function useChatStream(context: ChatContext, contextData: ContextData) {
  const conversations = useChatStore((s) => s.conversations);
  const addConversation = useChatStore((s) => s.addConversation);
  const addMessage = useChatStore((s) => s.addMessage);
  const aiSettings = useSettingsStore((s) => s.aiSettings);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const contextDataRef = useRef(contextData);
  contextDataRef.current = contextData;

  const { campaignId, type: contextType, sessionId, encounterId } = context;

  const contextConversations = useMemo(() => {
    return conversations
      .filter((c) => {
        if (c.campaignId !== campaignId) return false;
        if (contextType === 'campaign') return c.contextType === 'campaign';
        if (contextType === 'session')
          return c.contextType === 'session' && c.sessionId === sessionId;
        if (contextType === 'encounter')
          return c.contextType === 'encounter' && c.encounterId === encounterId;
        return false;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [conversations, campaignId, contextType, sessionId, encounterId]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId]
  );

  const createConversation = useCallback(() => {
    const id = addConversation({ type: contextType, campaignId, sessionId, encounterId }, 'New Conversation');
    setActiveConversationId(id);
    return id;
  }, [addConversation, contextType, campaignId, sessionId, encounterId]);

  const selectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  const deleteConv = useCallback((id: string) => {
    useChatStore.getState().deleteConversation(id);
    setActiveConversationId((prev) => {
      if (prev !== id) return prev;
      const remaining = useChatStore.getState().conversations.filter((c) => {
        if (c.id === id) return false;
        if (c.campaignId !== campaignId) return false;
        if (contextType === 'campaign') return c.contextType === 'campaign';
        if (contextType === 'session') return c.contextType === 'session' && c.sessionId === sessionId;
        if (contextType === 'encounter') return c.contextType === 'encounter' && c.encounterId === encounterId;
        return false;
      });
      return remaining[0]?.id ?? null;
    });
  }, [campaignId, contextType, sessionId, encounterId]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    let convId = activeConversationId;
    if (!convId) {
      convId = addConversation({ type: contextType, campaignId, sessionId, encounterId }, 'New Conversation');
      setActiveConversationId(convId);
    }

    const settings = useSettingsStore.getState().aiSettings;

    if (!settings.apiKey) {
      setError('No API key configured. Go to Settings to add your API key.');
      return;
    }

    setError(null);

    addMessage(convId, { role: 'user', content });

    // Build message history from fresh state
    const currentConv = useChatStore.getState().conversations.find((c) => c.id === convId);
    const history = [
      ...(currentConv?.messages ?? []).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content },
    ];

    const systemPrompt = buildContextualSystemPrompt({
      ...contextDataRef.current,
      userContext: settings.userContext,
    });

    setIsStreaming(true);
    setStreamingContent('');
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let fullContent = '';

    try {
      const provider = createProvider(settings.provider, settings.apiKey, settings.model);
      await provider.sendMessage(
        history,
        systemPrompt,
        (chunk) => {
          fullContent += chunk;
          setStreamingContent(fullContent);
        },
        controller.signal
      );

      addMessage(convId, { role: 'assistant', content: fullContent });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        if (fullContent) {
          addMessage(convId, {
            role: 'assistant',
            content: fullContent + '\n\n[Response cancelled]',
          });
        }
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      abortControllerRef.current = null;
    }
  }, [activeConversationId, addConversation, addMessage, contextType, campaignId, sessionId, encounterId]);

  return {
    contextConversations,
    activeConversation,
    activeConversationId,
    isStreaming,
    streamingContent,
    error,
    hasApiKey: Boolean(aiSettings.apiKey),
    sendMessage,
    cancel,
    createConversation,
    selectConversation,
    deleteConversation: deleteConv,
  };
}
