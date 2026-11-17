import * as fs from 'fs';
import * as path from 'path';
import { getSporepoPaths, fileExists } from '../utils/file';
import { parseMetaPrompt } from '../utils/sdd-parser';

export type FindingSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface GatekeeperFinding {
  severity: FindingSeverity;
  section: string;
  message: string;
  recommendation: string;
}

export interface GatekeeperAuditResult {
  filePath: string;
  id: string;
  title: string;
  status: string;
  isApproved: boolean;
  isValid: boolean;
  score: number;
  findings: GatekeeperFinding[];
}

export interface GatekeeperOptions {
  quiet?: boolean;
  json?: boolean;
  all?: boolean;
  targetDir?: string;
}

/**
 * Lints and audits a SPOREPO Meta-Prompt for structural completeness,
 * persona distribution, touch boundaries, and decision gates.
 */
export function auditMetaPromptFile(filePath: string): GatekeeperAuditResult {
  const resolvedPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`[sporepo gatekeeper] Berkas tidak ditemukan: ${filePath}`);
  }

  const content = fs.readFileSync(resolvedPath, 'utf-8');
  const findings: GatekeeperFinding[] = [];
  let score = 100;

  // 1. Metadata Headers Check (10 pts)
  const headerMatch = content.match(/^# META-PROMPT:\s*(\[(\d+)\]\s*)?(.*)$/m);
  const idMatch = content.match(/\*\*Request ID:\*\*\s*([0-9A-Za-z_-]+)/i);
  const id = idMatch ? idMatch[1] : headerMatch && headerMatch[2] ? headerMatch[2] : '???';
  const title = headerMatch && headerMatch[3]?.trim() ? headerMatch[3].trim() : path.basename(filePath, '.md');

  const statusMatch = content.match(/\*\*Status:\*\*\s*`?([A-Z_]+)`?/i);
  const status = statusMatch ? statusMatch[1].toUpperCase() : 'UNKNOWN';

  if (!headerMatch) {
    findings.push({
      severity: 'CRITICAL',
      section: 'Header',
      message: 'Header utama "# META-PROMPT: [XXX] Judul" tidak ditemukan.',
      recommendation: 'Gunakan format: # META-PROMPT: [001] Nama Fitur Spesifik',
    });
    score -= 10;
  }

  if (id === '???' || id === '000') {
    findings.push({
      severity: 'WARNING',
      section: 'Header',
      message: 'Request ID tidak valid atau masih placeholder.',
      recommendation: 'Sematkan ID 3 digit numerik (contoh: 001, 002).',
    });
    score -= 5;
  }

  // 2. Section 1: Business Logic & Goal (15 pts)
  const sec1Match = content.match(/## 1\.\s*Konteks Bisnis[\s\S]*?(?=\n## 2\.|\n---\s*\n## 2\.|$)/i);
  if (!sec1Match) {
    findings.push({
      severity: 'CRITICAL',
      section: 'Section 1 (Goal & Problem)',
      message: 'Seksi 1 (Konteks Bisnis & Tujuan Fitur) tidak ditemukan.',
      recommendation: 'Tambahkan seksi "## 1. Konteks Bisnis & Tujuan Fitur" lengkap dengan Problem & Goal.',
    });
    score -= 15;
  } else {
    const sec1Text = sec1Match[0];
    const hasProblem = /Problem Statement|Latar Belakang/i.test(sec1Text) && !/(?:Problem Statement|Latar Belakang)[^\n:]*:\s*(?:\.\.\.|\s*)$/m.test(sec1Text);
    const hasGoal = /(?:Tujuan Utama|Goal)/i.test(sec1Text) && !/(?:Tujuan Utama|Goal)[^\n:]*:\s*(?:\.\.\.|\s*)$/m.test(sec1Text);
    const hasMetrics = /(?:Kriteria Keberhasilan|Success Metrics)/i.test(sec1Text) && !/(?:Kriteria Keberhasilan|Success Metrics)[^\n:]*:\s*(?:\.\.\.|\s*)$/m.test(sec1Text);

    if (!hasGoal) {
      findings.push({
        severity: 'CRITICAL',
        section: 'Section 1 (Goal)',
        message: 'Tujuan utama (Goal) masih kosong atau hanya berisi placeholder "...".',
        recommendation: 'Deskripsikan secara objektif hasil akhir yang ingin dicapai fitur ini.',
      });
      score -= 10;
    }
    if (!hasMetrics) {
      findings.push({
        severity: 'WARNING',
        section: 'Section 1 (Success Metrics)',
        message: 'Kriteria keberhasilan terukur belum didefinisikan secara tegas.',
        recommendation: 'Definisikan metrik verifikasi yang dapat diuji (contoh: 0 runtime dependencies, 100% test pass).',
      });
      score -= 5;
    }
  }

  // 3. Section 2: Multi-Persona Matrix (15 pts)
  const sec2Match = content.match(/## 2\.\s*Matriks Persona[\s\S]*?(?=\n## 3\.|\n---\s*\n## 3\.|$)/i);
  if (!sec2Match) {
    findings.push({
      severity: 'CRITICAL',
      section: 'Section 2 (Personas)',
      message: 'Seksi 2 (Matriks Persona & Pembagian Tanggung Jawab) tidak ditemukan.',
      recommendation: 'Sertakan tabel persona (@Architect, @Backend, @Frontend, @QA, dll).',
    });
    score -= 15;
  } else {
    const personas = (sec2Match[0].match(/@[A-Za-z0-9_-]+/g) || []);
    const uniquePersonas = Array.from(new Set(personas));
    if (uniquePersonas.length < 2) {
      findings.push({
        severity: 'WARNING',
        section: 'Section 2 (Personas)',
        message: `Hanya ada ${uniquePersonas.length} persona unik yang terdeteksi. Minimal 2 persona disarankan untuk pemisahan tugas yang sehat.`,
        recommendation: 'Bagi tanggung jawab minimal antara @Architect/@Backend dan @QA.',
      });
      score -= 5;
    }
  }

  // 4. Section 3: Touch Boundaries & Deliverables (15 pts)
  const sec3Match = content.match(/## 3\.\s*Batas Kepemilikan Berkas[\s\S]*?(?=\n## 4\.|\n---\s*\n## 4\.|$)/i);
  if (!sec3Match) {
    findings.push({
      severity: 'CRITICAL',
      section: 'Section 3 (Touch Boundaries)',
      message: 'Seksi 3 (Batas Kepemilikan Berkas / Touch Boundaries) tidak ditemukan.',
      recommendation: 'Definisikan berkas yang boleh disentuh (Allowed) dan dilarang disentuh (Restricted).',
    });
    score -= 15;
  } else {
    const sec3Text = sec3Match[0];
    const hasAllowed = /Berkas yang Boleh/i.test(sec3Text) && !/Berkas yang Boleh[^:]*:\s*[-*]\s*`?\.\.\.`?/i.test(sec3Text);
    const hasRestricted = /Berkas yang DILARANG/i.test(sec3Text);
    const hasDeliverables = /Deliverables|Artefak yang Diharapkan/i.test(sec3Text) || /Deliverables/i.test(content);

    if (!hasAllowed) {
      findings.push({
        severity: 'CRITICAL',
        section: 'Section 3 (Allowed Files)',
        message: 'Daftar berkas yang boleh dibuat/dimodifikasi masih kosong atau placeholder.',
        recommendation: 'Sebutkan path atau glob berkas konkret yang boleh disentuh implementer.',
      });
      score -= 8;
    }
    if (!hasRestricted) {
      findings.push({
        severity: 'WARNING',
        section: 'Section 3 (Restricted Files)',
        message: 'Batasan berkas terlarang (Restricted Files) tidak dicantumkan.',
        recommendation: 'Tegaskan berkas yang dilarang diubah (misal: production config, baseline contracts).',
      });
      score -= 4;
    }
    if (!hasDeliverables) {
      findings.push({
        severity: 'WARNING',
        section: 'Section 3 (Deliverables)',
        message: 'Daftar Deliverables yang Diharapkan tidak ditemukan.',
        recommendation: 'Tuliskan daftar artefak konkret yang harus ada setelah fitur selesai.',
      });
      score -= 3;
    }
  }

  // 5. Section 4: Gatekeeper Barrier & Decision Gate (20 pts)
  const sec4Match = content.match(/## 4\.\s*INDEPENDENT REVIEWER GATEKEEPER[\s\S]*?(?=\n## 5\.|\n---\s*\n## 5\.|$)/i);
  const isApproved =
    /\[x\]\s*\*\*Status:\*\*\s*Disetujui/i.test(content) ||
    /status:\s*approved/i.test(content) ||
    status === 'APPROVED' ||
    status === 'IN_PROGRESS' ||
    status === 'VERIFIED';

  if (!sec4Match) {
    findings.push({
      severity: 'CRITICAL',
      section: 'Section 4 (Gatekeeper Barrier)',
      message: 'Seksi 4 (Independent Reviewer Gatekeeper Barrier) tidak ditemukan.',
      recommendation: 'Sertakan Seksi 4 lengkap dengan checklist audit, pertanyaan simultan, dan user sign-off.',
    });
    score -= 20;
  } else {
    const sec4Text = sec4Match[0];
    const hasQuestionsBlock = /Daftar Pertanyaan Keputusan/i.test(sec4Text) || /Pertanyaan 1/i.test(sec4Text);
    const hasSignOffBlock = /Konfirmasi Persetujuan Pengguna/i.test(sec4Text);

    if (!hasSignOffBlock) {
      findings.push({
        severity: 'CRITICAL',
        section: 'Section 4 (User Sign-Off)',
        message: 'Blok Konfirmasi Persetujuan Pengguna (User Sign-Off) tidak ditemukan.',
        recommendation: 'Tambahkan blok tanda tangan persetujuan status APPROVED.',
      });
      score -= 10;
    }

    if (!isApproved) {
      findings.push({
        severity: 'CRITICAL',
        section: 'Section 4 (Status Barrier)',
        message: 'Status Meta-Prompt belum disetujui (APPROVED) oleh pengguna. Koding DILARANG KERAS.',
        recommendation: 'Selesaikan pertanyaan keputusan dan tunggu persetujuan resmi pengguna.',
      });
      score -= 10;
    }
  }

  // 6. Section 5: Atomic Tasks / SDD Plan (15 pts)
  const sec5Match = content.match(/## 5\.\s*Rencana Eksekusi Atomik[\s\S]*?(?=\n## 6\.|\n---\s*\n## 6\.|$)/i);
  if (!sec5Match) {
    findings.push({
      severity: 'CRITICAL',
      section: 'Section 5 (Atomic Plan)',
      message: 'Seksi 5 (Rencana Eksekusi Atomik / SDD) tidak ditemukan.',
      recommendation: 'Pecah implementasi menjadi subtugas terukur (Task 1, Task 2, dll).',
    });
    score -= 15;
  } else {
    let parsedTasksCount = 0;
    try {
      const parsed = parseMetaPrompt(resolvedPath);
      parsedTasksCount = parsed.tasks.length;
    } catch {
      const matches = sec5Match[0].match(/Task\s*\d+/gi);
      parsedTasksCount = matches ? matches.length : 0;
    }

    if (parsedTasksCount === 0) {
      findings.push({
        severity: 'CRITICAL',
        section: 'Section 5 (Atomic Tasks)',
        message: 'Tidak ada Task atomik konkret yang terdeteksi di Seksi 5.',
        recommendation: 'Tambahkan minimal satu Task atomik dengan fokus persona, aksi, dan verifikasi.',
      });
      score -= 15;
    } else {
      // Check for placeholder tasks
      if (/Task 1:\s*\[Nama Subtugas 1\]/i.test(sec5Match[0])) {
        findings.push({
          severity: 'WARNING',
          section: 'Section 5 (Placeholder Tasks)',
          message: 'Task di Seksi 5 masih menggunakan placeholder bawaan template.',
          recommendation: 'Ganti nama task dan aksinya dengan langkah teknis nyata.',
        });
        score -= 5;
      }
    }
  }

  // 7. Section 6: Verification Before Completion Protocol (10 pts)
  const sec6Match = content.match(/## 6\.\s*Protokol Verifikasi Akhir[\s\S]*$/i);
  if (!sec6Match) {
    findings.push({
      severity: 'WARNING',
      section: 'Section 6 (Verification Protocol)',
      message: 'Seksi 6 (Protokol Verifikasi Akhir) tidak ditemukan.',
      recommendation: 'Cantumkan perintah terminal uji (npm test, lint, build) sebelum klaim selesai.',
    });
    score -= 10;
  } else {
    const hasCommands = /npm test|npm run|npx /i.test(sec6Match[0]);
    if (!hasCommands) {
      findings.push({
        severity: 'WARNING',
        section: 'Section 6 (Verification Commands)',
        message: 'Tidak ada perintah terminal eksplisit di Seksi 6.',
        recommendation: 'Cantumkan blok kode bash berisi perintah verifikasi konkret.',
      });
      score -= 5;
    }
  }

  // Final score clamping
  score = Math.max(0, Math.min(100, score));
  const hasCritical = findings.some((f) => f.severity === 'CRITICAL');
  const isValid = !hasCritical && score >= 70;

  return {
    filePath: resolvedPath,
    id,
    title,
    status,
    isApproved,
    isValid,
    score,
    findings,
  };
}

/**
 * Finds the most relevant Meta-Prompt to audit if no file is explicitly provided.
 * Priority:
 * 1. Latest file with REVIEW_PENDING status.
 * 2. Latest file in docs/sporepo/reqs/ or legacy prompts/request/ by number.
 */
export function findTargetMetaPrompt(targetDir: string = process.cwd()): string | null {
  const paths = getSporepoPaths(targetDir);
  const candidateDirs = [paths.reqsDir, paths.legacyPromptsDir].filter((d) => fs.existsSync(d));

  const allFiles: { fullPath: string; num: number; status: string }[] = [];

  for (const d of candidateDirs) {
    const files = fs.readdirSync(d);
    for (const f of files) {
      const match = f.match(/^(\d{1,})-.*\.md$/i);
      if (match) {
        const fullPath = path.join(d, f);
        const num = parseInt(match[1], 10);
        let status = 'UNKNOWN';
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const stMatch = content.match(/\*\*Status:\*\*\s*`?([A-Z_]+)`?/i);
          if (stMatch) status = stMatch[1].toUpperCase();
        } catch {}
        allFiles.push({ fullPath, num, status });
      }
    }
  }

  if (allFiles.length === 0) {
    return null;
  }

  // Prioritize REVIEW_PENDING
  const pendingFiles = allFiles.filter((f) => f.status === 'REVIEW_PENDING');
  if (pendingFiles.length > 0) {
    pendingFiles.sort((a, b) => b.num - a.num);
    return pendingFiles[0].fullPath;
  }

  // Fallback to latest by number
  allFiles.sort((a, b) => b.num - a.num);
  return allFiles[0].fullPath;
}

/**
 * Discovers all active Meta-Prompt files across standard paths.
 */
export function findAllActiveMetaPrompts(targetDir: string = process.cwd()): string[] {
  const paths = getSporepoPaths(targetDir);
  const candidateDirs = [paths.reqsDir, paths.legacyPromptsDir].filter((d) => fs.existsSync(d));

  const results: { fullPath: string; num: number }[] = [];
  for (const d of candidateDirs) {
    const files = fs.readdirSync(d);
    for (const f of files) {
      const match = f.match(/^(\d{1,})-.*\.md$/i);
      if (match) {
        results.push({ fullPath: path.join(d, f), num: parseInt(match[1], 10) });
      }
    }
  }

  results.sort((a, b) => a.num - b.num);
  return results.map((r) => r.fullPath);
}

/**
 * Main command for sporepo gatekeeper / check.
 */
export function gatekeeperCommand(
  rawFilePath?: string,
  options: GatekeeperOptions = {}
): GatekeeperAuditResult[] {
  const targetDir = path.resolve(process.cwd(), options.targetDir || '.');

  let targetFiles: string[] = [];

  if (options.all) {
    targetFiles = findAllActiveMetaPrompts(targetDir);
    if (targetFiles.length === 0) {
      if (!options.quiet) {
        console.log('\x1b[33m[sporepo gatekeeper] Tidak ada berkas Meta-Prompt aktif yang ditemukan untuk diaudit.\x1b[0m');
      }
      return [];
    }
  } else if (rawFilePath) {
    targetFiles = [path.resolve(process.cwd(), rawFilePath)];
  } else {
    const autoFile = findTargetMetaPrompt(targetDir);
    if (!autoFile) {
      if (!options.quiet) {
        console.error('\x1b[31m[sporepo gatekeeper] Error: Tidak ditemukan berkas Meta-Prompt di docs/sporepo/reqs/ atau prompts/request/.\x1b[0m');
        console.error('Silakan tentukan berkas target: npx sporepo gatekeeper docs/sporepo/reqs/001-nama.md\n');
      }
      throw new Error('Tidak ditemukan berkas Meta-Prompt untuk diaudit.');
    }
    targetFiles = [autoFile];
  }

  const results: GatekeeperAuditResult[] = [];

  for (const file of targetFiles) {
    const result = auditMetaPromptFile(file);
    results.push(result);

    if (!options.quiet && !options.json) {
      printGatekeeperReport(result);
    }
  }

  if (options.json && !options.quiet) {
    console.log(JSON.stringify(results.length === 1 ? results[0] : results, null, 2));
  }

  return results;
}

function printGatekeeperReport(res: GatekeeperAuditResult): void {
  const relPath = path.relative(process.cwd(), res.filePath);
  const statusColor =
    res.status === 'APPROVED' ? '\x1b[32m' :
    res.status === 'REVIEW_PENDING' ? '\x1b[33m' :
    res.status === 'VERIFIED' ? '\x1b[36m' : '\x1b[35m';

  const scoreColor =
    res.score >= 80 ? '\x1b[32m' :
    res.score >= 60 ? '\x1b[33m' : '\x1b[31m';

  console.log(`
\x1b[1m\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m
\x1b[1mSPOREPO GATEKEEPER SPECIFICATION AUDIT\x1b[0m
\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m
  \x1b[1mBerkas Target  :\x1b[0m ${relPath}
  \x1b[1mRequest ID     :\x1b[0m [${res.id}] ${res.title}
  \x1b[1mStatus Dokumen :\x1b[0m ${statusColor}${res.status}\x1b[0m
  \x1b[1mUser Sign-Off  :\x1b[0m ${res.isApproved ? '\x1b[32m✓ APPROVED (Siap Koding)\x1b[0m' : '\x1b[31m✗ BELUM DISETUJUI (Koding DILARANG)\x1b[0m'}
  \x1b[1mKematangan     :\x1b[0m ${scoreColor}${res.score} / 100\x1b[0m ${res.isValid ? '\x1b[32m[MEMENUHI SYARAT]\x1b[0m' : '\x1b[31m[ADA CELAH STRUKTURAL]\x1b[0m'}
`);

  if (res.findings.length === 0) {
    console.log('\x1b[32m✔ Sempurna: Tidak ditemukan celah spesifikasi atau kekurangan struktural.\x1b[0m\n');
  } else {
    console.log('\x1b[1mTEMUAN & REKOMENDASI GATEKEEPER:\x1b[0m');
    for (const f of res.findings) {
      const badge =
        f.severity === 'CRITICAL' ? '\x1b[41m\x1b[37m CRITICAL \x1b[0m' :
        f.severity === 'WARNING'  ? '\x1b[43m\x1b[30m WARNING  \x1b[0m' :
                                    '\x1b[44m\x1b[37m   INFO   \x1b[0m';
      console.log(`  ${badge} \x1b[1m[${f.section}]\x1b[0m ${f.message}`);
      console.log(`             \x1b[90m↳ Rekomendasi: ${f.recommendation}\x1b[0m`);
    }
    console.log();
  }

  // Next Steps Guidance
  console.log('\x1b[1mPETUNJUK TINDAKAN SELANJUTNYA:\x1b[0m');
  if (!res.isApproved) {
    console.log('  ⛔ \x1b[33mAI Agent WAJIB BERHENTI. Ajukan pertanyaan keputusan simultan ke pengguna\x1b[0m');
    console.log('     \x1b[33msampai status dicentang: "[x] Status: Disetujui oleh pengguna (APPROVED)".\x1b[0m\n');
  } else if (!res.isValid) {
    console.log('  ⚠️  \x1b[31mPerbaiki temuan CRITICAL di atas agar Meta-Prompt memenuhi standar baku SDD.\x1b[0m\n');
  } else {
    console.log('  🚀 \x1b[32mSpesifikasi matang & telah disetujui. Siap dieksekusi dengan:\x1b[0m');
    console.log(`     \x1b[36mnpx sporepo sdd init ${relPath}\x1b[0m\n`);
  }
}
