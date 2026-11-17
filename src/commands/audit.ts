import * as fs from 'fs';
import * as path from 'path';

export interface RequestItem {
  fileName: string;
  id: string;
  title: string;
  status: string;
  isApproved: boolean;
  isVerified: boolean;
}

export interface BugItem {
  fileName: string;
  title: string;
  status: string;
  hasCurl: boolean;
  isVerified: boolean;
}

export interface AuditResult {
  targetDir: string;
  hasPromptsDir: boolean;
  hasBugsDir: boolean;
  hasSporepoRule: boolean;
  requests: RequestItem[];
  bugs: BugItem[];
  complianceScore: number;
}

export function auditCommand(rawTargetDir?: string, options: { quiet?: boolean } = {}): AuditResult {
  const targetDir = path.resolve(process.cwd(), rawTargetDir || '.');

  const promptsDir = path.join(targetDir, 'prompts', 'request');
  const bugsDir = path.join(targetDir, 'tests', 'bugs');
  const rulePath = path.join(targetDir, '.sporepo', 'rule.md');
  const altRulePath = path.join(targetDir, '.gemini', 'rules', 'sporepo.md');

  const hasPromptsDir = fs.existsSync(promptsDir);
  const hasBugsDir = fs.existsSync(bugsDir);
  const hasSporepoRule = fs.existsSync(rulePath) || fs.existsSync(altRulePath);

  const requests: RequestItem[] = [];
  if (hasPromptsDir) {
    const files = fs.readdirSync(promptsDir).filter((f) => f.endsWith('.md'));
    for (const f of files) {
      const fullPath = path.join(promptsDir, f);
      const content = fs.readFileSync(fullPath, 'utf-8');

      const matchId = f.match(/^(\d{1,})-/);
      const id = matchId ? matchId[1].padStart(3, '0') : '???';

      const matchTitle = content.match(/^# META-PROMPT:\s*(\[[^\]]+\]\s*)?(.*)$/m);
      const title = matchTitle ? matchTitle[2].trim() : f.replace(/\.md$/, '');

      const matchStatus = content.match(/\*\*Status:\*\*\s*`?([A-Z_]+)`?/i);
      const status = matchStatus ? matchStatus[1].toUpperCase() : 'UNKNOWN';

      const isApproved =
        /\[x\]\s*\*\*Status:\*\*\s*Disetujui/i.test(content) ||
        /status:\s*approved/i.test(content) ||
        status === 'APPROVED' ||
        status === 'IN_PROGRESS' ||
        status === 'VERIFIED';

      const isVerified = status === 'VERIFIED';

      requests.push({
        fileName: f,
        id,
        title,
        status,
        isApproved,
        isVerified,
      });
    }
  }

  const bugs: BugItem[] = [];
  if (hasBugsDir) {
    const files = fs.readdirSync(bugsDir).filter((f) => f.endsWith('.md') && f !== 'README.md');
    for (const f of files) {
      const fullPath = path.join(bugsDir, f);
      const content = fs.readFileSync(fullPath, 'utf-8');

      const matchTitle = content.match(/^# BUG REPORT:\s*(.*)$/m);
      const title = matchTitle ? matchTitle[1].trim() : f.replace(/\.md$/, '');

      const matchStatus = content.match(/\*\*Status:\*\*\s*`?([A-Z_]+)`?/i);
      const status = matchStatus ? matchStatus[1].toUpperCase() : 'UNKNOWN';

      const hasCurl = /```bash[\s\S]*?curl\s+[\s\S]*?```/i.test(content);
      const isVerified = status === 'VERIFIED' || /status:\s*verified/i.test(content);

      bugs.push({
        fileName: f,
        title,
        status,
        hasCurl,
        isVerified,
      });
    }
  }

  // Calculate compliance score (0 - 100)
  let score = 0;
  if (hasPromptsDir) score += 20;
  if (hasBugsDir) score += 20;
  if (hasSporepoRule) score += 20;

  // Requests bonus up to 20
  if (requests.length > 0) {
    const approvedOrVerified = requests.filter((r) => r.isApproved || r.isVerified).length;
    score += Math.round((approvedOrVerified / requests.length) * 20);
  } else {
    score += 20; // no pending violations
  }

  // Bugs bonus up to 20
  if (bugs.length > 0) {
    const withCurl = bugs.filter((b) => b.hasCurl).length;
    score += Math.round((withCurl / bugs.length) * 20);
  } else {
    score += 20; // no undocumented bugs
  }

  if (!options.quiet) {
    console.log(`\n\x1b[1m🔍 [sporepo audit] Laporan Kepatuhan Rekayasa:\x1b[0m`);
    console.log(`  Lokasi Repositori: ${targetDir}`);
    console.log(`  Skor Kepatuhan   : \x1b[${score >= 80 ? '32' : score >= 50 ? '33' : '31'}m${score} / 100\x1b[0m\n`);

    console.log(`\x1b[36mPemeriksaan Fondasi Struktur:\x1b[0m`);
    console.log(`  [${hasPromptsDir ? '✔' : '✖'}] prompts/request/ : ${hasPromptsDir ? 'Ditemukan' : 'Belum diinisiasi'}`);
    console.log(`  [${hasBugsDir ? '✔' : '✖'}] tests/bugs/      : ${hasBugsDir ? 'Ditemukan' : 'Belum diinisiasi'}`);
    console.log(`  [${hasSporepoRule ? '✔' : '✖'}] .sporepo/rule.md  : ${hasSporepoRule ? 'Ditemukan' : 'Belum disematkan'}`);

    console.log(`\n\x1b[36mDaftar Fitur (prompts/request/):\x1b[0m`);
    if (requests.length === 0) {
      console.log(`  (Belum ada dokumen meta-prompt. Jalankan: npx sporepo req "Nama Fitur")`);
    } else {
      for (const r of requests) {
        const badge = r.isVerified ? '\x1b[32m[VERIFIED]\x1b[0m' : r.isApproved ? '\x1b[33m[APPROVED]\x1b[0m' : '\x1b[31m[DRAFT]\x1b[0m';
        console.log(`  #${r.id} ${badge} ${r.title} (${r.fileName})`);
      }
    }

    console.log(`\n\x1b[36mDaftar Bug (tests/bugs/):\x1b[0m`);
    if (bugs.length === 0) {
      console.log(`  (Belum ada laporan bug. Jalankan: npx sporepo bug "Nama Bug")`);
    } else {
      for (const b of bugs) {
        const badge = b.isVerified ? '\x1b[32m[VERIFIED]\x1b[0m' : '\x1b[31m[' + b.status + ']\x1b[0m';
        const curlBadge = b.hasCurl ? '\x1b[32m(cURL ✔)\x1b[0m' : '\x1b[33m(cURL missing)\x1b[0m';
        console.log(`  • ${badge} ${curlBadge} ${b.title} (${b.fileName})`);
      }
    }
    console.log('');
  }

  return {
    targetDir,
    hasPromptsDir,
    hasBugsDir,
    hasSporepoRule,
    requests,
    bugs,
    complianceScore: score,
  };
}
