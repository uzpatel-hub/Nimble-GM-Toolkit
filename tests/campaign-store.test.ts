import { describe, it, expect, beforeEach } from 'vitest';
import { useCampaignStore } from '@/stores/campaign-store';

describe('Campaign Store', () => {
  beforeEach(() => {
    useCampaignStore.setState({ campaigns: [], sessions: [], activeCampaignId: null });
  });

  describe('Campaign CRUD', () => {
    it('should add a campaign and return its id', () => {
      const id = useCampaignStore.getState().addCampaign({
        name: 'Test Campaign',
        description: 'A test',
        partySize: 4,
        partyLevel: 3,
        partyMembers: [],
      });
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      const campaigns = useCampaignStore.getState().campaigns;
      expect(campaigns).toHaveLength(1);
      expect(campaigns[0].name).toBe('Test Campaign');
      expect(campaigns[0].partySize).toBe(4);
      expect(campaigns[0].partyLevel).toBe(3);
      expect(campaigns[0].createdAt).toBeDefined();
      expect(campaigns[0].updatedAt).toBeDefined();
    });

    it('should update a campaign', () => {
      const id = useCampaignStore.getState().addCampaign({
        name: 'Old Name',
        description: '',
        partySize: 4,
        partyLevel: 1,
        partyMembers: [],
      });
      useCampaignStore.getState().updateCampaign(id, { name: 'New Name', partyLevel: 5 });
      const campaign = useCampaignStore.getState().campaigns[0];
      expect(campaign.name).toBe('New Name');
      expect(campaign.partyLevel).toBe(5);
    });

    it('should delete a campaign and its sessions', () => {
      const cId = useCampaignStore.getState().addCampaign({
        name: 'To Delete',
        description: '',
        partySize: 4,
        partyLevel: 1,
        partyMembers: [],
      });
      useCampaignStore.getState().addSession({
        campaignId: cId,
        number: 1,
        title: 'Session 1',
        notes: '',
        status: 'planned',
        checklist: [],
        sessionEncounters: [],
        linkedEncounterIds: [],
        linkedMapIds: [],
        linkedTreasureIds: [],
      });
      expect(useCampaignStore.getState().sessions).toHaveLength(1);

      useCampaignStore.getState().deleteCampaign(cId);
      expect(useCampaignStore.getState().campaigns).toHaveLength(0);
      expect(useCampaignStore.getState().sessions).toHaveLength(0);
    });

    it('should clear activeCampaignId when deleting the active campaign', () => {
      const id = useCampaignStore.getState().addCampaign({
        name: 'Active',
        description: '',
        partySize: 4,
        partyLevel: 1,
        partyMembers: [],
      });
      useCampaignStore.getState().setActiveCampaignId(id);
      expect(useCampaignStore.getState().activeCampaignId).toBe(id);

      useCampaignStore.getState().deleteCampaign(id);
      expect(useCampaignStore.getState().activeCampaignId).toBeNull();
    });
  });

  describe('Session CRUD', () => {
    it('should add a session', () => {
      const cId = useCampaignStore.getState().addCampaign({
        name: 'Campaign',
        description: '',
        partySize: 4,
        partyLevel: 1,
        partyMembers: [],
      });
      const sId = useCampaignStore.getState().addSession({
        campaignId: cId,
        number: 1,
        title: 'Session 1',
        notes: 'Notes here',
        status: 'planned',
        checklist: [],
        sessionEncounters: [],
        linkedEncounterIds: [],
        linkedMapIds: [],
        linkedTreasureIds: [],
      });
      expect(sId).toBeDefined();
      const sessions = useCampaignStore.getState().sessions;
      expect(sessions).toHaveLength(1);
      expect(sessions[0].title).toBe('Session 1');
      expect(sessions[0].campaignId).toBe(cId);
    });

    it('should update a session', () => {
      const cId = useCampaignStore.getState().addCampaign({
        name: 'Campaign',
        description: '',
        partySize: 4,
        partyLevel: 1,
        partyMembers: [],
      });
      const sId = useCampaignStore.getState().addSession({
        campaignId: cId,
        number: 1,
        title: 'Old Title',
        notes: '',
        status: 'planned',
        checklist: [],
        sessionEncounters: [],
        linkedEncounterIds: [],
        linkedMapIds: [],
        linkedTreasureIds: [],
      });
      useCampaignStore.getState().updateSession(sId, { title: 'New Title', status: 'completed' });
      const session = useCampaignStore.getState().sessions[0];
      expect(session.title).toBe('New Title');
      expect(session.status).toBe('completed');
    });

    it('should delete a session', () => {
      const cId = useCampaignStore.getState().addCampaign({
        name: 'Campaign',
        description: '',
        partySize: 4,
        partyLevel: 1,
        partyMembers: [],
      });
      const sId = useCampaignStore.getState().addSession({
        campaignId: cId,
        number: 1,
        title: 'To Delete',
        notes: '',
        status: 'planned',
        checklist: [],
        sessionEncounters: [],
        linkedEncounterIds: [],
        linkedMapIds: [],
        linkedTreasureIds: [],
      });
      useCampaignStore.getState().deleteSession(sId);
      expect(useCampaignStore.getState().sessions).toHaveLength(0);
    });
  });

  describe('Active Campaign', () => {
    it('should set and get active campaign id', () => {
      const id = useCampaignStore.getState().addCampaign({
        name: 'Active',
        description: '',
        partySize: 4,
        partyLevel: 1,
        partyMembers: [],
      });
      useCampaignStore.getState().setActiveCampaignId(id);
      expect(useCampaignStore.getState().activeCampaignId).toBe(id);
    });

    it('should set active campaign id to null', () => {
      useCampaignStore.getState().setActiveCampaignId(null);
      expect(useCampaignStore.getState().activeCampaignId).toBeNull();
    });
  });
});
