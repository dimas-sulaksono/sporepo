import * as fs from 'fs';
import * as path from 'path';
import {
  ensureDir,
  formatDate,
  getNextRequestNumber,
  getSporepoPaths,
  readTemplate,
  renderTemplate,
  slugify,
} from '../utils/file';

export interface ReqOptions {
  targetDir?: string;
  quiet?: boolean;
}

export interface ReqResult {
  filePath: string;
  relativePath: string;
  id: string;
  title: string;
  slug: string;
}

export function reqCommand(rawTitle: string, options: ReqOptions = {}): ReqResult {
  const title = (rawTitle || '').trim();
  if (!title) {
    throw new Error('[sporepo] Nama/judul fitur tidak boleh kosong. Contoh: sporepo req "Autentikasi JWT"');
  }

  const paths = getSporepoPaths(options.targetDir);
  const { targetDir, reqsDir, archiveReqsDir, legacyPromptsDir } = paths;

  // Decide active target directory: prefer docs/sporepo/reqs, fallback to legacy if exists and docs doesn't
  let activeDir = reqsDir;
  if (!fs.existsSync(reqsDir) && fs.existsSync(legacyPromptsDir)) {
    activeDir = legacyPromptsDir;
  }
  ensureDir(activeDir);

  const { formatted: id } = getNextRequestNumber(activeDir, [archiveReqsDir, legacyPromptsDir]);
  const slug = slugify(title);
  const fileName = `${id}-${slug}.md`;
  const filePath = path.join(activeDir, fileName);

  const templateContent = readTemplate('meta-prompt.md');
  const dateStr = formatDate();

  const rendered = renderTemplate(templateContent, {
    ID: id,
    TITLE: title,
    DATE: dateStr,
    SLUG: slug,
  });

  fs.writeFileSync(filePath, rendered, 'utf-8');
  const relativePath = path.relative(targetDir, filePath);

  if (!options.quiet) {
    console.log(`\n\x1b[32m✔ [sporepo] Meta-Prompt berhasil dibuat: \x1b[1m${relativePath}\x1b[0m`);
    console.log(`  Nomor Urut      : \x1b[33m${id}\x1b[0m`);
    console.log(`  Judul Fitur     : ${title}`);
    console.log(`  Target Berkas   : ${filePath}`);
    console.log(`\n\x1b[35m⛔ MANDAT REVIEWER GATEKEEPER:\x1b[0m`);
    console.log(`  1. Lengkapi batasan persona (@Backend, @Frontend, @QA, dll).`);
    console.log(`  2. AI Agent WAJIB mengaudit celah spesifikasi sebelum menulis kode.`);
    console.log(`  3. DILARANG KERAS memulai implementasi sebelum status [x] Approved by User dicentang!\n`);
  }

  return {
    filePath,
    relativePath,
    id,
    title,
    slug,
  };
}
