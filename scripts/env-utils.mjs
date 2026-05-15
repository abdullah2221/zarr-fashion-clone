import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadLocalEnv(cwd = process.cwd()) {
  for (const file of ['.env.local', '.env']) {
    const path = resolve(cwd, file);
    if (!existsSync(path)) continue;
    const lines = readFileSync(path, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index < 0) continue;
      const key = trimmed.slice(0, index).trim();
      const raw = trimmed.slice(index + 1).trim();
      const value = raw.replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) process.env[key] = value;
    }
  }
}
