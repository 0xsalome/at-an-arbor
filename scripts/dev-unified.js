import { spawn } from 'node:child_process';

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const children = [];

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
console.log('[dev-unified] SPA: http://127.0.0.1:3000/at-an-arbor/');
console.log('[dev-unified] Blog: http://127.0.0.1:4321/at-an-arbor/blog/');

run('copy-images', 'node', ['scripts/copy-images.js', '--watch']);
run('astro-dev', npmCmd, ['run', 'dev', '--prefix', 'astro-blog']);
run('vite-dev', npmCmd, ['run', 'dev:vite']);
