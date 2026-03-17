import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from '@/stores/settings-store';

describe('Settings Store', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      aiSettings: {
        provider: 'claude',
        apiKey: '',
        model: 'claude-sonnet-4-20250514',
        userContext: '',
      },
    });
  });

  it('should have default settings', () => {
    const settings = useSettingsStore.getState().aiSettings;
    expect(settings.provider).toBe('claude');
    expect(settings.apiKey).toBe('');
    expect(settings.model).toBe('claude-sonnet-4-20250514');
    expect(settings.userContext).toBe('');
  });

  it('should update provider', () => {
    useSettingsStore.getState().updateAISettings({ provider: 'openai', model: 'gpt-4o' });
    const settings = useSettingsStore.getState().aiSettings;
    expect(settings.provider).toBe('openai');
    expect(settings.model).toBe('gpt-4o');
    // apiKey should remain unchanged
    expect(settings.apiKey).toBe('');
  });

  it('should update api key', () => {
    useSettingsStore.getState().updateAISettings({ apiKey: 'sk-test-123' });
    expect(useSettingsStore.getState().aiSettings.apiKey).toBe('sk-test-123');
  });

  it('should update user context', () => {
    useSettingsStore.getState().updateAISettings({ userContext: 'Dark fantasy campaign, low magic setting.' });
    expect(useSettingsStore.getState().aiSettings.userContext).toBe('Dark fantasy campaign, low magic setting.');
  });

  it('should merge partial updates without losing other fields', () => {
    useSettingsStore.getState().updateAISettings({ apiKey: 'my-key' });
    useSettingsStore.getState().updateAISettings({ userContext: 'Some context' });
    const settings = useSettingsStore.getState().aiSettings;
    expect(settings.apiKey).toBe('my-key');
    expect(settings.userContext).toBe('Some context');
    expect(settings.provider).toBe('claude');
  });
});
