// Frees a TCP port by killing whatever process is holding it.
// Runs automatically before `npm run dev` (see "predev" in package.json) so a
// stale dev server left running overnight can't squat on the port and cause the
// "Jest worker child process exceptions" / EADDRINUSE loop on resume.
import { execSync } from 'node:child_process';

const port = process.env.PORT || process.argv[2] || '3001';
const isWin = process.platform === 'win32';

function pidsOnPort() {
  try {
    if (isWin) {
      const out = execSync('netstat -ano -p tcp', { encoding: 'utf8' });
      const pids = new Set();
      for (const line of out.split('\n')) {
        // Match only the LISTENING socket on this exact port. The trailing
        // space after the port guards against e.g. :30011 matching :3001.
        if (line.includes(`:${port} `) && line.includes('LISTENING')) {
          const pid = line.trim().split(/\s+/).pop();
          if (/^\d+$/.test(pid) && pid !== '0') pids.add(pid);
        }
      }
      return [...pids];
    }
    const out = execSync(`lsof -ti tcp:${port} -s tcp:LISTEN`, { encoding: 'utf8' });
    return out.split('\n').map((s) => s.trim()).filter(Boolean);
  } catch {
    return []; // nothing listening, or the lookup tool isn't available
  }
}

const pids = pidsOnPort();
if (pids.length === 0) {
  console.log(`Port ${port} is free.`);
} else {
  for (const pid of pids) {
    try {
      execSync(isWin ? `taskkill /F /PID ${pid}` : `kill -9 ${pid}`, { stdio: 'ignore' });
      console.log(`Freed port ${port}: killed stale process ${pid}.`);
    } catch (e) {
      console.warn(`Could not kill PID ${pid} on port ${port}: ${e.message}`);
    }
  }
}
