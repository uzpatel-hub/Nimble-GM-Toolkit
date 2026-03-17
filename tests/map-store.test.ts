import { describe, it, expect, beforeEach } from 'vitest';
import { useMapStore } from '@/stores/map-store';

describe('Map Store', () => {
  beforeEach(() => {
    useMapStore.setState({ maps: [] });
  });

  it('should add a map with empty pins', () => {
    const id = useMapStore.getState().addMap({
      campaignId: 'camp-1',
      name: 'Dungeon Level 1',
      imageDataUri: 'data:image/png;base64,abc',
    });
    expect(id).toBeDefined();
    const maps = useMapStore.getState().maps;
    expect(maps).toHaveLength(1);
    expect(maps[0].name).toBe('Dungeon Level 1');
    expect(maps[0].pins).toEqual([]);
  });

  it('should add a pin to a map', () => {
    const mapId = useMapStore.getState().addMap({
      campaignId: 'camp-1',
      name: 'Test Map',
      imageDataUri: 'data:image/png;base64,abc',
    });
    const pinId = useMapStore.getState().addPin(mapId, {
      mapId: mapId,
      x: 100,
      y: 200,
      title: 'Dragon Lair',
      description: 'Dangerous!',
      pinType: 'encounter',
    });
    expect(pinId).toBeDefined();
    const map = useMapStore.getState().maps[0];
    expect(map.pins).toHaveLength(1);
    expect(map.pins[0].title).toBe('Dragon Lair');
    expect(map.pins[0].x).toBe(100);
    expect(map.pins[0].y).toBe(200);
    expect(map.pins[0].pinType).toBe('encounter');
  });

  it('should update a pin', () => {
    const mapId = useMapStore.getState().addMap({
      campaignId: 'camp-1',
      name: 'Test Map',
      imageDataUri: 'data:image/png;base64,abc',
    });
    const pinId = useMapStore.getState().addPin(mapId, {
      mapId: mapId,
      x: 50,
      y: 50,
      title: 'Old Title',
      description: '',
      pinType: 'location',
    });
    useMapStore.getState().updatePin(mapId, pinId, { title: 'New Title', pinType: 'npc' });
    const pin = useMapStore.getState().maps[0].pins[0];
    expect(pin.title).toBe('New Title');
    expect(pin.pinType).toBe('npc');
  });

  it('should delete a pin', () => {
    const mapId = useMapStore.getState().addMap({
      campaignId: 'camp-1',
      name: 'Test Map',
      imageDataUri: 'data:image/png;base64,abc',
    });
    const pinId = useMapStore.getState().addPin(mapId, {
      mapId: mapId,
      x: 0,
      y: 0,
      title: 'To Delete',
      description: '',
      pinType: 'note',
    });
    useMapStore.getState().deletePin(mapId, pinId);
    expect(useMapStore.getState().maps[0].pins).toHaveLength(0);
  });

  it('should delete a map', () => {
    const id = useMapStore.getState().addMap({
      campaignId: 'camp-1',
      name: 'To Delete',
      imageDataUri: 'data:image/png;base64,abc',
    });
    useMapStore.getState().deleteMap(id);
    expect(useMapStore.getState().maps).toHaveLength(0);
  });
});
