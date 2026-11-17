import * as fs from 'fs';
import * as path from 'path';
import { ensureDir, fileExists, getSporepoPaths, readTemplate } from '../utils/file';

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
  const paths = getSporepoPaths(rawTargetDir);
  const { targetDir, baseDir, reqsDir, bugsDir, archiveReqsDir, archiveBugsDir, rulePath } = paths;
  const sporepoConfigDir = path.dirname(rulePath);

  const createdDirs: string[] = [];
  const createdFiles: string[] = [];
  const skippedFiles: string[] = [];

  const dirsToCreate = [baseDir, reqsDir, bugsDir, archiveReqsDir, archiveBugsDir, sporepoConfigDir];
  for (const d of dirsToCreate) {
    if (!fs.existsSync(d)) {
      ensureDir(d);
      createdDirs.push(path.relative(targetDir, d) || '.');
    }
  }

  // 1. docs/sporepo/README.md
  const readmePath = path.join(baseDir, 'README.md');
  if (!fileExists(readmePath) || options.force) {
    const content = `# docs/sporepo: Manajemen Workspace Rekayasa AI

Direktori ini adalah pusat spesifikasi teknis, bukti pengujian bug, dan arsip framework **sporepo**.

## Struktur Direktori
- **\`reqs/\`**: Tempat menyimpan seluruh dokumen Meta-Prompt fitur aktif (\`XXX-nama-fitur.md\`).
- **\`bugs/\`**: Tempat menyimpan seluruh laporan investigasi bug ground-truth (\`YYYY-MM-DD-nama-bug.md\`).
- **\`archive/\`**: Tempat menyimpan dokumen yang telah tuntas (\`VERIFIED\`) via \`npx sporepo archive\`.

## Perintah Cepat
- Buat fitur baru: \`npx sporepo req "Nama Fitur"\`
- Catat bug: \`npx sporepo bug "Nama Bug"\`
- Arsipkan fitur/bug: \`npx sporepo archive <id>\` atau \`npx sporepo archive --all-verified\`
- Audit kepatuhan: \`npx sporepo audit\`
`;
    fs.writeFileSync(readmePath, content, 'utf-8');
    createdFiles.push(path.relative(targetDir, readmePath));
  } else {
    skippedFiles.push(path.relative(targetDir, readmePath));
  }

  // 2. .sporepo/rule.md
  if (!fileExists(rulePath) || options.force) {
    const content = readTemplate('sporepo-rule.md');
    fs.writeFileSync(rulePath, content, 'utf-8');
    createdFiles.push(path.relative(targetDir, rulePath));
  } else {
    skippedFiles.push(path.relative(targetDir, rulePath));
  }

  // 3. .gemini/rules/sporepo.md if .gemini exists
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
    console.log(`  Pusat Dokumen    : docs/sporepo/`);
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
    console.log(`  • Arsipkan berkas : \x1b[1mnpx sporepo archive <id>\x1b[0m`);
    console.log(`  • Audit repositori: \x1b[1mnpx sporepo audit\x1b[0m\n`);
  }

  return { targetDir, createdDirs, createdFiles, skippedFiles };
}
