import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from '@/lib/ai/context-builder';

describe('Context Builder', () => {
  it('should return base system prompt with no context', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('Game Master assistant');
    expect(prompt).toContain('Nimble');
    expect(prompt).not.toContain('Current Campaign');
    expect(prompt).not.toContain('GM Notes');
  });

  it('should include campaign context when provided', () => {
    const prompt = buildSystemPrompt('A dark fantasy campaign in the Shadowlands');
    expect(prompt).toContain('Game Master assistant');
    expect(prompt).toContain('Current Campaign');
    expect(prompt).toContain('Shadowlands');
  });

  it('should include user context when provided', () => {
    const prompt = buildSystemPrompt(undefined, 'I prefer gritty realism');
    expect(prompt).toContain('Game Master assistant');
    expect(prompt).toContain('GM Notes');
    expect(prompt).toContain('gritty realism');
  });

  it('should include both contexts when provided', () => {
    const prompt = buildSystemPrompt('Fantasy campaign', 'Low magic setting');
    expect(prompt).toContain('Current Campaign');
    expect(prompt).toContain('Fantasy campaign');
    expect(prompt).toContain('GM Notes');
    expect(prompt).toContain('Low magic setting');
  });
});
