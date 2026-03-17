import { ClaudeProvider } from './claude-provider';
import { OpenAIProvider } from './openai-provider';
import { GeminiProvider } from './gemini-provider';
import { OpenRouterProvider } from './openrouter-provider';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIProvider {
  name: string;
  sendMessage(
    messages: AIMessage[],
    systemPrompt: string,
    onChunk: (text: string) => void,
    signal?: AbortSignal
  ): Promise<void>;
}

export function createProvider(type: 'claude' | 'openai' | 'gemini' | 'openrouter', apiKey: string, model: string): AIProvider {
  switch (type) {
    case 'claude':
      return new ClaudeProvider(apiKey, model);
    case 'openai':
      return new OpenAIProvider(apiKey, model);
    case 'gemini':
      return new GeminiProvider(apiKey, model);
    case 'openrouter':
      return new OpenRouterProvider(apiKey, model);
    default:
      throw new Error(`Unknown provider: ${type}`);
  }
}
