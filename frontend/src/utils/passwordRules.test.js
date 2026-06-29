import { describe, it, expect } from 'vitest';
import { checkRules, strengthLevel, strengthLabel } from './passwordRules.js';

describe('checkRules', () => {
  it('retorna 5 reglas', () => {
    expect(checkRules('abc').length).toBe(5);
  });

  it('detecta longitud >= 8', () => {
    expect(checkRules('abcdefgh').find(r => r.key === 'length').met).toBe(true);
    expect(checkRules('abc').find(r => r.key === 'length').met).toBe(false);
  });

  it('detecta mayúscula', () => {
    expect(checkRules('A').find(r => r.key === 'uppercase').met).toBe(true);
    expect(checkRules('a').find(r => r.key === 'uppercase').met).toBe(false);
  });

  it('detecta minúscula', () => {
    expect(checkRules('a').find(r => r.key === 'lowercase').met).toBe(true);
    expect(checkRules('A').find(r => r.key === 'lowercase').met).toBe(false);
  });

  it('detecta número', () => {
    expect(checkRules('1').find(r => r.key === 'number').met).toBe(true);
    expect(checkRules('a').find(r => r.key === 'number').met).toBe(false);
  });

  it('detecta carácter especial', () => {
    expect(checkRules('!').find(r => r.key === 'special').met).toBe(true);
    expect(checkRules('a').find(r => r.key === 'special').met).toBe(false);
  });

  it('contraseña fuerte cumple todas', () => {
    const rules = checkRules('StrongP@ss1');
    expect(rules.every(r => r.met)).toBe(true);
  });
});

describe('strengthLevel', () => {
  it('cuenta reglas cumplidas', () => {
    expect(strengthLevel(checkRules(''))).toBe(0);
    expect(strengthLevel(checkRules('StrongP@ss1'))).toBe(5);
  });
});

describe('strengthLabel', () => {
  it('retorna la etiqueta correcta', () => {
    expect(strengthLabel(0)).toBe('weak');
    expect(strengthLabel(1)).toBe('weak');
    expect(strengthLabel(2)).toBe('fair');
    expect(strengthLabel(3)).toBe('fair');
    expect(strengthLabel(4)).toBe('good');
    expect(strengthLabel(5)).toBe('strong');
  });
});
