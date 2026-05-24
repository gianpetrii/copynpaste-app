#!/usr/bin/env node
/**
 * Copia los iconos SVG existentes como base para los proyectos nativos.
 * Para producción, generar PNGs con @capacitor/assets: npx @capacitor/assets generate --iconBackgroundColor '#000000'
 */
import { cpSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const sourceIcon = join(root, 'public', 'icons', 'icon-512x512.svg');

const targets = [
  join(root, 'resources', 'icon.svg'),
  join(root, 'resources', 'splash.svg'),
];

if (!existsSync(sourceIcon)) {
  console.error('❌ Icono fuente no encontrado:', sourceIcon);
  process.exit(1);
}

mkdirSync(join(root, 'resources'), { recursive: true });

for (const target of targets) {
  cpSync(sourceIcon, target);
  console.log(`✅ Copiado a ${target}`);
}

console.log('\nPara generar iconos nativos completos, ejecuta en macOS/Linux con ImageMagick o usa:');
console.log('  npx @capacitor/assets generate --iconBackgroundColor "#000000" --splashBackgroundColor "#000000"');
