import { Condition, CombatRule } from '@/types';

export const CONDITIONS: Condition[] = [
  { name: "Blinded", description: "Can't see. Attacks against you have advantage, and your attacks have disadvantage." },
  { name: "Bloodied", description: "At half HP or less." },
  { name: "Charmed", description: "Sees the charmer as an ally. Charmer has advantage on social interactions with you." },
  { name: "Dazed", description: "Heroes: lose 1 action; monsters: can perform one less action on their next turn." },
  { name: "Dying", description: "At 0 HP. Taking damage while dying causes 2 Wounds, a crit causes 3 instead." },
  { name: "Frightened", description: "Disadvantage on rolls when source of fear is nearby; speed halved when moving closer to it." },
  { name: "Grappled", description: "Cannot move. Attacks against you have advantage. Escape with a STR or DEX save (DC 10+STR or DEX of grappler). Forced movement, incapacitation, or a successful save ends it." },
  { name: "Hampered", description: "Any creature with their actions or movement reduced (e.g., Dazed, Grappled, Prone, Difficult Terrain)." },
  { name: "Incapacitated", description: "Can't do anything. Attacks against you have advantage, and melee attacks that hit, crit." },
  { name: "Invisible", description: "Cannot be seen. Your attacks have advantage, and attacks against you have disadvantage." },
  { name: "Petrified", description: "Incapacitated. You have all the benefits and drawbacks of being a rock! Immune to most damage except from large explosions, picks, or similar tools." },
  { name: "Poisoned", description: "Disadvantage on rolls." },
  { name: "Prone", description: "Movement costs twice as much, and disadvantage on attacks. Melee attacks against you have advantage; Ranged have disadvantage. Spend 3 spaces of your Speed to stand up." },
  { name: "Restrained", description: "Functions like Grappled, but is caused by objects (e.g., chains, rope, roots) and ignores size restrictions. Can be ended through logical means such as picking a lock or cutting/burning rope." },
  { name: "Riding", description: "You move with the creature you are riding. Any attacks that miss you, strike them." },
  { name: "Slowed", description: "Speed halved during your next turn." },
  { name: "Taunted", description: "Disadvantage on attacks except against the most recent taunter." },
  { name: "Wounded", description: "Has any Wounds. 6 Wounds and a hero is dead (unless an ability changes this number)." },
];

export const COMBAT_RULES: CombatRule[] = [
  {
    title: "Turn Structure",
    content: "On your turn, heroes get 3 actions to attack, move, cast spells, etc. Generally doing any single thing costs 1 action. Some strong spells or abilities may cost more. All 3 actions recharge at the end of your turn."
  },
  {
    title: "Available Actions",
    content: "Attack: Roll the die listed on the spell, weapon, or ability. Rolling a 1 on the Primary Die always misses.\n\nCast Spell: Requires 1 free hand (or spellcasting focus), ability to speak, and may require mana. Cost equals spell tier; cantrips are free.\n\nMove: Move up to your speed (default 6 spaces). Can be broken up with other actions. Difficult Terrain halves movement.\n\nAssess (DC 12 skill check): Ask a Question about enemies/environment, Create an Opening (+1 to next Primary Die vs target), or Anticipate Danger (-1 to Primary Dice rolled against you)."
  },
  {
    title: "Heroic Reactions (Cost 1 action, 1/round each, used on others' turns)",
    content: "Defend: Reduce damage from any single attack by your Armor.\n\nInterpose: If a creature within 2 spaces would be struck, push them aside and become the new target.\n\nOpportunity Attack: Melee attack with disadvantage against an adjacent enemy that willingly moves away. Only heroes can make these.\n\nHelp: Grant an ally advantage on a roll if you can explain how you help."
  },
  {
    title: "Attack Rolls & Primary Die",
    content: "For attacks with multiple dice, the leftmost die is the Primary Die. It determines hit or miss—rolling a 1 always misses. The Primary Die also determines critical hits."
  },
  {
    title: "Critical Hits",
    content: "Rolling the max on a Primary Die is a critical hit. When you crit, roll the Primary Die again and add the result. Repeat each time you roll the maximum—there's no limit! Crits also ignore monster armor."
  },
  {
    title: "Advantage & Disadvantage",
    content: "Advantage: Roll 1 additional die of the same type and remove the lowest.\nDisadvantage: Roll 1 additional die and remove the highest.\nMultiple instances stack (roll extra dice). Each instance of advantage cancels one instance of disadvantage."
  },
  {
    title: "Cover",
    content: "Cover (mostly obscured): Imposes disadvantage on attacks against you.\nFull Cover (completely obscured): Cannot typically be targeted.\nHiding: Requires Cover + DC 15 Stealth check (auto-success with Full Cover). First attack from hiding has advantage."
  },
  {
    title: "Monster Armor",
    content: "Most monsters are unarmored.\nMedium Armor: Take damage from dice only, ignoring all modifiers (unless negative).\nHeavy Armor: Take half damage from dice, ignoring modifiers.\nCrits and vulnerabilities ignore monster armor."
  },
  {
    title: "Minions",
    content: "Die from any amount of damage. Move and attack simultaneously. Cannot crit. Their attacks can be Defended as a single attack. Excess damage can overflow to adjacent minions."
  },
  {
    title: "Rushed Attacks",
    content: "A hero may attack more than once per turn, but additional attacks after the first impose cumulative disadvantage. For abilities that trigger a save, enemies roll with increasing advantage instead."
  },
  {
    title: "Initiative",
    content: "Roll 1d20 + Initiative bonus (typically DEX). Single digit = start with 1 action. Two digits = 2 actions. 20+ (or natural 20) = all 3 actions. Actions fully recharge at end of your turn."
  },
  {
    title: "Turn Order",
    content: "Heroes go first by default. Whichever player is ready first goes first, then clockwise. Monsters typically act last, though some fast monsters act sooner. Monster groups act at the same time each round."
  },
  {
    title: "Death & Dying",
    content: "At 0 HP: gain 1 Wound and the Dying condition. While Dying: limited to 1 action, Concentration breaks.\n\nAttacking/casting while Dying: causes 1 Wound unless DC 10 STR save.\nTaking damage while Dying: causes 2 Wounds (3 on a crit).\n\nDeath occurs at 6 Wounds. Revival is rare and costly."
  },
  {
    title: "Grappling",
    content: "Requires Reach and 1 free arm. Target makes STR or DEX save (DC 10+your STR or DEX).\nTarget your size or smaller: Grappled.\nTarget larger than you: you gain Riding condition.\nEnded by: forced movement, incapacitation, or successful save (costs 1 action)."
  },
  {
    title: "Concentration",
    content: "Only one concentration activity at a time. On crit: DC 10 STR save or Concentration breaks. Automatically broken at 0 HP or when incapacitated."
  },
];

