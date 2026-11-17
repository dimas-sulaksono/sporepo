import * as fs from 'fs';
import * as path from 'path';
import { ensureDir, formatDate, getSporepoPaths } from '../utils/file';

export interface ArchiveOptions {
  targetDir?: string;
  allVerified?: boolean;
  quiet?: boolean;
}

export interface ArchiveResult {
  archivedFiles: { original: string; archived: string; type: 'req' | 'bug' }[];
  targetDir: string;
}

export function archiveCommand(identifierOrFlag?: string, options: ArchiveOptions = {}): ArchiveResult {
  const paths = getSporepoPaths(options.targetDir);
  const { targetDir, reqsDir, bugsDir, archiveReqsDir, archiveBugsDir } = paths;

  ensureDir(archiveReqsDir);
  ensureDir(archiveBugsDir);

  const isAllVerified =
    options.allVerified ||
    identifierOrFlag === '--all-verified' ||
    identifierOrFlag === '-a';

  const archivedFiles: { original: string; archived: string; type: 'req' | 'bug' }[] = [];

  const archiveFile = (sourcePath: string, destDir: string, type: 'req' | 'bug') => {
    const fileName = path.basename(sourcePath);
    const destPath = path.join(destDir, fileName);

    let content = fs.readFileSync(sourcePath, 'utf-8');
    const today = formatDate();
    if (!content.includes('**Archived At:**')) {
      content = content.replace(/(> \*\*Status:\*\* [^\n]+)/, `$1\n> **Archived At:** ${today}`);
    }

    fs.writeFileSync(destPath, content, 'utf-8');
    fs.unlinkSync(sourcePath);

    archivedFiles.push({
      original: path.relative(targetDir, sourcePath),
      archived: path.relative(targetDir, destPath),
      type,
    });
  };

  if (isAllVerified) {
    // 1. Scan reqs for VERIFIED
    if (fs.existsSync(reqsDir)) {
      const files = fs.readdirSync(reqsDir).filter((f) => f.endsWith('.md'));
      for (const f of files) {
        const fullPath = path.join(reqsDir, f);
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (/status:\s*`?VERIFIED`?/i.test(content) || content.includes('[VERIFIED]')) {
          archiveFile(fullPath, archiveReqsDir, 'req');
        }
      }
    }

    // 2. Scan bugs for VERIFIED
    if (fs.existsSync(bugsDir)) {
      const files = fs.readdirSync(bugsDir).filter((f) => f.endsWith('.md') && f !== 'README.md');
      for (const f of files) {
        const fullPath = path.join(bugsDir, f);
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (/status:\s*`?VERIFIED`?/i.test(content) || content.includes('[VERIFIED]')) {
          archiveFile(fullPath, archiveBugsDir, 'bug');
        }
      }
    }
  } else {
    const rawId = (identifierOrFlag || '').trim();
    if (!rawId) {
      throw new Error('[sporepo archive] Nomor ID atau nama file wajib diisi. Contoh: sporepo archive 001 atau sporepo archive --all-verified');
    }

    const cleanId = rawId.replace(/^0+/, '') || '0';
    let found = false;

    // Search in reqs
    if (fs.existsSync(reqsDir)) {
      const files = fs.readdirSync(reqsDir).filter((f) => f.endsWith('.md'));
      for (const f of files) {
        const match = f.match(/^(\d+)-/);
        const matchId = match ? match[1].replace(/^0+/, '') : '';
        if (f === rawId || f.startsWith(`${rawId}-`) || matchId === cleanId) {
          archiveFile(path.join(reqsDir, f), archiveReqsDir, 'req');
          found = true;
          break;
        }
      }
    }

    // If not found, search in bugs
    if (!found && fs.existsSync(bugsDir)) {
      const files = fs.readdirSync(bugsDir).filter((f) => f.endsWith('.md') && f !== 'README.md');
      for (const f of files) {
        if (f === rawId || f.includes(rawId)) {
          archiveFile(path.join(bugsDir, f), archiveBugsDir, 'bug');
          found = true;
          break;
        }
      }
    }

    if (!found) {
      throw new Error(`[sporepo archive] Berkas dengan ID / nama "${rawId}" tidak ditemukan di docs/sporepo/reqs/ maupun docs/sporepo/bugs/`);
    }
  }

  if (!options.quiet) {
    if (archivedFiles.length === 0) {
      console.log(`\n\x1b[33mℹ [sporepo archive] Tidak ada berkas berstatus VERIFIED yang perlu diarsipkan.\x1b[0m\n`);
    } else {
      console.log(`\n\x1b[32m✔ [sporepo archive] Berhasil mengarsipkan ${archivedFiles.length} berkas ke docs/sporepo/archive/:\x1b[0m`);
      for (const item of archivedFiles) {
        console.log(`  • [${item.type.toUpperCase()}] ${item.original} ➔ \x1b[36m${item.archived}\x1b[0m`);
      }
      console.log(`\n\x1b[35mNomor urut penomoran 3-digit tetap terjaga dan tidak akan terduplikasi.\x1b[0m\n`);
    }
  }

  return { archivedFiles, targetDir };
}
