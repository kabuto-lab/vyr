const chokidar = require('chokidar');
const { exec, spawn } = require('child_process');
const path = require('path');

console.log('🔄 Auto-deploy watcher started...');
console.log('📁 Watching for changes in src/ directory...');

// Global variables to manage the dev server process
let devServerProcess = null;
let restartInProgress = false;

// Function to kill the current dev server process
function killDevServer() {
  if (devServerProcess) {
    console.log('🛑 Stopping current dev server...');
    devServerProcess.kill('SIGTERM');
    devServerProcess = null;
  }
}

// Function to start the dev server
function startDevServer() {
  if (restartInProgress) return;
  
  restartInProgress = true;
  console.log('🚀 Starting dev server...');
  
  // Kill any existing server first
  killDevServer();
  
  // Start a new dev server process
  devServerProcess = spawn('npm', ['run', 'dev'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true
  });

  devServerProcess.stdout.on('data', (data) => {
    console.log(`(STDOUT) ${data}`);
  });

  devServerProcess.stderr.on('data', (data) => {
    console.error(`(STDERR) ${data}`);
  });

  devServerProcess.on('close', (code) => {
    console.log(`.Dev server exited with code ${code}`);
    devServerProcess = null;
    restartInProgress = false;
  });
}

// Function to run deploy.bat
function runDeploy() {
  console.log('📦 Running deploy.bat...');
  
  const deployProcess = exec('deploy.bat', { cwd: process.cwd() }, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Deploy error: ${error.message}`);
      return;
    }
    
    if (stderr) {
      console.error(`⚠️ Deploy stderr: ${stderr}`);
    }
    
    console.log(`✅ Deploy output: ${stdout}`);
  });
}

// Start the initial dev server
setTimeout(startDevServer, 1000);

// Watch for changes in src directory
chokidar.watch('src/**/*', {
  ignored: /(^|[\/\\])\../, // Ignore dotfiles
  persistent: true
}).on('change', (filePath) => {
  console.log(`📝 File changed: ${filePath}`);
  
  // Restart the dev server
  startDevServer();
  
  // Wait a bit for the server to restart, then run deploy
  setTimeout(runDeploy, 3000);
}).on('add', (filePath) => {
  console.log(`➕ File added: ${filePath}`);
  
  // Restart the dev server
  startDevServer();
  
  // Wait a bit for the server to restart, then run deploy
  setTimeout(runDeploy, 3000);
}).on('unlink', (filePath) => {
  console.log(`➖ File removed: ${filePath}`);
  
  // Restart the dev server
  startDevServer();
  
  // Wait a bit for the server to restart, then run deploy
  setTimeout(runDeploy, 3000);
});

console.log('✅ Watcher is running. Press Ctrl+C to stop.');
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  killDevServer();
  process.exit(0);
});