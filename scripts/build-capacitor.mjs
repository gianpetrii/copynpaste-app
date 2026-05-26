#!/usr/bin/env node
/**
 * Build script for Capacitor: temporarily moves API routes out of app/
 * because Next.js static export fails when Route Handlers exist.
 */
import { cpSync, existsSync, mkdirSync, renameSync, rmSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const root = process.cwd();
const apiPath = join(root, 'app', 'api');
const backupPath = join(root, '.capacitor-build', 'api-backup');
const apiMoved = existsSync(backupPath);

function moveApiOut() {
  if (existsSync(apiPath)) {
    mkdirSync(join(root, '.capacitor-build'), { recursive: true });
    if (existsSync(backupPath)) rmSync(backupPath, { recursive: true, force: true });
    cpSync(apiPath, backupPath, { recursive: true });
    rmSync(apiPath, { recursive: true, force: true });
    console.log('📦 API routes moved to backup for static export');
  }
}

function restoreApi() {
  if (existsSync(backupPath) && !existsSync(apiPath)) {
    cpSync(backupPath, apiPath, { recursive: true });
    rmSync(backupPath, { recursive: true, force: true });
    console.log('✅ API routes restored');
  }
}

try {
  moveApiOut();
  execSync('next build', {
    stdio: 'inherit',
    env: { ...process.env, CAPACITOR_BUILD: 'true' },
  });
  execSync('npx cap sync', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Capacitor build failed:', error.message);
  process.exitCode = 1;
} finally {
  restoreApi();
  if (existsSync(join(root, '.capacitor-build')) && !existsSync(backupPath)) {
    rmSync(join(root, '.capacitor-build'), { recursive: true, force: true });
  }
}
