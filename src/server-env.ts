import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadServerEnvironment(cwd = process.cwd()) {
  for (const file of ['.env.local', '.env']) {
    const path = resolve(cwd, file);
    if (!existsSync(path)) continue;

    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index < 0) continue;
      const key = trimmed.slice(0, index).trim();
      const rawValue = trimmed.slice(index + 1).trim();
      const value = rawValue.replace(/^['"]|['"]$/g, '');
      process.env[key] ||= value;
    }
  }
}
