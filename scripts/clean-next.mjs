// Removes the Turbopack/build caches. Use via `npm run dev:clean` for the rarer
// case where the on-disk .next cache is corrupted (and freeing the port alone
// doesn't recover the dev server).
import { rmSync } from 'node:fs';

for (const dir of ['.next', 'node_modules/.cache']) {
  rmSync(dir, { recursive: true, force: true });
  console.log(`Removed ${dir}`);
}
