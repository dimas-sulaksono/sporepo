import * as fs from 'fs';
import * as path from 'path';
import { ensureDir, fileExists, readTemplate } from '../utils/file';

export interface InitOptions {
  force?: boolean;
  quiet?: boolean;
}

export interface InitResult {
  targetDir: string;
  createdDirs: string[];
  createdFiles: string[];
  skippedFiles: string[];
}

export function initCommand(rawTargetDir?: string, options: InitOptions = {}): InitResult {
  const targetDir = path.resolve(process.cwd(), rawTargetDir || '.');

  const promptsDir = path.join(targetDir, 'prompts', 'request');
  const bugsDir = path.join(targetDir, 'tests', 'bugs');
  const sporepoConfigDir = path.join(targetDir, '.sporepo');

  const createdDirs: string[] = [];
  const createdFiles: string[] = [];
  const skippedFiles: string[] = [];

  const dirsToCreate = [promptsDir, bugsDir, sporepoConfigDir];
  for (const d of dirsToCreate) {
    if (!fs.existsSync(d)) {
      ensureDir(d);
      createdDirs.push(path.relative(targetDir, d) || '.');
    }
  }

  // 1. prompts/README.md
  const promptsReadmePath = path.join(targetDir, 'prompts', 'README.md');
  if (!fileExists(promptsReadmePath) || options.force) {
    const content = readTemplate('prompts-readme.md');
    fs.writeFileSync(promptsReadmePath, content, 'utf-8');
    createdFiles.push(path.relative(targetDir, promptsReadmePath));
  } else {
    skippedFiles.push(path.relative(targetDir, promptsReadmePath));
  }

  // 2. tests/bugs/README.md
  const bugsReadmePath = path.join(targetDir, 'tests', 'bugs', 'README.md');
  if (!fileExists(bugsReadmePath) || options.force) {
    const content = readTemplate('bugs-readme.md');
    fs.writeFileSync(bugsReadmePath, content, 'utf-8');
    createdFiles.push(path.relative(targetDir, bugsReadmePath));
  } else {
    skippedFiles.push(path.relative(targetDir, bugsReadmePath));
  }

  // 3. .sporepo/rule.md
  const rulePath = path.join(sporepoConfigDir, 'rule.md');
  if (!fileExists(rulePath) || options.force) {
    const content = readTemplate('sporepo-rule.md');
    fs.writeFileSync(rulePath, content, 'utf-8');
    createdFiles.push(path.relative(targetDir, rulePath));
  } else {
    skippedFiles.push(path.relative(targetDir, rulePath));
  }

  // 4. Also embed in .gemini/rules/sporepo.md if .gemini folder exists or can be created
  const geminiRulesDir = path.join(targetDir, '.gemini', 'rules');
  if (fs.existsSync(path.join(targetDir, '.gemini'))) {
    ensureDir(geminiRulesDir);
    const geminiRulePath = path.join(geminiRulesDir, 'sporepo.md');
    if (!fileExists(geminiRulePath) || options.force) {
      const content = readTemplate('sporepo-rule.md');
      fs.writeFileSync(geminiRulePath, content, 'utf-8');
      createdFiles.push(path.relative(targetDir, geminiRulePath));
    }
  }

  if (!options.quiet) {
    console.log(`\n\x1b[32m✔ [sporepo] Inisialisasi struktur rekayasa sporepo berhasil!\x1b[0m`);
    console.log(`  Target Direktori : ${targetDir}`);
    if (createdDirs.length > 0) {
      console.log(`  Direktori Baru   :`);
      createdDirs.forEach((d) => console.log(`    + ${d}/`));
    }
    if (createdFiles.length > 0) {
      console.log(`  Berkas Dibuat    :`);
      createdFiles.forEach((f) => console.log(`    + ${f}`));
    }
    if (skippedFiles.length > 0) {
      console.log(`  Berkas Diabaikan (sudah ada):`);
      skippedFiles.forEach((f) => console.log(`    • ${f}`));
    }
    console.log(`\n\x1b[36mInstruksi Selanjutnya:\x1b[0m`);
    console.log(`  • Buat fitur baru : \x1b[1mnpx sporepo req "Nama Fitur"\x1b[0m`);
    console.log(`  • Catat temuan bug: \x1b[1mnpx sporepo bug "Nama Bug"\x1b[0m`);
    console.log(`  • Audit repositori: \x1b[1mnpx sporepo audit\x1b[0m\n`);
  }

  return { targetDir, createdDirs, createdFiles, skippedFiles };
}
