import * as fs from 'fs';
import * as path from 'path';
import { getSporepoPaths } from '../utils/file';

export interface RequestItem {
  fileName: string;
  id: string;
  title: string;
  status: string;
  isApproved: boolean;
  isVerified: boolean;
  isArchived: boolean;
}

export interface BugItem {
  fileName: string;
  title: string;
  status: string;
  hasCurl: boolean;
  isVerified: boolean;
  isArchived: boolean;
}

export interface AuditResult {
  targetDir: string;
  hasSporepoDocs: boolean;
  hasReqsDir: boolean;
  hasBugsDir: boolean;
  hasArchiveDir: boolean;
  hasLegacyStructure: boolean;
  hasSporepoRule: boolean;
  activeRequests: RequestItem[];
  archivedRequests: RequestItem[];
  activeBugs: BugItem[];
  archivedBugs: BugItem[];
  verifiedReadyToArchive: number;
  complianceScore: number;
}

export function auditCommand(rawTargetDir?: string, options: { quiet?: boolean } = {}): AuditResult {
  const paths = getSporepoPaths(rawTargetDir);
  const { targetDir, baseDir, reqsDir, bugsDir, archiveDir, archiveReqsDir, archiveBugsDir, legacyPromptsDir, legacyBugsDir, rulePath } = paths;

  const altRulePath = path.join(targetDir, '.gemini', 'rules', 'sporepo.md');

  const hasSporepoDocs = fs.existsSync(baseDir);
  const hasReqsDir = fs.existsSync(reqsDir) || fs.existsSync(legacyPromptsDir);
  const hasBugsDir = fs.existsSync(bugsDir) || fs.existsSync(legacyBugsDir);
  const hasArchiveDir = fs.existsSync(archiveDir);
  const hasLegacyStructure = fs.existsSync(legacyPromptsDir) || fs.existsSync(legacyBugsDir);
  const hasSporepoRule = fs.existsSync(rulePath) || fs.existsSync(altRulePath);

  const parseRequestFile = (fullPath: string, fileName: string, isArchived: boolean): RequestItem => {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const matchId = fileName.match(/^(\d{1,})-/);
    const id = matchId ? matchId[1].padStart(3, '0') : '???';

    const matchTitle = content.match(/^# META-PROMPT:\s*(\[[^\]]+\]\s*)?(.*)$/m);
    const title = matchTitle ? matchTitle[2].trim() : fileName.replace(/\.md$/, '');

    const matchStatus = content.match(/\*\*Status:\*\*\s*`?([A-Z_]+)`?/i);
    const status = matchStatus ? matchStatus[1].toUpperCase() : 'UNKNOWN';

    const isApproved =
      /\[x\]\s*\*\*Status:\*\*\s*Disetujui/i.test(content) ||
      /status:\s*approved/i.test(content) ||
      status === 'APPROVED' ||
      status === 'IN_PROGRESS' ||
      status === 'VERIFIED';

    const isVerified = status === 'VERIFIED';

    return {
      fileName,
      id,
      title,
      status,
      isApproved,
      isVerified,
      isArchived,
    };
  };

  const parseBugFile = (fullPath: string, fileName: string, isArchived: boolean): BugItem => {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const matchTitle = content.match(/^# BUG REPORT:\s*(.*)$/m);
    const title = matchTitle ? matchTitle[1].trim() : fileName.replace(/\.md$/, '');

    const matchStatus = content.match(/\*\*Status:\*\*\s*`?([A-Z_]+)`?/i);
    const status = matchStatus ? matchStatus[1].toUpperCase() : 'UNKNOWN';

    const hasCurl = /```bash[\s\S]*?curl\s+[\s\S]*?```/i.test(content);
    const isVerified = status === 'VERIFIED' || /status:\s*verified/i.test(content);

    return {
      fileName,
      title,
      status,
      hasCurl,
      isVerified,
      isArchived,
    };
  };

  // 1. Scan active requests
  const activeRequests: RequestItem[] = [];
  const reqDirsToScan = [reqsDir, legacyPromptsDir].filter((d) => fs.existsSync(d));
  for (const dir of reqDirsToScan) {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md');
    for (const f of files) {
      activeRequests.push(parseRequestFile(path.join(dir, f), f, false));
    }
  }

  // 2. Scan archived requests
  const archivedRequests: RequestItem[] = [];
  if (fs.existsSync(archiveReqsDir)) {
    const files = fs.readdirSync(archiveReqsDir).filter((f) => f.endsWith('.md'));
    for (const f of files) {
      archivedRequests.push(parseRequestFile(path.join(archiveReqsDir, f), f, true));
    }
  }

  // 3. Scan active bugs
  const activeBugs: BugItem[] = [];
  const bugDirsToScan = [bugsDir, legacyBugsDir].filter((d) => fs.existsSync(d));
  for (const dir of bugDirsToScan) {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md');
    for (const f of files) {
      activeBugs.push(parseBugFile(path.join(dir, f), f, false));
    }
  }

  // 4. Scan archived bugs
  const archivedBugs: BugItem[] = [];
  if (fs.existsSync(archiveBugsDir)) {
    const files = fs.readdirSync(archiveBugsDir).filter((f) => f.endsWith('.md'));
    for (const f of files) {
      archivedBugs.push(parseBugFile(path.join(archiveBugsDir, f), f, true));
    }
  }

  // Calculate compliance score (0 - 100)
  let score = 0;
  if (hasSporepoDocs || hasReqsDir) score += 20;
  if (hasBugsDir) score += 20;
  if (hasSporepoRule) score += 20;

  // Requests bonus up to 20
  const allRequests = [...activeRequests, ...archivedRequests];
  if (allRequests.length > 0) {
    const approvedOrVerified = allRequests.filter((r) => r.isApproved || r.isVerified).length;
    score += Math.round((approvedOrVerified / allRequests.length) * 20);
  } else {
    score += 20;
  }

  // Bugs bonus up to 20
  const allBugs = [...activeBugs, ...archivedBugs];
  if (allBugs.length > 0) {
    const withCurl = allBugs.filter((b) => b.hasCurl).length;
    score += Math.round((withCurl / allBugs.length) * 20);
  } else {
    score += 20;
  }

  // Check verified items in active dirs ready to be archived
  const verifiedReadyToArchive =
    activeRequests.filter((r) => r.isVerified).length +
    activeBugs.filter((b) => b.isVerified).length;

  if (!options.quiet) {
    console.log(`\n\x1b[1m🔍 [sporepo audit] Laporan Kepatuhan Rekayasa:\x1b[0m`);
    console.log(`  Lokasi Repositori: ${targetDir}`);
    console.log(`  Skor Kepatuhan   : \x1b[${score >= 80 ? '32' : score >= 50 ? '33' : '31'}m${score} / 100\x1b[0m\n`);

    console.log(`\x1b[36mPemeriksaan Fondasi Struktur:\x1b[0m`);
    console.log(`  [${fs.existsSync(reqsDir) ? '✔' : '✖'}] docs/sporepo/reqs/    : ${fs.existsSync(reqsDir) ? 'Ditemukan' : 'Belum diinisiasi'}`);
    console.log(`  [${fs.existsSync(bugsDir) ? '✔' : '✖'}] docs/sporepo/bugs/    : ${fs.existsSync(bugsDir) ? 'Ditemukan' : 'Belum diinisiasi'}`);
    console.log(`  [${hasArchiveDir ? '✔' : '✖'}] docs/sporepo/archive/ : ${hasArchiveDir ? 'Ditemukan' : 'Belum diinisiasi'}`);
    console.log(`  [${hasSporepoRule ? '✔' : '✖'}] .sporepo/rule.md      : ${hasSporepoRule ? 'Ditemukan' : 'Belum disematkan'}`);

    if (hasLegacyStructure) {
      console.log(`\n\x1b[33m⚠️  Terdeteksi struktur legacy (prompts/ atau tests/bugs/).\x1b[0m`);
      console.log(`   Jalankan \x1b[1mnpx sporepo migrate\x1b[0m untuk memindahkan berkas ke docs/sporepo/ secara otomatis.`);
    }

    console.log(`\n\x1b[36mDaftar Fitur Aktif (docs/sporepo/reqs/):\x1b[0m`);
    if (activeRequests.length === 0) {
      console.log(`  (Tidak ada fitur aktif. Jalankan: npx sporepo req "Nama Fitur")`);
    } else {
      for (const r of activeRequests) {
        const badge = r.isVerified ? '\x1b[32m[VERIFIED]\x1b[0m' : r.isApproved ? '\x1b[33m[APPROVED]\x1b[0m' : '\x1b[31m[DRAFT]\x1b[0m';
        console.log(`  #${r.id} ${badge} ${r.title} (${r.fileName})`);
      }
    }

    if (archivedRequests.length > 0) {
      console.log(`\n\x1b[35mArsip Fitur Tuntas (docs/sporepo/archive/reqs/):\x1b[0m`);
      for (const r of archivedRequests) {
        console.log(`  #${r.id} \x1b[32m[ARCHIVED]\x1b[0m ${r.title} (${r.fileName})`);
      }
    }

    console.log(`\n\x1b[36mDaftar Bug Aktif (docs/sporepo/bugs/):\x1b[0m`);
    if (activeBugs.length === 0) {
      console.log(`  (Tidak ada bug aktif. Jalankan: npx sporepo bug "Nama Bug")`);
    } else {
      for (const b of activeBugs) {
        const badge = b.isVerified ? '\x1b[32m[VERIFIED]\x1b[0m' : '\x1b[31m[' + b.status + ']\x1b[0m';
        const curlBadge = b.hasCurl ? '\x1b[32m(cURL ✔)\x1b[0m' : '\x1b[33m(cURL missing)\x1b[0m';
        console.log(`  • ${badge} ${curlBadge} ${b.title} (${b.fileName})`);
      }
    }

    if (archivedBugs.length > 0) {
      console.log(`\n\x1b[35mArsip Bug Tuntas (docs/sporepo/archive/bugs/):\x1b[0m`);
      for (const b of archivedBugs) {
        console.log(`  • \x1b[32m[ARCHIVED]\x1b[0m ${b.title} (${b.fileName})`);
      }
    }

    if (verifiedReadyToArchive > 0) {
      console.log(`\n\x1b[33m💡 Ditemukan ${verifiedReadyToArchive} berkas berstatus [VERIFIED] yang siap diarsipkan!\x1b[0m`);
      console.log(`   Jalankan: \x1b[1mnpx sporepo archive --all-verified\x1b[0m untuk memindahkan berkas ke folder arsip.\n`);
    } else {
      console.log('');
    }
  }

  return {
    targetDir,
    hasSporepoDocs,
    hasReqsDir,
    hasBugsDir,
    hasArchiveDir,
    hasLegacyStructure,
    hasSporepoRule,
    activeRequests,
    archivedRequests,
    activeBugs,
    archivedBugs,
    verifiedReadyToArchive,
    complianceScore: score,
  };
}
