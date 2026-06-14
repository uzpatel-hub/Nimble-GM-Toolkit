import { readFileSync, writeFileSync } from 'node:fs';

const chunks = [1, 2, 3, 4].flatMap((n) =>
  JSON.parse(readFileSync(`scripts/chunk${n}.json`, 'utf8'))
);

// Dedup by name; prefer the entry with the most filled-in / longest content.
const byName = new Map();
for (const e of chunks) {
  const prev = byName.get(e.name);
  const score = (x) => (x.generous?.length || 0) + (x.deadly?.length || 0);
  if (!prev || score(e) > score(prev)) byName.set(e.name, e);
}
const tips = [...byName.values()];

// Match against bestiary names.
const bes = readFileSync('src/data/bestiary.ts', 'utf8');
const names = [...bes.matchAll(/^\s{4}name: '([^']*)'/gm)].map((m) => m[1]);
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const besByNorm = new Map(names.map((n) => [norm(n), n]));
const besSet = new Set(names);

// Source tip name -> list of bestiary names it should apply to.
// Used when the source has one generic tip but the bestiary splits the creature
// into per-level variants or named members.
const EXPANSIONS = {
  // NPC archetype classes: stored as "<Name> (lvl 2/4/6/10)".
  Berserker: 'lvl', 'The Cheat': 'lvl', Commander: 'lvl', Hunter: 'lvl',
  Mage: 'lvl', Oathsworn: 'lvl', Shadowmancer: 'lvl', Shepherd: 'lvl',
  Songweaver: 'lvl', Stormshifter: 'lvl', Zephyr: 'lvl', Hexbinder: 'lvl',
  // Plural / group tips -> all members of that creature type.
  Dryads: ['Dryad', 'Greater Dryad', 'Wondrous Dryad'],
  Oozes: ['Gray Ooze', 'Elder Ooze', 'Ooze Minion'],
  Stirges: ['Stirge', 'Greater Stirge'],
  'Grick Tactics': ['Grick', 'Grick Alpha', 'Grick Wormlet'],
  'Death Knight Tactics': ['Death Knight', 'Death Knight Marshal', 'Death Knight Baron', 'Death Knight Regent'],
};

function tipOf(e) {
  const t = {};
  if (e.generous) t.generous = e.generous;
  if (e.deadly) t.deadly = e.deadly;
  return t;
}

const matched = {};
const unmatched = [];
const expanded = [];
for (const e of tips) {
  const exp = EXPANSIONS[e.name];
  if (exp === 'lvl') {
    const targets = names.filter((n) => n.startsWith(e.name + ' (lvl'));
    targets.forEach((n) => (matched[n] = tipOf(e)));
    expanded.push(`${e.name} -> ${targets.length} lvl-variants`);
    continue;
  }
  if (Array.isArray(exp)) {
    const targets = exp.filter((n) => besSet.has(n));
    targets.forEach((n) => (matched[n] = tipOf(e)));
    expanded.push(`${e.name} -> ${targets.join(', ')}`);
    continue;
  }
  const canon = besSet.has(e.name) ? e.name : besByNorm.get(norm(e.name));
  if (canon) matched[canon] = tipOf(e);
  else unmatched.push(e.name);
}

writeFileSync('scripts/matched-tips.json', JSON.stringify(matched, null, 2));
console.log(`unique monsters parsed: ${tips.length}`);
console.log(`bestiary entries that will get tips: ${Object.keys(matched).length}`);
console.log(`\nexpansions:\n  ${expanded.join('\n  ')}`);
console.log(`\nunmatched / no home in bestiary (${unmatched.length}):\n  ${unmatched.join(' | ')}`);
