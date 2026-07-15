import { describe, it, expect, afterEach, vi } from 'vitest';

// Escenario real de Render: NODE_ENV=production desactiva el bypass de dev,
// así que los orígenes del WebView de Capacitor deben estar en la allowlist.
const loadProdCorsOptions = async () => {
  vi.resetModules();
  vi.stubEnv('NODE_ENV', 'production');
  const { corsOptions } = await import('../../src/config/corsConfig.js');
  return corsOptions;
};

const checkOrigin = (corsOptions, origin) =>
  new Promise((resolve) => {
    corsOptions.origin(origin, (err, allowed) => resolve({ err, allowed }));
  });

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('corsOptions con NODE_ENV=production (escenario Render)', () => {
  it('permite capacitor://localhost', async () => {
    const corsOptions = await loadProdCorsOptions();
    const { err, allowed } = await checkOrigin(corsOptions, 'capacitor://localhost');
    expect(err).toBeNull();
    expect(allowed).toBe(true);
  });

  it('permite https://localhost', async () => {
    const corsOptions = await loadProdCorsOptions();
    const { err, allowed } = await checkOrigin(corsOptions, 'https://localhost');
    expect(err).toBeNull();
    expect(allowed).toBe(true);
  });

  it('permite http://localhost', async () => {
    const corsOptions = await loadProdCorsOptions();
    const { err, allowed } = await checkOrigin(corsOptions, 'http://localhost');
    expect(err).toBeNull();
    expect(allowed).toBe(true);
  });

  it('permite el origen estable del cliente Electron', async () => {
    const corsOptions = await loadProdCorsOptions();
    const { err, allowed } = await checkOrigin(corsOptions, 'app://financeapp');
    expect(err).toBeNull();
    expect(allowed).toBe(true);
  });

  it('rechaza el origen opaco null', async () => {
    const corsOptions = await loadProdCorsOptions();
    const { err } = await checkOrigin(corsOptions, 'null');
    expect(err).toBeInstanceOf(Error);
  });

  it('rechaza un puerto localhost arbitrario (sin bypass de desarrollo)', async () => {
    const corsOptions = await loadProdCorsOptions();
    const { err } = await checkOrigin(corsOptions, 'http://localhost:4321');
    expect(err).toBeInstanceOf(Error);
  });
});
