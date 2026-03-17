import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from '@/stores/chat-store';
import type { ChatContext } from '@/types';

const ctx1: ChatContext = { type: 'campaign', campaignId: 'campaign-1' };
const ctx2: ChatContext = { type: 'campaign', campaignId: 'campaign-2' };

describe('Chat Store', () => {
  beforeEach(() => {
    useChatStore.setState({ conversations: [] });
  });

  it('should add a conversation', () => {
    const id = useChatStore.getState().addConversation(ctx1, 'Test Chat');
    expect(id).toBeDefined();
    const convos = useChatStore.getState().conversations;
    expect(convos).toHaveLength(1);
    expect(convos[0].title).toBe('Test Chat');
    expect(convos[0].campaignId).toBe('campaign-1');
    expect(convos[0].messages).toEqual([]);
  });

  it('should add a message to a conversation', () => {
    const cId = useChatStore.getState().addConversation(ctx1, 'Chat');
    useChatStore.getState().addMessage(cId, { role: 'user', content: 'Hello' });
    useChatStore.getState().addMessage(cId, { role: 'assistant', content: 'Hi there!' });

    const convo = useChatStore.getState().conversations[0];
    expect(convo.messages).toHaveLength(2);
    expect(convo.messages[0].role).toBe('user');
    expect(convo.messages[0].content).toBe('Hello');
    expect(convo.messages[1].role).toBe('assistant');
    expect(convo.messages[1].content).toBe('Hi there!');
  });

  it('should delete a conversation', () => {
    const id = useChatStore.getState().addConversation(ctx1, 'To Delete');
    useChatStore.getState().deleteConversation(id);
    expect(useChatStore.getState().conversations).toHaveLength(0);
  });

  it('should get conversations by campaign', () => {
    useChatStore.getState().addConversation(ctx1, 'Chat A');
    useChatStore.getState().addConversation(ctx2, 'Chat B');
    useChatStore.getState().addConversation(ctx1, 'Chat C');

    const result = useChatStore.getState().getConversationsByCampaign('campaign-1');
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Chat A');
    expect(result[1].title).toBe('Chat C');
  });
});
