import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  APP_HOST,
  APP_SCHEME,
  APP_URL,
  registerAppProtocol,
  resolveAppRequestPath,
} = require('../electron/app-protocol.cjs');

test('expone un origen estable y seguro para FinanceApp', () => {
  assert.equal(APP_SCHEME, 'app');
  assert.equal(APP_HOST, 'financeapp');
  assert.equal(APP_URL, 'app://financeapp/');
});

test('resuelve la raiz y los assets dentro del dist autorizado', () => {
  const root = path.resolve('C:/FinanceApp/dist');

  assert.equal(resolveAppRequestPath(root, APP_URL), path.join(root, 'index.html'));
  assert.equal(
    resolveAppRequestPath(root, 'app://financeapp/assets/index.js'),
    path.join(root, 'assets', 'index.js'),
  );
});

test('rechaza hosts, esquemas y recorridos fuera del dist', () => {
  const root = path.resolve('C:/FinanceApp/dist');

  assert.equal(resolveAppRequestPath(root, 'app://otro/index.html'), null);
  assert.equal(resolveAppRequestPath(root, 'https://financeapp/index.html'), null);
  assert.equal(resolveAppRequestPath(root, 'app://financeapp/%2e%2e%2fsecret.txt'), null);
  assert.equal(resolveAppRequestPath(root, 'app://financeapp/%00.txt'), null);
});

test('registra el manejador y entrega archivos mediante net.fetch', async () => {
  const root = path.resolve('C:/FinanceApp/dist');
  let handler;
  const protocol = {
    handle(scheme, candidate) {
      assert.equal(scheme, APP_SCHEME);
      handler = candidate;
    },
  };
  const calls = [];
  const net = {
    fetch(url) {
      calls.push(url);
      return Promise.resolve(new Response('ok'));
    },
  };

  registerAppProtocol({ protocol, net, rootDir: root });
  const response = await handler({ url: 'app://financeapp/index.html' });

  assert.equal(await response.text(), 'ok');
  assert.deepEqual(calls, [pathToFileURL(path.join(root, 'index.html')).toString()]);

  const rejected = await handler({ url: 'app://financeapp/%2e%2e%2fsecret.txt' });
  assert.equal(rejected.status, 404);
  assert.equal(calls.length, 1);
});
