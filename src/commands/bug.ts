import * as fs from 'fs';
import * as path from 'path';
import {
  ensureDir,
  formatDate,
  getUniqueBugFilePath,
  readTemplate,
  renderTemplate,
  slugify,
} from '../utils/file';

export interface BugOptions {
  targetDir?: string;
  quiet?: boolean;
}

export interface BugResult {
  filePath: string;
  relativePath: string;
  title: string;
  date: string;
  slug: string;
}

export function bugCommand(rawTitle: string, options: BugOptions = {}): BugResult {
  const title = (rawTitle || '').trim();
  if (!title) {
    throw new Error('[sporepo] Nama/judul bug tidak boleh kosong. Contoh: sporepo bug "Login 401 Unauthorized"');
  }

  const targetDir = path.resolve(process.cwd(), options.targetDir || '.');
  const bugsDir = path.join(targetDir, 'tests', 'bugs');
  ensureDir(bugsDir);

  const dateStr = formatDate();
  const slug = slugify(title);
  const filePath = getUniqueBugFilePath(bugsDir, dateStr, slug);

  const templateContent = readTemplate('bug-report.md');
  const rendered = renderTemplate(templateContent, {
    TITLE: title,
    DATE: dateStr,
    SLUG: slug,
  });

  fs.writeFileSync(filePath, rendered, 'utf-8');
  const relativePath = path.relative(targetDir, filePath);

  if (!options.quiet) {
    console.log(`\n\x1b[32m✔ [sporepo] Laporan Bug berhasil dibuat: \x1b[1m${relativePath}\x1b[0m`);
    console.log(`  Tanggal         : ${dateStr}`);
    console.log(`  Judul Temuan    : ${title}`);
    console.log(`  Target Berkas   : ${filePath}`);
    console.log(`\n\x1b[31m⚖ THE IRON LAW: NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST\x1b[0m`);
    console.log(`  1. Tempelkan perintah cURL riil (Ground-Truth) & Actual Error Payload.`);
    console.log(`  2. Investigasi akar masalah (Phase 1) & isolasi alur data (Phase 2).`);
    console.log(`  3. Tulis automated test yang sengaja GAGAL terlebih dahulu (TDD / Phase 3).`);
    console.log(`  4. Terapkan perbaikan kode seminimal mungkin hingga test LULUS (Phase 4).`);
    console.log(`  5. Jalankan full regression pass sebelum menutup laporan bug.\n`);
  }

  return {
    filePath,
    relativePath,
    title,
    date: dateStr,
    slug,
  };
}
