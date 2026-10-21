import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadLocalEnv } from './env-utils.mjs';

loadLocalEnv();

const publicConfig = {
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  APP_URL: process.env.APP_URL || '',
};

writeFileSync(
  resolve(process.cwd(), 'public/runtime-config.js'),
  `globalThis.__UR_FASHION_CONFIG__ = ${JSON.stringify(publicConfig)};\n`,
  'utf8',
);
