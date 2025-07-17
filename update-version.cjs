#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

if (process.argv.length < 3) {
  console.error('Usage: node update-version.js <version>');
  process.exit(1);
}

let inputVersion = process.argv[2];
let version = inputVersion.replace(/^v/, ''); // Remove leading 'v' if present
let versionTag = inputVersion.startsWith('v') ? inputVersion : `v${version}`;

// 1. Update package.json
const pkgPath = path.join(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.version = version;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`Updated package.json to version ${version}`);

// 2. Update src-tauri/tauri.conf.json
const tauriConfPath = path.join(__dirname, 'src-tauri', 'tauri.conf.json');
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
if (tauriConf.package && tauriConf.package.version !== undefined) {
  tauriConf.package.version = version;
  fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n');
  console.log(`Updated src-tauri/tauri.conf.json to version ${version}`);
} else {
  console.warn('No version field found in src-tauri/tauri.conf.json');
}

// 3. Update src/App.tsx (replace version in JSX)
const appPath = path.join(__dirname, 'src', 'App.tsx');
let appContent = fs.readFileSync(appPath, 'utf8');
const appVersionRegex = /(<div className="version-label">Version )([\dv\.]+)(<\/div>)/;
if (appVersionRegex.test(appContent)) {
  appContent = appContent.replace(appVersionRegex, `$1${version}$3`);
  fs.writeFileSync(appPath, appContent);
  console.log(`Updated src/App.tsx to version ${version}`);
} else {
  console.warn('No version label found in src/App.tsx');
}

console.log('Version update complete.');
console.log('If you want to update package-lock.json, run: npm install');

// 4. Git operations
try {
  // Stage the modified files
  execSync(`git add .`, { stdio: 'inherit' });
  console.log('Staged modified files.');

  // Commit with version message
  const commitMsg = `Version ${versionTag} release`;
  execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
  console.log(`Created commit: ${commitMsg}`);

  // Push commit to origin main
  execSync(`git push origin main`, { stdio: 'inherit' });
  console.log('Pushed commit to origin main.');

  // Create git tag
  execSync(`git tag ${versionTag}`, { stdio: 'inherit' });
  console.log(`Created git tag ${versionTag}`);

  // Push tag to origin
  execSync(`git push origin ${versionTag}`, { stdio: 'inherit' });
  console.log(`Pushed tag ${versionTag} to origin.`);
} catch (err) {
  console.error('Git operation failed:', err.message);
  process.exit(1);
} 