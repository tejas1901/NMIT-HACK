import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('       FREIGHTIQ UNIFIED MULTI-SERVICE DEV RUNNER (DEV:ALL)      ');
console.log('================================================================\n');

function checkPortInUse(port) {
  return new Promise((resolve) => {
    const client = http.get(`http://localhost:${port}/`, (res) => {
      resolve(true);
    });
    client.on('error', () => {
      resolve(false);
    });
    client.setTimeout(1000, () => {
      client.destroy();
      resolve(false);
    });
  });
}

async function startAll() {
  const children = [];

  const services = [
    {
      name: 'ML FastAPI (8000)',
      port: 8000,
      cwd: rootDir,
      cmd: process.platform === 'win32' ? 'uvicorn' : 'uvicorn',
      args: ['backend.main:app', '--host', '0.0.0.0', '--port', '8000']
    },
    {
      name: 'Node Gateway (3001)',
      port: 3001,
      cwd: path.join(rootDir, 'backend-node'),
      cmd: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['tsx', 'src/server.ts']
    },
    {
      name: 'Vite Frontend (3000)',
      port: 3000,
      cwd: rootDir,
      cmd: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['vite', '--port=3000', '--host=0.0.0.0']
    }
  ];

  for (const svc of services) {
    const isRunning = await checkPortInUse(svc.port);
    if (isRunning) {
      console.log(`[+] ${svc.name} is already RUNNING on port ${svc.port}. (Reusing active instance)`);
    } else {
      console.log(`[>] Launching ${svc.name}...`);
      try {
        const child = spawn(svc.cmd, svc.args, {
          cwd: svc.cwd,
          stdio: 'inherit',
          shell: true
        });
        children.push(child);
      } catch (err) {
        console.error(`[-] Failed to launch ${svc.name}:`, err.message);
      }
    }
  }

  console.log('\n----------------------------------------------------------------');
  console.log('All FreightIQ services are active:');
  console.log('  • Frontend Portal:     http://localhost:3000');
  console.log('  • Express Node API:    http://localhost:3001/health');
  console.log('  • Python FastAPI ML:   http://localhost:8000/ml/health');
  console.log('----------------------------------------------------------------\n');

  function cleanup() {
    console.log('\nShutting down dev:all processes...');
    for (const child of children) {
      try {
        child.kill();
      } catch (_) {}
    }
    process.exit(0);
  }

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // Keep alive if any child spawned or running
  setInterval(() => {}, 10000);
}

startAll().catch(err => {
  console.error('Error starting services:', err);
  process.exit(1);
});

