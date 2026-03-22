// ============================================================
// Nimble GM Toolkit — Domain Types
// ============================================================

// --- Campaign & Sessions ---

export interface Campaign {
  id: string;
  name: string;
  description: string;
  partySize: number;
  partyLevel: number;
  partyMembers: PartyMember[];
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  campaignId: string;
  number: number;
  title: string;
  notes: string;
  status: 'planned' | 'in-progress' | 'completed';
  partyLevelOverride?: number;
  checklist: ChecklistItem[];
  sessionEncounters: SessionEncounter[];
  linkedEncounterIds: string[];
  linkedMapIds: string[];
  linkedTreasureIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export type SessionEncounterType = 'battle' | 'skill-check' | 'npc-interaction';

export interface SessionEncounter {
  id: string;
  title: string;
  type: SessionEncounterType;
  description: string;
  notes?: string;
  linkedEncounterId?: string;
  imageId?: string;
  completed?: boolean;
}

// --- Party Members ---

export interface PartyMember {
  id: string;
  characterName: string;
  playerName: string;
  class: string;
  race: string;
  imageId?: string;
}

// --- AI Chat ---

export type AIProviderType = 'claude' | 'openai' | 'gemini' | 'openrouter';

export type ChatContextType = 'campaign' | 'session' | 'encounter';

export interface ChatContext {
  type: ChatContextType;
  campaignId: string;
  sessionId?: string;
  encounterId?: string;
}

export interface AISettings {
  provider: AIProviderType;
  apiKey: string;
  model: string;
  userContext: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  campaignId: string;
  contextType: ChatContextType;
  sessionId?: string;
  encounterId?: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// --- Maps & Pins ---

export type PinType = 'location' | 'npc' | 'encounter' | 'loot' | 'note';

export interface MapPin {
  id: string;
  mapId: string;
  x: number;
  y: number;
  title: string;
  description: string;
  pinType: PinType;
  visited?: boolean;
  showToPlayers?: boolean;
  linkedNpcId?: string;
  linkedSessionId?: string;
  linkedEncounterId?: string;
  linkedSubMapId?: string;
  linkedNoteId?: string;
}

export interface GameMap {
  id: string;
  campaignId: string;
  name: string;
  imageDataUri: string;
  imageId?: string;
  parentMapId?: string;
  pins: MapPin[];
  createdAt: string;
  updatedAt: string;
}

// --- Story Notes ---

export type NoteView = 'location' | 'timeline';
export type NoteTag = 'npc' | 'plot-hook' | 'secret' | 'lore' | 'encounter' | 'treasure';

export interface StoryNote {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  view: NoteView;
  locationName?: string;
  sessionNumber?: number;
  storyArc?: string;
  tags: NoteTag[];
  linkedNoteIds: string[];
  createdAt: string;
  updatedAt: string;
}

// --- NPCs ---

export interface NPC {
  id: string;
  campaignId: string;
  name: string;
  role: string;
  description: string;
  personality: string;
  notes: string;
  imageId?: string;
  linkedLocationNames: string[];
  linkedSessionIds: string[];
  createdAt: string;
  updatedAt: string;
}

// --- Encounters ---

export type DifficultyRating = 'easy' | 'medium' | 'hard' | 'deadly' | 'very-deadly';

export interface EncounterMonster {
  monsterId: string;
  name: string;
  level: number;
  count: number;
  isMinion: boolean;
}

export interface Encounter {
  id: string;
  campaignId: string;
  name: string;
  partySize: number;
  partyLevel: number;
  monsters: EncounterMonster[];
  difficulty: DifficultyRating;
  difficultyPercent: number;
  notes: string;
  imageId?: string;
  linkedSessionId?: string;
  linkedMapPinId?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Monsters ---

export type MonsterSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';
export type ArmorType = 'none' | 'medium' | 'heavy';

export interface MonsterAbility {
  name: string;
  description: string;
  actionType?: 'action' | 'bonus-action' | 'reaction' | 'passive';
}

export interface Monster {
  id: string;
  name: string;
  level: number;
  faction: string;
  size: MonsterSize;
  armorType: ArmorType;
  hp: number;
  saveDC?: number;
  specialMovement?: string;
  abilities: MonsterAbility[];
  isCustom: boolean;
  description: string;
  imageId?: string;
  imageDataUri?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Treasure ---

export type BoonTier = 'temporary' | 'minor' | 'major' | 'epic';

export interface Boon {
  id: string;
  name: string;
  tier: BoonTier;
  description: string;
  isCustom: boolean;
}

export interface TreasureEntry {
  id: string;
  name: string;
  description: string;
  goldValue: number;
  boonId?: string;
  isCustom: boolean;
  createdAt: string;
}

// --- Images ---

export type ImageCategory = 'map' | 'npc-portrait' | 'player-portrait' | 'scene' | 'handout';

export interface StoredImage {
  id: string;
  campaignId: string;
  name: string;
  category: ImageCategory;
  dataUri: string;
  sizeBytes: number;
  createdAt: string;
}

// --- Rules Reference ---

export interface Condition {
  name: string;
  description: string;
}

export interface CombatRule {
  title: string;
  content: string;
}

// --- Stats-by-Level Tables ---

export interface MonsterStatsByLevel {
  level: number;
  hp: number;
  armor: number;
  might: number;
  agility: number;
  intellect: number;
  charisma: number;
  damage: string;
}

export interface GoldByLevel {
  level: number;
  individual: number;
  hoard: number;
}
