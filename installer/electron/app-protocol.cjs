const path = require('node:path');
const { pathToFileURL } = require('node:url');

const APP_SCHEME = 'app';
const APP_HOST = 'financeapp';
const APP_URL = `${APP_SCHEME}://${APP_HOST}/`;

function resolveAppRequestPath(rootDir, requestUrl) {
  let url;
  try {
    url = new URL(requestUrl);
  } catch {
    return null;
  }

  if (url.protocol !== `${APP_SCHEME}:` || url.hostname !== APP_HOST) {
    return null;
  }

  let requestedPath;
  try {
    requestedPath = decodeURIComponent(url.pathname);
  } catch {
    return null;
  }

  if (requestedPath.includes('\0')) {
    return null;
  }

  const relativeRequest = requestedPath === '/'
    ? 'index.html'
    : requestedPath.replace(/^\/+/, '');
  const resolvedRoot = path.resolve(rootDir);
  const resolvedPath = path.resolve(resolvedRoot, relativeRequest);
  const relativePath = path.relative(resolvedRoot, resolvedPath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return null;
  }

  return resolvedPath;
}

function registerAppProtocol({ protocol, net, rootDir }) {
  protocol.handle(APP_SCHEME, (request) => {
    const filePath = resolveAppRequestPath(rootDir, request.url);
    if (!filePath) {
      return new Response('Not found', { status: 404 });
    }

    return net.fetch(pathToFileURL(filePath).toString());
  });
}

module.exports = {
  APP_HOST,
  APP_SCHEME,
  APP_URL,
  registerAppProtocol,
  resolveAppRequestPath,
};
