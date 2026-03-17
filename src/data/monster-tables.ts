export interface MonsterStatRow {
  level: number;
  hpNoArmor: number;
  hpMedArmor: number;
  hpHeavyArmor: number;
  damagePerRound: number;
  attackDice: string;
  saveDC: number;
}

export const MONSTER_STATS_BY_LEVEL: MonsterStatRow[] = [
  { level: 0.25, hpNoArmor: 12, hpMedArmor: 9, hpHeavyArmor: 7, damagePerRound: 3, attackDice: "1d4+1", saveDC: 9 },
  { level: 0.33, hpNoArmor: 15, hpMedArmor: 11, hpHeavyArmor: 8, damagePerRound: 5, attackDice: "1d6+2", saveDC: 9 },
  { level: 0.5, hpNoArmor: 18, hpMedArmor: 15, hpHeavyArmor: 11, damagePerRound: 7, attackDice: "1d6+3", saveDC: 10 },
  { level: 1, hpNoArmor: 26, hpMedArmor: 20, hpHeavyArmor: 16, damagePerRound: 11, attackDice: "2d8+2 or (2x) 1d8+1", saveDC: 10 },
  { level: 2, hpNoArmor: 34, hpMedArmor: 27, hpHeavyArmor: 20, damagePerRound: 13, attackDice: "2d8+4 or (2x) 1d8+3", saveDC: 11 },
  { level: 3, hpNoArmor: 41, hpMedArmor: 33, hpHeavyArmor: 25, damagePerRound: 15, attackDice: "2d8+6 or (2x) 1d8+4", saveDC: 11 },
  { level: 4, hpNoArmor: 49, hpMedArmor: 39, hpHeavyArmor: 29, damagePerRound: 18, attackDice: "2d8+9 or (2x) 1d8+5", saveDC: 12 },
  { level: 5, hpNoArmor: 58, hpMedArmor: 46, hpHeavyArmor: 35, damagePerRound: 19, attackDice: "2d8+10 or (2x) 1d8+6", saveDC: 12 },
  { level: 6, hpNoArmor: 68, hpMedArmor: 54, hpHeavyArmor: 41, damagePerRound: 21, attackDice: "2d8+12 or (2x) 1d8+7", saveDC: 13 },
  { level: 7, hpNoArmor: 79, hpMedArmor: 63, hpHeavyArmor: 47, damagePerRound: 24, attackDice: "3d8+10 or (2x) 2d8+4", saveDC: 13 },
  { level: 8, hpNoArmor: 91, hpMedArmor: 73, hpHeavyArmor: 55, damagePerRound: 26, attackDice: "3d8+12 or (2x) 2d8+5", saveDC: 14 },
  { level: 9, hpNoArmor: 104, hpMedArmor: 83, hpHeavyArmor: 62, damagePerRound: 28, attackDice: "4d8+10 or (2x) 2d8+6", saveDC: 14 },
  { level: 10, hpNoArmor: 118, hpMedArmor: 94, hpHeavyArmor: 71, damagePerRound: 30, attackDice: "4d8+12 or (2x) 2d8+7", saveDC: 15 },
  { level: 11, hpNoArmor: 133, hpMedArmor: 106, hpHeavyArmor: 80, damagePerRound: 33, attackDice: "5d8+11 or (2x) 3d8+3", saveDC: 15 },
  { level: 12, hpNoArmor: 149, hpMedArmor: 119, hpHeavyArmor: 89, damagePerRound: 35, attackDice: "5d8+13 or (2x) 3d8+4", saveDC: 16 },
  { level: 13, hpNoArmor: 166, hpMedArmor: 132, hpHeavyArmor: 100, damagePerRound: 38, attackDice: "6d8+11 or (2x) 3d8+6", saveDC: 16 },
  { level: 14, hpNoArmor: 184, hpMedArmor: 147, hpHeavyArmor: 110, damagePerRound: 40, attackDice: "6d8+13 or (2x) 3d8+7", saveDC: 17 },
  { level: 15, hpNoArmor: 203, hpMedArmor: 162, hpHeavyArmor: 122, damagePerRound: 43, attackDice: "7d8+11 or (2x) 3d8+8", saveDC: 17 },
  { level: 16, hpNoArmor: 223, hpMedArmor: 178, hpHeavyArmor: 134, damagePerRound: 45, attackDice: "7d8+13 or (2x) 4d8+5", saveDC: 18 },
  { level: 17, hpNoArmor: 244, hpMedArmor: 195, hpHeavyArmor: 146, damagePerRound: 48, attackDice: "8d8+12 or (2x) 4d8+6", saveDC: 18 },
  { level: 18, hpNoArmor: 266, hpMedArmor: 213, hpHeavyArmor: 160, damagePerRound: 50, attackDice: "8d8+14 or (2x) 4d8+7", saveDC: 19 },
  { level: 19, hpNoArmor: 289, hpMedArmor: 231, hpHeavyArmor: 173, damagePerRound: 52, attackDice: "9d8+12 or (2x) 4d8+8", saveDC: 19 },
  { level: 20, hpNoArmor: 313, hpMedArmor: 250, hpHeavyArmor: 189, damagePerRound: 54, attackDice: "9d8+13 or (2x) 4d8+9", saveDC: 20 },
];

