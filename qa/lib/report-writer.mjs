import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

function timestamp(iso) {
  return iso.replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
}

function cell(value) {
  return String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function duration(ms) {
  return `${(Number(ms ?? 0) / 1000).toFixed(2)} s`;
}

function markdownFor(summary) {
  const lines = [
    '# Reporte de pruebas FinanceApp',
    '',
    `- Inicio: ${summary.startedAt}`,
    `- Fin: ${summary.finishedAt}`,
    `- Selección: ${summary.module}`,
    `- Perfil: ${summary.profile}`,
    '',
    '| Módulo | Comprobación | Estado | Duración | Motivo/Evidencia |',
    '|---|---|---|---:|---|',
  ];

  for (const result of summary.results) {
    const details = [result.reason, ...(result.evidence ?? [])].filter(Boolean).join(' · ');
    lines.push(`| ${cell(result.module)} | ${cell(result.name)} | ${cell(result.status)} | ${duration(result.durationMs)} | ${cell(details)} |`);
  }

  const counts = summary.results.reduce((all, result) => {
    all[result.status] = (all[result.status] ?? 0) + 1;
    return all;
  }, {});
  lines.push('', '## Resumen', '');
  for (const status of ['PASS', 'FAIL', 'SKIPPED', 'PENDING_MANUAL']) {
    lines.push(`- ${status}: ${counts[status] ?? 0}`);
  }
  return `${lines.join('\n')}\n`;
}

export async function writeReports(summary, outputDir) {
  await mkdir(outputDir, { recursive: true });
  const suffix = timestamp(summary.startedAt);
  const jsonPath = path.join(outputDir, `qa-report-${suffix}.json`);
  const markdownPath = path.join(outputDir, `qa-report-${suffix}.md`);
  await writeFile(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  await writeFile(markdownPath, markdownFor(summary), 'utf8');
  return { markdownPath, jsonPath };
}
