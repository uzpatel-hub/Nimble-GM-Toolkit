// Inject tipGenerous/tipDeadly into src/data/bestiary.ts for matched monsters.
// Idempotent: removes any previously-injected tip lines before re-inserting.
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'src/data/bestiary.ts';
const matched = JSON.parse(readFileSync('scripts/matched-tips.json', 'utf8'));
let src = readFileSync(FILE, 'utf8');

// Strip prior injections so re-runs stay clean.
src = src.replace(/^\s{4}tip(?:Generous|Deadly): .*\n/gm, '');

let injected = 0;
const missing = [];
for (const [name, tips] of Object.entries(matched)) {
  const anchor = `    name: '${name}',`;
  const at = src.indexOf(anchor);
  if (at === -1) { missing.push(name); continue; }
  const isCustomAt = src.indexOf('\n    isCustom:', at);
  if (isCustomAt === -1) { missing.push(name + ' (no isCustom)'); continue; }

  const lines = [];
  if (tips.generous) lines.push(`    tipGenerous: ${JSON.stringify(tips.generous)},`);
  if (tips.deadly) lines.push(`    tipDeadly: ${JSON.stringify(tips.deadly)},`);
  if (!lines.length) continue;

  // Insert right after the description line (the line before isCustom), i.e. at
  // the newline that precedes "    isCustom:".
  src = src.slice(0, isCustomAt) + '\n' + lines.join('\n') + src.slice(isCustomAt);
  injected++;
}

writeFileSync(FILE, src);
console.log(`injected tips into ${injected} monsters`);
if (missing.length) console.log(`NOT FOUND (${missing.length}): ${missing.join(' | ')}`);
