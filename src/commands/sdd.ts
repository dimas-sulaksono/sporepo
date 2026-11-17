import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { ensureDir, formatDate } from '../utils/file';
import {
  parseMetaPrompt,
  generateTaskBriefContent,
  createReviewPackage,
} from '../utils/sdd-parser';

export interface SDDBriefResult {
  briefPath: string;
  reportPath: string;
  taskNum: number;
  taskTitle: string;
  persona: string;
}

export interface SDDInitResult {
  ledgerPath: string;
  baseCommit: string;
  requestId: string;
  totalTasks: number;
}

/**
 * Initializes an SDD session and creates a progress ledger.
 */
export function sddInitCommand(metaPromptPath: string, options: { targetDir?: string; quiet?: boolean } = {}): SDDInitResult {
  const resolvedMetaPath = path.resolve(process.cwd(), metaPromptPath);
  const meta = parseMetaPrompt(resolvedMetaPath);

  let baseCommit = 'HEAD';
  try {
    baseCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' }).trim();
  } catch {
    baseCommit = 'initial-commit';
  }

  const targetDir = path.resolve(process.cwd(), options.targetDir || '.');
  const sddDir = path.join(targetDir, '.scratch', 'sdd', meta.id);
  ensureDir(sddDir);

  const ledgerPath = path.join(sddDir, 'ledger.md');
  const startedAt = formatDate();

  let tasksTable = '| Task | Title | Persona | Status | Commits | Review Verdict |\n';
  tasksTable += '| :---: | :--- | :--- | :---: | :--- | :---: |\n';

  for (const t of meta.tasks) {
    const status = t.completed ? '`DONE`' : '`PENDING`';
    tasksTable += `| ${t.taskNum} | ${t.title} | \`${t.persona}\` | ${status} | - | - |\n`;
  }

  const ledgerContent = `# SDD Ledger — Request: [${meta.id}] ${meta.title}

> **Meta-Prompt:** \`${resolvedMetaPath}\`  
> **Base Commit:** \`${baseCommit}\`  
> **Started At:** ${startedAt}  
> **Status:** \`IN_PROGRESS\`  

---

## 1. Task Execution Map

${tasksTable}

---

## 2. Rulings & Decisions Record
*Setiap keputusan sepihak Koordinator untuk menyelesaikan ambiguitas dicatat di sini:*

- \`Ruling: [Initial Setup] Menginisiasi sesi SDD dari commit ${baseCommit.substring(0, 7)}.\`

---

## 3. Progress Log
- ${startedAt}: Sesi SDD diinisiasi dengan ${meta.tasks.length} total tasks.
`;

  fs.writeFileSync(ledgerPath, ledgerContent, 'utf-8');

  if (!options.quiet) {
    console.log(`\n\x1b[32m✔ [sporepo-sdd] Sesi SDD & Ledger berhasil diinisiasi!\x1b[0m`);
    console.log(`  Request ID   : \x1b[33m${meta.id}\x1b[0m (${meta.title})`);
    console.log(`  Base Commit  : ${baseCommit.substring(0, 7)}`);
    console.log(`  Total Tasks  : ${meta.tasks.length}`);
    console.log(`  Berkas Ledger: \x1b[1m${path.relative(process.cwd(), ledgerPath)}\x1b[0m`);
    console.log(`\n\x1b[36mPerintah Berikutnya:\x1b[0m`);
    console.log(`  Ekstrak Brief Task 1: \x1b[1mnpx sporepo sdd brief ${metaPromptPath} 1\x1b[0m\n`);
  }

  return {
    ledgerPath,
    baseCommit,
    requestId: meta.id,
    totalTasks: meta.tasks.length,
  };
}

/**
 * Extracts a single task brief and generates paths for isolated implementer dispatch.
 */
