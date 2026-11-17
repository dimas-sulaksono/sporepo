import * as fs from 'fs';
import * as path from 'path';
import { ensureDir, getSporepoPaths } from '../utils/file';

export interface MigrateOptions {
  quiet?: boolean;
}

export interface MigrateResult {
  targetDir: string;
  migratedReqs: string[];
  migratedBugs: string[];
  cleanUpDone: boolean;
}

export function migrateCommand(rawTargetDir?: string, options: MigrateOptions = {}): MigrateResult {
  const paths = getSporepoPaths(rawTargetDir);
  const { targetDir, reqsDir, bugsDir, archiveReqsDir, archiveBugsDir, legacyPromptsDir, legacyBugsDir } = paths;

  const migratedReqs: string[] = [];
  const migratedBugs: string[] = [];

  const hasLegacyReqs = fs.existsSync(legacyPromptsDir);
  const hasLegacyBugs = fs.existsSync(legacyBugsDir);

  if (!hasLegacyReqs && !hasLegacyBugs) {
    if (!options.quiet) {
      console.log(`\n\x1b[33mℹ [sporepo migrate] Tidak ditemukan struktur legacy prompts/ atau tests/bugs/ di:\x1b[0m`);
      console.log(`  ${targetDir}`);
      console.log(`  Repositori sudah bersih atau belum diinisialisasi.\n`);
    }
    return { targetDir, migratedReqs, migratedBugs, cleanUpDone: false };
  }

  // Ensure target directories exist
  ensureDir(reqsDir);
  ensureDir(bugsDir);
  ensureDir(archiveReqsDir);
  ensureDir(archiveBugsDir);

  // 1. Migrate requests: prompts/request/* -> docs/sporepo/reqs/*
  if (hasLegacyReqs) {
    const files = fs.readdirSync(legacyPromptsDir);
    for (const f of files) {
      if (f.endsWith('.md')) {
        const srcFile = path.join(legacyPromptsDir, f);
        const destFile = path.join(reqsDir, f);
        fs.copyFileSync(srcFile, destFile);
        fs.unlinkSync(srcFile);
        migratedReqs.push(f);
      }
    }

    // Clean up empty legacy prompts directory
    try {
      const remaining = fs.readdirSync(legacyPromptsDir);
      if (remaining.length === 0) {
        fs.rmdirSync(legacyPromptsDir);
      }
      const parentPrompts = path.join(targetDir, 'prompts');
      const promptsRemaining = fs.readdirSync(parentPrompts).filter((f) => f !== 'README.md');
      if (promptsRemaining.length === 0) {
        fs.rmSync(parentPrompts, { recursive: true, force: true });
      }
    } catch {
      // ignore cleanup errors
    }
  }

  // 2. Migrate bugs: tests/bugs/* -> docs/sporepo/bugs/*
  if (hasLegacyBugs) {
    const files = fs.readdirSync(legacyBugsDir);
    for (const f of files) {
      if (f.endsWith('.md') && f !== 'README.md') {
        const srcFile = path.join(legacyBugsDir, f);
        const destFile = path.join(bugsDir, f);
        fs.copyFileSync(srcFile, destFile);
        fs.unlinkSync(srcFile);
        migratedBugs.push(f);
      }
    }

    // Clean up empty legacy bugs directory
    try {
      const remaining = fs.readdirSync(legacyBugsDir).filter((f) => f !== 'README.md');
      if (remaining.length === 0) {
        fs.rmSync(legacyBugsDir, { recursive: true, force: true });
      }
    } catch {
      // ignore cleanup errors
    }
  }

  if (!options.quiet) {
    console.log(`\n\x1b[32m✔ [sporepo migrate] Migrasi ke struktur docs/sporepo/ berhasil!\x1b[0m`);
    console.log(`  Lokasi Repositori : ${targetDir}`);
    console.log(`  Target Baru       : docs/sporepo/`);
    if (migratedReqs.length > 0) {
      console.log(`  Fitur Dimigrasikan (-> docs/sporepo/reqs/):`);
      migratedReqs.forEach((f) => console.log(`    + ${f}`));
    }
    if (migratedBugs.length > 0) {
      console.log(`  Bug Dimigrasikan   (-> docs/sporepo/bugs/):`);
      migratedBugs.forEach((f) => console.log(`    + ${f}`));
    }
    console.log(`\n\x1b[36mStruktur repositori kini mematuhi standar Workspace Hygiene tingkat tinggi.\x1b[0m\n`);
  }

  return { targetDir, migratedReqs, migratedBugs, cleanUpDone: true };
}
