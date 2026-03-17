import { describe, it, expect, beforeEach } from 'vitest';
import { useNotesStore } from '@/stores/notes-store';

describe('Notes Store', () => {
  beforeEach(() => {
    useNotesStore.setState({ notes: [] });
  });

  it('should add a location note', () => {
    const id = useNotesStore.getState().addNote({
      campaignId: 'camp-1',
      title: 'The Broken Tower',
      content: 'An ancient watchtower, crumbling but still standing.',
      view: 'location',
      locationName: 'Eastern Frontier',
      tags: ['lore', 'plot-hook'],
      linkedNoteIds: [],
    });
    expect(id).toBeDefined();
    const notes = useNotesStore.getState().notes;
    expect(notes).toHaveLength(1);
    expect(notes[0].view).toBe('location');
    expect(notes[0].tags).toContain('lore');
  });

  it('should add a timeline note', () => {
    const id = useNotesStore.getState().addNote({
      campaignId: 'camp-1',
      title: 'The Ambush',
      content: 'Goblins attacked the caravan.',
      view: 'timeline',
      sessionNumber: 3,
      storyArc: 'The Goblin Menace',
      tags: ['encounter'],
      linkedNoteIds: [],
    });
    const note = useNotesStore.getState().notes[0];
    expect(note.view).toBe('timeline');
    expect(note.sessionNumber).toBe(3);
    expect(note.storyArc).toBe('The Goblin Menace');
  });

  it('should update a note', () => {
    const id = useNotesStore.getState().addNote({
      campaignId: 'camp-1',
      title: 'Draft',
      content: 'WIP',
      view: 'location',
      tags: [],
      linkedNoteIds: [],
    });
    useNotesStore.getState().updateNote(id, { title: 'Final', content: 'Complete text here.', tags: ['secret'] });
    const note = useNotesStore.getState().notes[0];
    expect(note.title).toBe('Final');
    expect(note.content).toBe('Complete text here.');
    expect(note.tags).toContain('secret');
  });

  it('should delete a note', () => {
    const id = useNotesStore.getState().addNote({
      campaignId: 'camp-1',
      title: 'To Delete',
      content: '',
      view: 'location',
      tags: [],
      linkedNoteIds: [],
    });
    useNotesStore.getState().deleteNote(id);
    expect(useNotesStore.getState().notes).toHaveLength(0);
  });
});
