const { spawn } = require('child_process');

console.log('Attempting to run TypeScript compiler...');

const tsc = spawn('npx', ['tsc', '--noEmit'], {
  cwd: process.cwd(),
  stdio: ['pipe', 'pipe', 'pipe']
});

tsc.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

tsc.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

tsc.on('close', (code) => {
  console.log(`Child process exited with code ${code}`);
});