import { spawn } from 'node:child_process';

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const children = [];
const SPA_PORT = '3000';
const ASTRO_PORT = '4321';

function run(name, command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    ...options,
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`[dev-unified] ${name} exited by signal: ${signal}`);
      return;
    }
    if (code !== 0) {
      console.log(`[dev-unified] ${name} exited with code: ${code}`);
      shutdown(code ?? 1);
    }
  });

  children.push(child);
  return child;
}

let shuttingDown = false;
function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
  process.exit(exitCode);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log('[dev-unified] starting copy-images watcher, Astro dev, and Vite dev...');
console.log(`[dev-unified] Demo URL: http://127.0.0.1:${SPA_PORT}/at-an-arbor/`);

run('copy-images', 'node', ['scripts/copy-images.js', '--watch', '--quiet']);
run('astro-dev', npmCmd, ['run', 'dev', '--prefix', 'astro-blog', '--', '--host', '127.0.0.1', '--port', ASTRO_PORT, '--strictPort']);
run('vite-dev', npmCmd, ['run', 'dev:vite', '--', '--host', '127.0.0.1', '--port', SPA_PORT, '--strictPort']);
