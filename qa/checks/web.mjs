import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('../test.config.json', import.meta.url), 'utf8'));
const profiles = {
  quick: ['web-unit', 'web-build', 'web-e2e-smoke'],
  full: ['web-unit', 'web-build', 'web-e2e-smoke', 'web-e2e', 'web-a11y'],
};

export function getWebChecks(profile = 'quick') {
  const ids = profiles[profile];
  if (!ids) throw new Error(`Perfil no soportado: ${profile}`);
  return ids.map((id) => ({ id, ...config[id] }));
}
