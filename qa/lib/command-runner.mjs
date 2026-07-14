import { spawn } from 'node:child_process';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

const OUTPUT_LIMIT = 4000;

function commandText(command = []) {
  return command.map((part) => (/\s/.test(part) ? JSON.stringify(part) : part)).join(' ');
}

function baseResult(check, status, durationMs = 0, extra = {}) {
  return {
    id: check.id,
    module: check.module,
    name: check.name,
    status,
    command: commandText(check.command),
    cwd: check.cwd ? path.resolve(check.cwd) : '',
    durationMs: Math.round(durationMs),
    reason: check.reason ?? '',
    outputTail: '',
    evidence: check.evidence ?? [],
    exitCode: null,
    ...extra,
  };
}

function executableForPlatform(executable) {
  if (process.platform === 'win32' && executable === 'npm') return 'npm.cmd';
  if (process.platform === 'win32' && executable === 'npx') return 'npx.cmd';
  return executable;
}

export async function runCommand(check, options = {}) {
  if (check.manual) return baseResult(check, 'PENDING_MANUAL');
  if (options.skipReason) return baseResult(check, 'SKIPPED', 0, { reason: options.skipReason });

  const [rawExecutable, ...args] = check.command ?? [];
  if (!rawExecutable) {
    return baseResult(check, 'FAIL', 0, { reason: 'La comprobación no define un comando.' });
  }

  const started = performance.now();
  return new Promise((resolve) => {
    let output = '';
    const child = spawn(executableForPlatform(rawExecutable), args, {
      cwd: check.cwd,
      env: process.env,
      shell: false,
      windowsHide: true,
    });

    const append = (chunk) => {
      output = `${output}${chunk}`.slice(-OUTPUT_LIMIT);
    };
    child.stdout?.on('data', append);
    child.stderr?.on('data', append);

    child.on('error', (error) => {
      resolve(baseResult(check, 'FAIL', performance.now() - started, {
        reason: error.message,
        outputTail: output.trim(),
      }));
    });

    child.on('close', (exitCode) => {
      const status = exitCode === 0 ? 'PASS' : 'FAIL';
      resolve(baseResult(check, status, performance.now() - started, {
        exitCode,
        reason: exitCode === 0 ? '' : `El proceso terminó con código ${exitCode}.`,
        outputTail: output.trim(),
      }));
    });
  });
}
