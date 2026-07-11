import { describe, it, expect } from 'vitest';
import { corsOptions } from '../../src/config/corsConfig.js';

// corsOptions.origin usa callback estilo Node: (err, allowed)
const checkOrigin = (origin) =>
  new Promise((resolve) => {
    corsOptions.origin(origin, (err, allowed) => resolve({ err, allowed }));
  });

describe('corsOptions — orígenes del WebView de Capacitor', () => {
  it('permite capacitor://localhost (WebView Android, esquema capacitor)', async () => {
    const { err, allowed } = await checkOrigin('capacitor://localhost');
    expect(err).toBeNull();
    expect(allowed).toBe(true);
  });

  it('permite https://localhost (WebView Android, androidScheme https)', async () => {
    const { err, allowed } = await checkOrigin('https://localhost');
    expect(err).toBeNull();
    expect(allowed).toBe(true);
  });

  it('sigue rechazando orígenes desconocidos', async () => {
    const { err } = await checkOrigin('https://evil.example.com');
    expect(err).toBeInstanceOf(Error);
  });
});