export function sddBriefCommand(
  metaPromptPath: string,
  rawTaskNum: string | number,
  options: { out?: string; quiet?: boolean } = {}
): SDDBriefResult {
  const resolvedMetaPath = path.resolve(process.cwd(), metaPromptPath);
  const meta = parseMetaPrompt(resolvedMetaPath);
  const taskNum = typeof rawTaskNum === 'string' ? parseInt(rawTaskNum, 10) : rawTaskNum;

  if (isNaN(taskNum) || taskNum < 1) {
    throw new Error(`[sporepo-sdd] Nomor task tidak valid: "${rawTaskNum}". Harus berupa angka >= 1.`);
  }

  const task = meta.tasks.find((t) => t.taskNum === taskNum);
  if (!task) {
    throw new Error(`[sporepo-sdd] Task #${taskNum} tidak ditemukan dalam Meta-Prompt [${meta.id}].`);
  }

  const briefContent = generateTaskBriefContent(meta, taskNum);

  const defaultDir = path.join(process.cwd(), '.scratch', 'sdd', meta.id);
  ensureDir(defaultDir);

  const briefPath = options.out ? path.resolve(process.cwd(), options.out) : path.join(defaultDir, `task-${taskNum}-brief.md`);
  const reportPath = path.join(path.dirname(briefPath), `task-${taskNum}-report.md`);

  fs.writeFileSync(briefPath, briefContent, 'utf-8');

  if (!options.quiet) {
    console.log(`\n\x1b[32m✔ [sporepo-sdd] Task Brief berhasil diekstrak!\x1b[0m`);
    console.log(`  Nomor Task   : Task ${task.taskNum}: ${task.title}`);
    console.log(`  Persona      : ${task.persona}`);
    console.log(`  Berkas Brief : \x1b[1m${path.relative(process.cwd(), briefPath)}\x1b[0m`);
    console.log(`  Target Report: \x1b[1m${path.relative(process.cwd(), reportPath)}\x1b[0m`);
    console.log(`\n\x1b[35mInstruksi Dispatch Implementer Subagent:\x1b[0m`);
    console.log(`  Panggil subagent implementer dengan menyertakan path berkas brief di atas.`);
    console.log(`  Implementer WAJIB menulis laporan lengkap ke berkas target report.\n`);
  }

  return {
    briefPath,
    reportPath,
    taskNum,
    taskTitle: task.title,
    persona: task.persona,
  };
}

/**
 * Creates a git diff review package for task reviewer subagent.
 */
export function sddPackCommand(
  baseCommit: string,
  headCommit: string = 'HEAD',
  options: { out?: string; quiet?: boolean } = {}
): { packagePath: string; commitCount: number; filesChanged: number } {
  if (!baseCommit) {
    throw new Error('[sporepo-sdd] Base commit hash wajib disertakan. Contoh: sporepo sdd pack <base-hash>');
  }

  const defaultDir = path.join(process.cwd(), '.scratch', 'sdd');
  ensureDir(defaultDir);

  const outputPath = options.out
    ? path.resolve(process.cwd(), options.out)
    : path.join(defaultDir, `review-pack-${baseCommit.substring(0, 7)}-${headCommit.substring(0, 7)}.md`);

  const res = createReviewPackage(baseCommit, headCommit, outputPath);

  if (!options.quiet) {
    console.log(`\n\x1b[32m✔ [sporepo-sdd] Paket Peninjauan (Review Package) berhasil dibuat!\x1b[0m`);
    console.log(`  Range Commit : ${baseCommit.substring(0, 7)}..${headCommit.substring(0, 7)}`);
    console.log(`  Total Commits: ${res.commitCount}`);
    console.log(`  Berkas Paket : \x1b[1m${path.relative(process.cwd(), res.outputPath)}\x1b[0m`);
    console.log(`\n\x1b[35mInstruksi Dispatch Task Reviewer Subagent:\x1b[0m`);
    console.log(`  Panggil subagent reviewer dengan masukan berkas review package dan brief.`);
    console.log(`  Reviewer WAJIB memeriksa Lensa Spec Compliance dan Code Quality.\n`);
  }

  return {
    packagePath: res.outputPath,
    commitCount: res.commitCount,
    filesChanged: res.filesChanged,
  };
}

/**
 * Parses and displays human-readable summary of tasks in terminal.
 */
export function sddParseCommand(metaPromptPath: string, options: { quiet?: boolean } = {}): void {
  const resolvedMetaPath = path.resolve(process.cwd(), metaPromptPath);
  const meta = parseMetaPrompt(resolvedMetaPath);

  if (!options.quiet) {
    console.log(`\n\x1b[1m\x1b[36m📋 [sporepo-sdd] Ringkasan Tugas Meta-Prompt [${meta.id}]:\x1b[0m`);
    console.log(`  Judul   : ${meta.title}`);
    console.log(`  Status  : ${meta.status}`);
    console.log(`  Branch  : ${meta.branch}`);
    console.log(`  Allowed : ${meta.allowedFiles.length > 0 ? meta.allowedFiles.join(', ') : '(None explicit)'}`);
    console.log(`  Restr.  : ${meta.restrictedFiles.length > 0 ? meta.restrictedFiles.join(', ') : '(None explicit)'}\n`);

    console.log(`\x1b[33mDaftar Tugas Atomik (${meta.tasks.length} total):\x1b[0m`);
    for (const t of meta.tasks) {
      const mark = t.completed ? '\x1b[32m[✔]\x1b[0m' : '\x1b[31m[ ]\x1b[0m';
      console.log(`  ${mark} Task ${t.taskNum}: ${t.title} (\x1b[36m${t.persona}\x1b[0m)`);
      if (t.action) console.log(`      Aksi: ${t.action}`);
      if (t.verification) console.log(`      Uji : ${t.verification}`);
    }
    console.log('');
  }
}
