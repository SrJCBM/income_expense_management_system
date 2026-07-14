import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('../test.config.json', import.meta.url), 'utf8'));
const profiles = {
  quick: ['backend-unit'],
  full: ['backend-coverage'],
};

export function getBackendChecks(profile = 'quick') {
  const ids = profiles[profile];
  if (!ids) throw new Error(`Perfil no soportado: ${profile}`);
  return ids.map((id) => ({ id, ...config[id] }));
}
