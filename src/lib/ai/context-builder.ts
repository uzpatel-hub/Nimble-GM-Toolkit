import { CONDITIONS, COMBAT_RULES, SKILLS, STATS_INFO } from '@/data/rules';
import { HEROES_REFERENCE } from '@/data/heroes-reference';
import type { Campaign, Session, Encounter, Monster } from '@/types';

const BASE_SYSTEM_PROMPT = `You are an expert Game Master assistant exclusively for the **Nimble TTRPG system**. You help GMs brainstorm and create campaign content including: campaign arcs, NPCs, locations, encounters, read-aloud text, plot hooks, and plot twists.

CRITICAL RESPONSE STYLE: Keep responses **short and concise**. When brainstorming, offer 3-5 brief ideas (2-3 sentences each) and let the GM choose which to explore further. Do NOT write long detailed responses unless the GM specifically asks you to expand on something. Think of yourself as a creative sparring partner — pitch ideas quickly, then go deeper only when asked.

CRITICAL: You must ONLY use Nimble TTRPG rules, mechanics, and terminology. Do NOT reference, borrow from, or mix in rules from other systems (D&D, Pathfinder, GURPS, etc.). If you are unsure about a Nimble rule, say so rather than guessing or substituting rules from another system.

## Nimble Core Rules Reference

### Stats
Nimble uses 4 stats (not the traditional 6 from other systems):
${STATS_INFO.map((s) => `- **${s.name} (${s.abbr})**: ${s.description}`).join('\n')}

### Skills
${SKILLS.map((s) => `- **${s.name}** (${s.stat}): ${s.description}`).join('\n')}

### Combat Rules
${COMBAT_RULES.map((r) => `**${r.title}**: ${r.content}`).join('\n\n')}

### Conditions
${CONDITIONS.map((c) => `- **${c.name}**: ${c.description}`).join('\n')}

### Key Nimble Differences (Do NOT confuse with other systems)
- **4 stats**: Strength, Dexterity, Intelligence, Will — NOT the D&D six (no Constitution or Wisdom/Charisma split)
- **3 actions per turn** (not Action + Bonus Action + Movement)
- **Heroic Reactions** cost 1 action from your next turn (Defend, Interpose, Opportunity Attack, Help)
- **Monster Armor** works differently: Medium = dice only (ignore modifiers), Heavy = half dice (ignore modifiers). Crits ignore armor.
- **Minions** die from any damage, cannot crit, and damage overflows to adjacent minions
- **Critical Hits** = max on Primary Die, then reroll and add (exploding). Crits ignore monster armor.
- **Advantage/Disadvantage** stack (roll extra dice per instance), and they cancel each other 1:1
- **Death**: 0 HP = 1 Wound + Dying. 6 Wounds = death. No death saves like other systems.
- **Encounter Difficulty**: Budget = Party Size × Party Level. Compare total monster levels to budget.
- **No spell slots**: Spells cost Mana equal to spell tier; cantrips are free.
- **Rushed Attacks**: Additional attacks in a turn add cumulative disadvantage (not Extra Attack feature).

Be creative, evocative, and provide actionable content that GMs can use directly in their sessions. Always use Nimble terminology and mechanics.

## Heroes Guide Reference
${HEROES_REFERENCE}`;

export function buildSystemPrompt(campaignContext?: string, userContext?: string): string {
  let prompt = BASE_SYSTEM_PROMPT;

  if (campaignContext) {
    prompt += `\n\n## Current Campaign\n${campaignContext}`;
  }

  if (userContext) {
    prompt += `\n\n## GM Notes & Preferences\n${userContext}`;
  }

  return prompt;
}

// --- Hierarchical context builder ---

export interface ContextData {
  campaign?: Campaign;
  session?: Session;
  sessionEncountersSummary?: string;
  encounter?: Encounter;
  encounterMonsters?: Monster[];
  chatHistorySummary?: string;
  userContext?: string;
}

export function buildContextualSystemPrompt(data: ContextData): string {
  let prompt = BASE_SYSTEM_PROMPT;

  // Campaign context
  if (data.campaign) {
    const c = data.campaign;
    const lines = [
      `Campaign: ${c.name}`,
      c.description ? `Description: ${c.description}` : '',
      `Party: ${c.partyMembers?.length || c.partySize} players at level ${c.partyLevel}`,
    ].filter(Boolean);

    if (c.partyMembers?.length) {
      lines.push('Party Members:');
      for (const m of c.partyMembers) {
        const details = [m.race, m.class].filter(Boolean).join(' ');
        lines.push(`- ${m.characterName} (${details || 'no class/race'}) — played by ${m.playerName}`);
      }
    }
    prompt += `\n\n## Current Campaign\n${lines.join('\n')}`;
  }

  // Session context
  if (data.session) {
    const s = data.session;
    const lines = [
      `Session #${s.number}: ${s.title}`,
      `Status: ${s.status}`,
    ];
    if (s.notes) {
      lines.push(`Session Notes: ${s.notes.slice(0, 1000)}`);
    }
    if (s.sessionEncounters?.length) {
      lines.push('Planned Encounters:');
      for (const enc of s.sessionEncounters) {
        const typeLabel = enc.type === 'battle' ? 'Battle' : enc.type === 'skill-check' ? 'Skill Check' : 'NPC Interaction';
        lines.push(`- [${typeLabel}] ${enc.title}${enc.description ? `: ${enc.description.slice(0, 200)}` : ''}`);
      }
    }
    prompt += `\n\n## Current Session\n${lines.join('\n')}`;
  }

  // Encounter context
  if (data.encounter) {
    const e = data.encounter;
    const lines = [
      `Encounter: ${e.name}`,
      `Difficulty: ${e.difficulty} (${e.difficultyPercent}%)`,
      `Party: ${e.partySize} players at level ${e.partyLevel}`,
    ];
    if (e.notes) {
      lines.push(`Notes: ${e.notes.slice(0, 500)}`);
    }
    if (e.monsters.length) {
      lines.push('Monster Roster:');
      for (const m of e.monsters) {
        lines.push(`- ${m.name} (Lv ${m.level}) x${m.count}${m.isMinion ? ' [Minion]' : ''}`);
      }
    }
    // Include monster stat details if available
    if (data.encounterMonsters?.length) {
      lines.push('\nMonster Details:');
      for (const m of data.encounterMonsters) {
        lines.push(`**${m.name}** (Lv ${m.level}, ${m.size}): HP ${m.hp}, Armor: ${m.armorType}${m.saveDC ? ', DC ' + m.saveDC : ''}${m.specialMovement ? ', ' + m.specialMovement : ''}`);
        if (m.abilities.length) {
          for (const a of m.abilities) {
            const typeTag = a.actionType ? ` [${a.actionType}]` : '';
            lines.push(`  - ${a.name}${typeTag}: ${a.description.slice(0, 150)}`);
          }
        }
      }
    }
    prompt += `\n\n## Current Encounter\n${lines.join('\n')}`;
  }

  // Campaign chat history summary for session/encounter context
  if (data.chatHistorySummary) {
    prompt += `\n\n## Previous Campaign Chat Context\n${data.chatHistorySummary}`;
  }

  if (data.userContext) {
    prompt += `\n\n## GM Notes & Preferences\n${data.userContext}`;
  }

  return prompt;
}
