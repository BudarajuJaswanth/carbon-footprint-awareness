const fs = require('fs');
const path = require('path');

function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  fs.readdirSync(from).forEach(element => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

try {
  console.log('Starting static build process...');
  
  // Ensure dist exists and is clean
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  fs.mkdirSync('dist');

  // Copy root files
  fs.copyFileSync('index.html', 'dist/index.html');
  fs.copyFileSync('manifest.json', 'dist/manifest.json');
  fs.copyFileSync('sw.js', 'dist/sw.js');
  
  // Copy src folder recursively
  copyFolderSync('src', 'dist/src');

  console.log('Build completed successfully! Static files copied to dist/');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
