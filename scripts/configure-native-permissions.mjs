#!/usr/bin/env node
/**
 * Configura permisos nativos en iOS y Android después de `npx cap add`.
 * Ejecutar: node scripts/configure-native-permissions.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const root = process.cwd();

function configureAndroid() {
  const manifestPath = join(root, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
  if (!existsSync(manifestPath)) {
    console.log('⚠️  AndroidManifest.xml no encontrado. Ejecuta `npx cap add android` primero.');
    return;
  }

  let manifest = readFileSync(manifestPath, 'utf8');

  const permissions = [
    'android.permission.INTERNET',
    'android.permission.USE_BIOMETRIC',
    'android.permission.USE_FINGERPRINT',
    'android.permission.POST_NOTIFICATIONS',
    'android.permission.VIBRATE',
  ];

  for (const permission of permissions) {
    const tag = `android:name="${permission}"`;
    if (!manifest.includes(tag)) {
      manifest = manifest.replace(
        '<manifest',
        `<manifest`
      );
      manifest = manifest.replace(
        '</manifest>',
        `    <uses-permission android:name="${permission}" />\n</manifest>`
      );
    }
  }

  writeFileSync(manifestPath, manifest);
  console.log('✅ AndroidManifest.xml actualizado con permisos');
}

function configureIOS() {
  const plistPath = join(root, 'ios', 'App', 'App', 'Info.plist');
  if (!existsSync(plistPath)) {
    console.log('⚠️  Info.plist no encontrado. Ejecuta `npx cap add ios` primero.');
    return;
  }

  let plist = readFileSync(plistPath, 'utf8');

  const entries = {
    NSFaceIDUsageDescription:
      'CopyNPaste usa Face ID para iniciar sesión de forma segura.',
    NSUserNotificationsUsageDescription:
      'CopyNPaste envía notificaciones sobre sincronización y actualizaciones.',
  };

  for (const [key, value] of Object.entries(entries)) {
    if (!plist.includes(`<key>${key}</key>`)) {
      plist = plist.replace(
        '</dict>\n</plist>',
        `    <key>${key}</key>\n    <string>${value}</string>\n</dict>\n</plist>`
      );
    }
  }

  writeFileSync(plistPath, plist);
  console.log('✅ Info.plist actualizado con permisos');
}

configureAndroid();
configureIOS();