export interface LegendaryStatRow {
  partyLevel: number;
  hpMedArmor: number;
  hpHeavyArmor: number;
  hpLastStand: number;
  saveDC: number;
  attackSmall: number;
  attackBig: number;
}

export const LEGENDARY_STATS_BY_LEVEL: LegendaryStatRow[] = [
  { partyLevel: 1, hpMedArmor: 50, hpHeavyArmor: 35, hpLastStand: 10, saveDC: 10, attackSmall: 8, attackBig: 16 },
  { partyLevel: 2, hpMedArmor: 75, hpHeavyArmor: 55, hpLastStand: 20, saveDC: 11, attackSmall: 9, attackBig: 18 },
  { partyLevel: 3, hpMedArmor: 100, hpHeavyArmor: 75, hpLastStand: 30, saveDC: 11, attackSmall: 10, attackBig: 20 },
  { partyLevel: 4, hpMedArmor: 125, hpHeavyArmor: 95, hpLastStand: 40, saveDC: 12, attackSmall: 11, attackBig: 22 },
  { partyLevel: 5, hpMedArmor: 150, hpHeavyArmor: 115, hpLastStand: 50, saveDC: 12, attackSmall: 12, attackBig: 24 },
  { partyLevel: 6, hpMedArmor: 175, hpHeavyArmor: 135, hpLastStand: 60, saveDC: 13, attackSmall: 13, attackBig: 26 },
  { partyLevel: 7, hpMedArmor: 200, hpHeavyArmor: 155, hpLastStand: 70, saveDC: 13, attackSmall: 14, attackBig: 28 },
  { partyLevel: 8, hpMedArmor: 225, hpHeavyArmor: 175, hpLastStand: 80, saveDC: 14, attackSmall: 15, attackBig: 30 },
  { partyLevel: 9, hpMedArmor: 250, hpHeavyArmor: 195, hpLastStand: 90, saveDC: 14, attackSmall: 16, attackBig: 32 },
  { partyLevel: 10, hpMedArmor: 275, hpHeavyArmor: 215, hpLastStand: 100, saveDC: 15, attackSmall: 17, attackBig: 34 },
  { partyLevel: 11, hpMedArmor: 300, hpHeavyArmor: 235, hpLastStand: 110, saveDC: 15, attackSmall: 18, attackBig: 36 },
  { partyLevel: 12, hpMedArmor: 325, hpHeavyArmor: 255, hpLastStand: 120, saveDC: 16, attackSmall: 19, attackBig: 38 },
  { partyLevel: 13, hpMedArmor: 350, hpHeavyArmor: 275, hpLastStand: 130, saveDC: 16, attackSmall: 20, attackBig: 40 },
  { partyLevel: 14, hpMedArmor: 375, hpHeavyArmor: 295, hpLastStand: 140, saveDC: 17, attackSmall: 21, attackBig: 42 },
  { partyLevel: 15, hpMedArmor: 400, hpHeavyArmor: 315, hpLastStand: 150, saveDC: 17, attackSmall: 22, attackBig: 44 },
  { partyLevel: 16, hpMedArmor: 425, hpHeavyArmor: 335, hpLastStand: 160, saveDC: 18, attackSmall: 23, attackBig: 46 },
  { partyLevel: 17, hpMedArmor: 450, hpHeavyArmor: 355, hpLastStand: 170, saveDC: 18, attackSmall: 24, attackBig: 48 },
  { partyLevel: 18, hpMedArmor: 475, hpHeavyArmor: 375, hpLastStand: 180, saveDC: 19, attackSmall: 25, attackBig: 50 },
  { partyLevel: 19, hpMedArmor: 500, hpHeavyArmor: 395, hpLastStand: 190, saveDC: 19, attackSmall: 26, attackBig: 52 },
  { partyLevel: 20, hpMedArmor: 525, hpHeavyArmor: 415, hpLastStand: 200, saveDC: 20, attackSmall: 27, attackBig: 54 },
];