export const SKILLS = [
  { name: "Arcana", stat: "INT", description: "Understanding of magical phenomena, spells, and enchantments. Identify magical effects, decipher arcane symbols, discern properties of magical items. Grants insights into Aberrations, Elementals, and Oozes." },
  { name: "Examination", stat: "INT", description: "Aptitude for thorough analysis and deduction. Diagnose injuries, determine causes of death, uncover clues, unravel traps or mechanical devices. Grants insights into Constructs." },
  { name: "Finesse", stat: "DEX", description: "Ability to use hands and feet carefully. Pick locks, disarm traps, pilot vehicles, tinker, card tricks, steal or plant items, climb mossy walls, or any task requiring precise movement." },
  { name: "Influence", stat: "WIL", description: "Persuasiveness, charm, and ability to influence others. Convince or deceive people, negotiate deals, build trust, win allies, or put on captivating performances." },
  { name: "Insight", stat: "WIL", description: "Understanding people and situations beyond the obvious. Sense motives, detect lies, read hidden emotions, make sense of clues. Can be used to retroactively change situations." },
  { name: "Lore", stat: "INT", description: "Understanding of history, kingdoms, and religions. Recall historical events, grasp cultural practices. Knowledge of Celestials, Dragons, Fey, Fiends, Giants, Humanoids, and Undead." },
  { name: "Might", stat: "STR", description: "Applying strength effectively. Lift heavy objects, break through obstacles, climb, swim, jump, or perform feats of strength." },
  { name: "Naturecraft", stat: "WIL", description: "Expertise in wilderness survival, navigation, tracking, and animal handling. Identify flora, fauna, track creatures. Knowledge of Beasts, Monstrosities, and Plants." },
  { name: "Perception", stat: "WIL", description: "Noticing subtle details in surroundings. Spot hidden objects, detect secret passages, sense environmental changes, sense when being followed. Pick up on non-obvious cues and hidden threats." },
  { name: "Stealth", stat: "DEX", description: "Staying unseen and moving quietly. Hide, slip past guards, evade detection, move without drawing attention." },
];

export const STATS_INFO = [
  { name: "Strength", abbr: "STR", description: "Raw physical power and resilience. Affects STR weapon damage, resistance to Wounds, HP recovery, Concentration, STR saves, carrying capacity, Grappling, and the Might skill." },
  { name: "Dexterity", abbr: "DEX", description: "Agility, reflexes, and precision. Affects DEX weapon damage, Initiative, DEX saves, Grappling, Armor contribution, and the Stealth and Finesse skills." },
  { name: "Intelligence", abbr: "INT", description: "Knowledge and reasoning. Affects languages, spellcasting, wand/scroll use, INT saves, and the Arcana, Examination, and Lore skills." },
  { name: "Will", abbr: "WIL", description: "Force of personality, courage, and wisdom. Affects spellcasting, WIL saves, and the Insight, Influence, Naturecraft, and Perception skills." },
];
