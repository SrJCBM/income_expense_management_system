const SPECIAL = /[!@#$%^&*]/;

export const checkRules = (password) => [
  { key: 'length',    met: password.length >= 8 },
  { key: 'uppercase', met: /[A-Z]/.test(password) },
  { key: 'lowercase', met: /[a-z]/.test(password) },
  { key: 'number',    met: /[0-9]/.test(password) },
  { key: 'special',   met: SPECIAL.test(password) },
];

export const strengthLevel = (rules) => rules.filter((r) => r.met).length;

export const strengthLabel = (count) =>
  count <= 1 ? 'weak' : count <= 3 ? 'fair' : count === 4 ? 'good' : 'strong';
