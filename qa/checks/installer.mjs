import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('../test.config.json', import.meta.url), 'utf8'));
const profiles = {
  quick: ['installer-smoke'],
  full: ['installer-smoke', 'installer-dist', 'installer-artifact', 'installer-nsis-manual'],
};

export function getInstallerChecks(profile = 'quick') {
  const ids = profiles[profile];
  if (!ids) throw new Error(`Perfil no soportado: ${profile}`);
  return ids.map((id) => ({ id, ...config[id] }));
}