export const ABILITY_TEMPLATES = [
  { name: "Acid Blood", description: "Melee attackers take half the HP lost in return as acid damage." },
  { name: "Aggressive", description: "+X speed if moving toward enemies." },
  { name: "Blinding Spit", description: "Spits a blinding substance at a target within range. Target must save or be blinded for 1 round." },
  { name: "Bloodthirsty", description: "Has advantage on attacks against Bloodied targets." },
  { name: "Brute", description: "Attacks also knockback a number of spaces equal to the primary die rolled." },
  { name: "Brawler", description: "Extra damage, can only attack in melee." },
  { name: "Burning Aura", description: "Creatures that start their turn adjacent take 1d6 fire damage." },
  { name: "Climbing", description: "Can traverse walls or ceilings normally." },
  { name: "Controlling", description: "Creates/immune to difficult terrain." },
  { name: "Disgusting/Venomous/Heavy Blows", description: "Attacks also Daze the target." },
  { name: "Disintegrating Armor", description: "Starts with Heavy Armor, on crit degrades to Medium, then to none." },
  { name: "Doom", description: "Attacks also Wound the target." },
  { name: "Explosive Death", description: "Explode on death, dealing 2d6 damage to creatures within reach." },
  { name: "FAST", description: "Reaction: 1/round. Force a reroll with disadvantage on an attack." },
  { name: "Fearsome", description: "Frighten enemies within Range on a failed WIL save. 1/encounter." },
  { name: "Flying", description: "Flying speed and immune to Opportunity Attacks. May FALL when crit (1d6 damage/10 ft. fallen, lands Prone)." },
  { name: "Formation", description: "Armor increases 1 step for each adjacent ally (None, Med, Heavy)." },
  { name: "Frenzied", description: "Deals extra damage or has faster speed while damaged." },
  { name: "Grappler", description: "On hit: Grapples." },
  { name: "Gravity Manipulator", description: "Can pull or push enemies within reach." },
  { name: "Hates the Light", description: "Attacks the hero holding light." },
  { name: "Hypnotic Gaze", description: "Forces enemies to make a WIL save or be confused for 1 round." },
  { name: "Invulnerable", description: "Immune to damage until crit." },
  { name: "Mounted", description: "Faster movement and deals extra damage after moving toward an enemy." },
  { name: "Obstinate", description: "When attacking a target with disadvantage, treat the roll as if it had advantage instead." },
  { name: "Pack Tactics", description: "Advantage on attacks when an ally is adjacent to the target." },
  { name: "Parry", description: "Attacks against them miss on a 1 and 2." },
  { name: "Ranged", description: "Extra damage; can only attack at range." },
  { name: "Retaliate", description: "Attacks the first creature who attacks them in melee each round." },
  { name: "Savage", description: "Always crits Grappled creatures." },
  { name: "Shifty", description: "Can move after being attacked." },
  { name: "Silencer", description: "Attacks silence enemies (unable to cast spells or use voice-requiring actions)." },
  { name: "Sneak", description: "Invisible until they attack." },
  { name: "Spiked", description: "When hit by a melee attack, the attacker takes 1d4 piercing damage in return." },
  { name: "Standard Bearer", description: "Buffs nearby allies, reducing damage taken or increasing damage dealt." },
  { name: "Sturdy/Undying", description: "The first time the monster would die, they have 1 HP instead." },
  { name: "Summoner", description: "Calls minions to their aid each round." },
  { name: "Tricky", description: "Can swap places with allies or enemies." },
  { name: "Vicious", description: "Crits are Vicious (roll 1 additional die)." },
  { name: "Warping Touch", description: "On hit: teleport target X spaces." },
  { name: "Webslinger", description: "Can immobilize a target with webs when hit or crit." },
];
