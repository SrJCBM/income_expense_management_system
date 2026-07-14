#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getWebChecks } from './checks/web.mjs';
import { getInstallerChecks } from './checks/installer.mjs';
import { getMobileChecks } from './checks/mobile.mjs';
import { getBackendChecks } from './checks/backend.mjs';
import { runArtifactCheck, runCommand } from './lib/command-runner.mjs';
import { writeReports } from './lib/report-writer.mjs';

const qaRoot = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.dirname(qaRoot);
const validModules = ['backend', 'web', 'installer', 'mobile', 'all'];
const validProfiles = ['quick', 'full'];

function usage(message) {
  if (message) console.error(message);
  console.error('Uso: node qa/run-tests.mjs <backend|web|installer|mobile|all> [--profile quick|full] [--dry-run]');
  process.exitCode = 2;
}

function parseArgs(args) {
  const module = args[0];
  if (!validModules.includes(module)) throw new Error(`Módulo no soportado: ${module ?? '(vacío)'}`);
  let profile = 'quick';
  let dryRun = false;
  for (let index = 1; index < args.length; index += 1) {
    if (args[index] === '--dry-run') dryRun = true;
    else if (args[index] === '--profile') profile = args[++index];
    else throw new Error(`Argumento no soportado: ${args[index]}`);
  }
  if (!validProfiles.includes(profile)) throw new Error(`Perfil no soportado: ${profile ?? '(vacío)'}`);
  return { module, profile, dryRun };
}

function checksFor(module, profile) {
  const modules = module === 'all' ? ['backend', 'web', 'installer', 'mobile'] : [module];
  return modules.flatMap((name) => ({
    backend: getBackendChecks,
    web: getWebChecks,
    installer: getInstallerChecks,
    mobile: getMobileChecks,
  })[name](profile));
}

function resolveCheck(check) {
  return {
    ...check,
    cwd: check.cwd ? path.join(projectRoot, check.cwd) : projectRoot,
    artifact: check.artifact ? path.join(projectRoot, check.artifact) : undefined,
  };
}

async function main() {
  let selection;
  try {
    selection = parseArgs(process.argv.slice(2));
  } catch (error) {
    usage(error.message);
    return;
  }

  const startedAt = new Date().toISOString();
  const results = [];
  const resultById = new Map();
  for (const rawCheck of checksFor(selection.module, selection.profile)) {
    const check = resolveCheck(rawCheck);
    const dependency = check.dependsOn ? resultById.get(check.dependsOn) : null;
    const skipReason = selection.dryRun
      ? 'dry-run'
      : dependency?.status === 'FAIL' || dependency?.status === 'SKIPPED'
        ? `Dependencia ${check.dependsOn}: ${dependency.status}`
        : undefined;

    let result;
    if (check.manual) result = await runCommand(check);
    else if (check.artifact) result = await runArtifactCheck(check, { skipReason });
    else result = await runCommand(check, { skipReason });
    results.push(result);
    resultById.set(check.id, result);
    console.log(`[${result.status}] ${result.module}: ${result.name}`);
  }

  const summary = {
    startedAt,
    finishedAt: new Date().toISOString(),
    module: selection.module,
    profile: selection.profile,
    dryRun: selection.dryRun,
    results,
  };
  const reportPaths = await writeReports(summary, path.join(qaRoot, 'reports'));
  const counts = results.reduce((all, result) => {
    all[result.status] = (all[result.status] ?? 0) + 1;
    return all;
  }, {});
  console.log(`Perfil: ${selection.profile}`);
  for (const status of ['PASS', 'FAIL', 'SKIPPED', 'PENDING_MANUAL']) console.log(`${status}: ${counts[status] ?? 0}`);
  console.log(`Reporte Markdown: ${reportPaths.markdownPath}`);
  console.log(`Reporte JSON: ${reportPaths.jsonPath}`);
  if ((counts.FAIL ?? 0) > 0) process.exitCode = 1;
}

await main();
