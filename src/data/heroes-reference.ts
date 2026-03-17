export const HEROES_REFERENCE = `
# Nimble Heroes Reference

## CHARACTER CREATION

### Stats
4 stats: STR, DEX, INT, WIL. Max +5 each.
- **KEY** stat: referenced by abilities/spells; use one of your class's 2 Key Stats.
- Stat arrays at level 1: Standard (+2,+2,+0,-1), Balanced (+2,+1,+1,+0), Min-Max (+3,+1,-1,-1).
- Place highest numbers in your class's Key Stats.

### Saves
Each hero has 1 advantaged save (+), 1 disadvantaged save (-), 2 neutral. DC for hero-caused effects = 10+KEY.

### Skills
At level 1: mark stat bonuses into respective skills, then place 4 additional skill points freely. Max skill bonus: +12.
- STR: Might. DEX: Stealth, Finesse. INT: Arcana, Examination, Lore. WIL: Insight, Influence, Naturecraft, Perception.

### Secondary Stats
- HP: class-specific starting value.
- Hit Dice: max = your level. Size = class-specific (d6/d8/d10/d12).
- Initiative: DEX by default.
- Speed: 6 default. Size: Medium default. Max Wounds: 6 default.
- Inventory Slots: 10+STR.
- Languages: Common + 1 per INT point.

### Leveling Up
On level-up: roll Hit Die with advantage, add to max HP. +1 max Hit Die. +1 skill point (may also move 1 point). Gain class features for new level. Stat increases at specific class levels.

## ANCESTRIES (RACES)

### Common
- **Human** (Med): Tenacious. +1 to all skills and Initiative.
- **Dwarf** (Med): Stout. +2 max Hit Dice, +1 max Wounds, -1 Speed. Know Dwarvish.
- **Elf** (Med): Lithe. Advantage on Initiative, +1 Speed. Know Elvish.
- **Halfling** (Small): Elusive. +1 Stealth. Succeed a failed save 1/Safe Rest.
- **Gnome** (Small): Optimistic. Ally within Reach 6 rerolls any die (resets at max HP). -1 Speed. Know Dwarvish.

### Exotic
- **Bunbun** (Small): Bunny Legs. Hop up to Speed after Defending/before Interposing, 1/encounter.
- **Dragonborn** (Med): Draconic Heritage. +1 Armor. On attack: +LVL+KEY bonus damage (ignoring armor), divided among targets. Recharges on Safe Rest or Wound. Know Draconic.
- **Fiendkin** (Med): Flameborn. 1 neutral save becomes advantaged. Know Infernal.
- **Goblin** (Small): Skedaddle. Move 2 spaces free after targeted by attack/negative effect. Know Goblin.
- **Kobold** (Small): Wily. Force enemy reroll on non-crit attack 1/encounter. +3 Influence with friendlies. Know Draconic.
- **Orc** (Med): Relentless. When dropping to 0 HP, set HP to LVL instead, 1/Safe Rest. +1 Might. Know Goblin.
- **Birdfolk** (Small/Med): Hollow Bones. Fly speed (leather armor max). Crits against you are Vicious. Forced movement doubled.
- **Celestial** (Med): Highborn. Disadvantaged save becomes neutral. Know Celestial.
- **Changeling** (Med): New Place, New Face. +2 shifting skill points, take appearance of any ancestry 1/day.
- **Crystalborn** (Med): Reflective Aura. When Defending, gain KEY armor and deal KEY damage back, 1/encounter.
- **Dryad/Shroomling** (Small/Med): Danger Pollen. When you gain Wounds, adjacent enemies are Dazed.
- **Half-Giant** (Large): Strength of Stone. Force enemy reroll crit 1/encounter. +2 Might.
- **Minotaur/Beastfolk** (Med): Charge. Move 4+ spaces, push creature in path (Med 1, Small 2), 1/turn.
- **Oozeling/Construct** (Small/Med): Odd Constitution. Increment Hit Dice one step; they always heal max. Magical healing always heals minimum.
- **Planarbeing** (Med): Planeshift. When Defending, gain 1 Wound to ignore damage. -2 max Wounds.
- **Ratfolk** (Small): Scurry. +2 armor if you moved last turn.
- **Stoatling** (Small): Small But Ferocious. +1d6 per size category larger than you on single-target attacks. They get same bonus vs you.
- **Turtlefolk** (Small/Med): Slow & Steady. +4 Armor, -2 Speed.
- **Wyrdling** (Small): Chaotic Surge. When you/ally within Reach 6 casts tiered spell, allow Chaos Table roll, 1/encounter.

## CLASSES

### Berserker
Key Stats: STR, DEX. HD: d12. HP: 20. Saves: STR+, INT-. Armor: None. Weapons: all STR.
- **Rage** (Action): Roll Fury Die (d4, scales to d12 at high levels), add to STR attacks. Max KEY Fury Dice.
- **That all you got?!**: Expend Fury Dice to reduce damage by STR+DEX per die.
- Rage ends if: leave combat, 0 HP, or 1 round without attacking/Raging.
- L2: Intensifying Fury (free Fury Die per turn while Raging). L4: Enduring Rage (Rage while Dying).
- Subclasses: **Path of the Mountainheart** (tanky, damage reduction) | **Path of the Red Mist** (offensive, frenzy on crits/kills).
- Savage Arsenal: 12 abilities including Death Blow, Whirlwind, Into the Fray, Mighty Endurance.

### The Cheat (Rogue)
Key Stats: DEX, INT. HD: d6. HP: 10. Saves: DEX+, WIL-. Armor: Leather. Weapons: DEX.
- **Sneak Attack**: +damage on crit (scales d6 to 3d20). **Vicious Opportunist**: change Primary Die on hit vs Distracted targets.
- Distracted = adjacent to ally, Taunted by ally, or can't see you.
- L2: Free move/hide per round, change skill check to 10+INT 1/day, min Initiative 10.
- Subclasses: **Silent Blade** (assassination, invisibility on kill) | **Scoundrel** (Low Blow incapacitate, Pocket Sand, Escape Plan).
- Underhanded Abilities: "Creative" Accounting, Exploit Weakness, Misdirection, Steal Tempo, etc.

### Commander
Key Stats: STR, INT. HD: d10. HP: 17. Saves: STR+, DEX-. Armor: Mail, Shields. Weapons: All Martial.
- **Coordinated Strike!** (Free Action): You and ally within 6 both attack/cantrip for free. INT uses/Safe Rest.
- L4: Combat Dice (STR d6s, scale to d20s) for maneuvers: Heavy Strike, Inerrant Strike, Lunging Strike, Sweeping Strike, Commanding Presence.
- Commander's Orders: Hold the Line!, Face Me!, Move it!, Reposition!, I Can Do This ALL DAY!
- Subclasses: **Bulwark** (plate armor, shield expert, Shield Wall) | **Vanguard** (advance for advantage, extra Coordinated Strike targets).
- Weapon Mastery: Slashing (can't miss unarmored), Bludgeoning (7+ ignores Heavy Armor), Piercing (ignores Medium Armor).

### Hunter
Key Stats: DEX, WIL. HD: d8. HP: 13. Saves: DEX+, INT-. Armor: Leather. Weapons: DEX.
- **Hunter's Mark** (Action): Mark creature for 1 day. Can't hide from you. Attacks gain advantage OR +LVL damage.
- **Thrill of the Hunt**: Gain charges on quarry kill, melee hit, or ranged crit. Spend charges on TotH abilities.
- TotH abilities: Incendiary Shot, Multishot, Sharpshooter, Hail of Arrows, Pinning Shot, Snare Trap, Decoy, Fleet Feet, etc.
- Subclasses: **Shadowpath** (ambush, tracking, armor/cover ignore) | **Wild Heart** (+5 HP, d10 Hit Dice, Healing Salves, +WIL armor).
- Story subclass: **Beastmaster** (animal companion: Small/Medium/Large with Go for the Throat! and Protect Me!).

### Mage
Key Stats: INT, WIL. HD: d6. HP: 10. Saves: INT+, STR-. Armor: Cloth. Weapons: Blades, Staves, Wands.
- Mana pool: (INT x 3)+LVL. Recharges on Safe Rest.
- Knows Fire, Ice, Lightning cantrips. Unlocks spell tiers 1-9 as leveling (T1 at L2, T9 at L18).
- **Spellshaper** (L4): Enhance spells: Echo Casting, Stretch Time, Dimensional Compression, Extra-Dimensional Vision, Elemental Transmutation, Precise Casting, etc.
- **Elemental Surge**: Regain WIL mana on Initiative (combat only).
- Subclasses: **Control** (Demand Control table: free cantrip, elemental affliction, or deny harm) | **Chaos** (spend 1 less mana but roll on secret Chaos Table).

### Oathsworn (Paladin)
Key Stats: STR, WIL. HD: d10. HP: 17. Saves: STR+, DEX-. Armor: All. Weapons: STR.
- **Radiant Judgment**: When enemy attacks you (no Judgment Dice), roll 2d6 (scales to d20s). Add to next melee hit as radiant damage.
- **Lay on Hands**: Pool = 5xLVL. Touch to restore HP.
- Mana pool: WIL+LVL. Radiant spells. Zealot: spend mana for +5 radiant damage or -1 armor step per mana.
- Sacred Decrees: Blinding Aura, Courage!, Explosive Judgment, Radiant Aura, Stand Fast Friends!, etc.
- Subclasses: **Oath of Vengeance** (extra Judgment Die, triggers on ally attacked) | **Oath of Refuge** (shield +WIL armor, Interpose in aura, Taunt on Interpose).
- Story subclass: **Oathbreaker** (loses some Radiant, gains Necrotic spells, aura of suffering, pain-sharing).

### Shadowmancer (Warlock)
Key Stats: INT, DEX. HD: d8. HP: 13. Saves: INT+, WIL-. Armor: Cloth. Weapons: Blades, Wands.
- **Shadow Blast**: 1d12+KEY necrotic cantrip (1/turn). **Summon Shadows**: cantrip, max INT or LVL minions (1 HP each).
- **Pilfered Power**: Cast tiered spells DEX times before patron retaliates (half max HP damage). Always cast at highest unlocked tier. Resets on Safe Rest commune.
- Spell tiers unlock slower: T2 at L5, T7 at L19.
- Invocations: Lesser (Whispers of the Grave, Eldritch Sense, etc.) and Greater (Armor of Shadows, Shadow Magus, Repelling Blast, etc.).
- Subclasses: **Pact of the Red Dragon** (Fire spells, Smoldering minions) | **Pact of the Abyssal Depths** (Ice spells, temp HP on crits).
- Story subclass: **Reaver** (loses Shadow Blast/Pilfered Power, gains Bonescythe melee weapon 2d12+DEX, sacrifice minions to cast).

### Shepherd (Cleric)
Key Stats: WIL, STR. HD: d10. HP: 17. Saves: WIL+, DEX-. Armor: Mail, Shields. Weapons: STR, Wands.
- **Searing Light** (WIL/Safe Rest): Heal WIL d8 to Dying creature OR deal WIL d8 radiant to undead/Bloodied enemy. Reach 6.
- **Lifebinding Spirit** (T1 spell): Summon immune-to-harm companion. Attacks 1d6+WIL (ignoring armor) or heals same. Healing uses = mana spent.
- Mana pool: (WIL x 3)+LVL. Radiant and Necrotic spells. Tiers 1-9 (T9 at L18).
- Sacred Graces: Empowered Companion, Hasty Companion, Illuminate Soul, Not Beyond MY Reach (revive dead <1 round), Vengeful Spirit, etc.
- Subclasses: **Luminary of Mercy** (double healing on Dying, Conduit of Light, Powerful Healer) | **Luminary of Malice** (Soul Reaper double Searing Light, Deathbringer's Touch auto-crit Bloodied).

### Songweaver (Bard)
Key Stats: WIL, INT. HD: d8. HP: 13. Saves: WIL+, STR-. Armor: Cloth/Leather. Weapons: DEX, Wands.
- **Vicious Mockery**: 1d4+INT psychic cantrip (ignoring armor), Taunts on hit.
- **Songweaver's Inspiration** (2xWIL/Safe Rest): Free Reaction to let ally reroll attack/save die.
- Mana pool: (INT x 3)+LVL. Wind spells + 1 other school. Tiers 1-9.
- Jack of All Trades: move a skill point on Safe Rest. Song of Rest: +WIL HP on Field Rest Hit Dice.
- "A People Person" (L5): Summon friends: Stompy (hill giant), Gran Gran (healing pastries), Mal (imp spy), Linos (flying mount).
- Lyrical Weaponry: Heroic Ballad, Not My Beautiful Faaace!, Rhapsody of the Normal, Song of Domination, Inspiring Anthem.
- Subclasses: **Herald of Snark** (double Vicious Mockery on enemy miss, Chord of Chaos) | **Herald of Courage** (Inspiring Presence temp HP, Unfailing Courage advantage, extra actions).

### Stormshifter (Druid)
Key Stats: WIL, DEX. HD: d8. HP: 13. Saves: WIL+, STR-. Armor: Cloth/Leather. Weapons: Staves, Wands.
- **Beastshift**: DEX charges/Safe Rest. Transform into beasts. Speak with animals while transformed.
- Direbeast Forms: **Fearsome Beast** (Large, Gore attack, temp HP), **Beast of the Pack** (Medium, Thunderfang + lightning scaling), **Beast of Nightmares** (Tiny, Sting ignoring armor, hidden until attacking).
- Mana pool: (WIL x 3)+LVL. Lightning and Wind spells. Tiers 1-9.
- Chimeric Boons: Winged (fly), Climber, Earthwalker, Keen Senses, Phasebeast (teleport on shift), etc.
- Subclasses: **Circle of Sky & Storm** (cast spells while shifted, learn Ice or Radiant) | **Circle of Fang & Claw** (free shifts, Windborne Protector, Master of Forms).

### Zephyr (Monk)
Key Stats: DEX, STR. HD: d8. HP: 13. Saves: DEX+, INT-. Armor: None (Iron Defense: DEX+STR). Weapons: Melee.
- **Swift Fists**: Unarmed 1d4+STR, no Rushed Attack disadvantage.
- **Burst of Speed** (DEX charges on Initiative): Slipstream (attack misses), Whirling Defense (armor all round), Swiftstrike (ignore Rushed disadvantage), Windstep (ignore difficult terrain).
- L4: Unyielding Resolve (ignore first Wound/encounter, scales to 3). L5: +LVL bludgeoning to all melee. L13: Armor doubled.
- Martial Arts: Airshift (can't be grappled, walk any terrain), Blur, Kinetic Barrage, I Jump On His Back!, Use Momentum, Mighty Soul, etc.
- Subclasses: **Way of Pain** (turn attacks into crits against you, reflect half damage back) | **Way of Flame** (gain Wounds to deal AoE fire, Blazing Speed, Chain Reaction).

### Story-Based Subclasses (chosen mid-campaign)
- **Spellblade** (Commander): Loses Weapon Mastery/Combat Tactics, gains mana on Initiative, learns spells from any school, enhanced Commander's Orders with magical effects.

## SPELL SCHOOLS SUMMARY

### Fire
- Cantrips: Flame Dart (1d10, Smoldering on crit), Heart's Fire (give ally extra action)
- T1 Ignite (4d10 to Smoldering), T2 Enchant Weapon (+KEY fire damage), T3 Flame Barrier (free Defend + damage attackers), T4 Pyroclasm (2d20+10 AoE), T5 Fiery Embrace (enchant ally weapons + debuff enemies), T7 Living Inferno (Flame Barrier + double Pyroclasm), T9 Dragonform (become Huge dragon)

### Ice
- Cantrips: Ice Lance (1d6, Slows), Snowblind (1d6, Blinds)
- T1 Frost Shield (temp HP + free Defend), T2 Shatter (3d6, bonus vs Hampered), T3 Cryosleep (Daze/sleep AoE), T4 Rimeblades (damage terrain), T5 Arctic Blast (4d6+10 cone, Restrain), T8 Glacier Strike (d66 AoE), T9 Arctic Annihilation (d66 + Incapacitate)

### Lightning
- Cantrips: Zap (2d8, hits you on miss), Overload (2d8 AoE, requires Charged)
- T1 Arc Lightning (3d8, chains), T2 Alacrity (free Defend + teleport), T3 Stormlash (3d8+4 line, Daze), T4 Electrickery (swap ally with enemy), T5 Electrocharge (buff: +1 action, +5 armor, 2x speed), T6 Ride the Lightning (teleport + d88 AoE), T9 Seething Storm (storm form, d88 bolts)

### Wind
- Cantrips: Razor Wind (1d4 Vicious, hits adjacent), Breath of Life (1 HP to Dying)
- T1 Blustery Gale (3d4, push), T2 Barrier of Wind (free Defend vs ranged), T3 Fly (grant flight), T4 Eye of the Storm (4d4+10 AoE + reposition), T5 Updraft (repeated save or fall), T6 Thousand Cuts (d44 slashing), T7 Boisterous Winds (party flight + free move)
- Songweaver Only: Vicious Mockery (1d4+INT psychic, Taunt)

### Radiant
- Cantrips: Rebuke (1d6 ignoring armor, doesn't miss, 2x vs undead/cowardly), True Strike (grant advantage)
- T1 Heal (1d6+KEY HP), T2 Warding Bond (ward takes half your damage), T3 Shield of Justice (free Defend + reflect), T4 Condemn (30 damage to enemy who crit you), T5 Vengeance (1d100 vs attacker of Dying ally), T6 Sacrifice (drop to 0 HP, distribute your max HP as healing), T9 Redeem (mass resurrection, 24hr cast, 10k gp diamond)
- Shepherd Only: Lifebinding Spirit (companion that heals/attacks)

### Necrotic
- Cantrips: Entice (1d4, pull 2 spaces), Withering Touch (1d12, target = undead 1 round)
- T1 Shadow Trap (3d12 to next creature moving adjacent), T2 Dread Visage (free Defend, Frighten melee attackers), T3 Vampiric Greed (4d12 AoE + self-heal), T4 Greater Shadow (5d12 minion, explodes into 5 shadows), T5 Gangrenous Burst (3d20 to damaged creatures), T6 Unspeakable Word (d66 ignoring armor), T7 Creeping Death (4d20, chains on kill)
- Shadowmancer Only: Shadow Blast (1d12+KEY), Summon Shadow (minions)

### Utility Spells (non-combat, chosen by class)
- Fire: Firebrand (mark surfaces), Fire Step (teleport to fire), Kindle (illusion/ignite)
- Ice: Ice Disk (floating cargo), Chillcraft (freeze/thaw/ice craft), Wintry Scrying (scry via water)
- Lightning: Spark Buddy (tiny helper), Spark Step (teleport to metal), Tempest's Command (dispel/amplify voice)
- Wind: Wind Whisper (message 100mi), Helpful Gust (move tiny items/scent), Feather Fall
- Radiant: Light (torch glow), Beautify (clean/repair/conjure flowers), Bond of Peace (telepathy/calm)
- Necrotic: Gravecraft (soil/dig), False Face (disguise), Thought Leech (read thoughts)

## RESTING & HEALING

### Field Rest
- **Catch Breath** (10 min): Expend Hit Dice, roll + add STR to each, regain that HP.
- **Make Camp** (8 hrs with food/sleep): Take max value on Hit Dice instead of rolling, still +STR each.

### Safe Rest
- Takes place in safe location (inn, cabin, shrine). NOT wilderness camping.
- Recover ALL HP, Hit Dice, mana, class resources. Heal 1 Wound.
- Retraining opportunity (class-specific flavor requirement).

### Mana
- Mana pool = class-specific formula, recharges on Safe Rest.
- Mage/Stormshifter/Shepherd: (KEY x 3)+LVL. Songweaver: (INT x 3)+LVL. Oathsworn: WIL+LVL.
- Shadowmancer: uses Pilfered Power (DEX uses/Safe Rest) instead; always casts at max unlocked tier.
- Spell mana cost = spell tier. Cantrips are free.

### Wounds & Death
- Gain 1 Wound when reduced to 0 HP. 6 Wounds = death (default).
- While Dying: 1 action max, attacking/casting costs 1 Wound unless DC 10 STR save. Taking damage = 2 Wounds (3 on crit).
- Wounds heal 1 per Safe Rest typically.

### Multiclassing (Optional)
On level-up, may choose any class's features for that level instead. Uses saves of highest-level class.
`;
