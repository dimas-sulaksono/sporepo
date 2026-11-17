import test, { describe, it, before, after } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { ensureDir } from '../src/utils/file';
import {
  auditMetaPromptFile,
  findTargetMetaPrompt,
  gatekeeperCommand,
} from '../src/commands/gatekeeper';

const ROOT_DIR = path.resolve(__dirname, __dirname.includes('dist') ? '../..' : '..');
const TEST_SANDBOX_DIR = path.join(ROOT_DIR, '.scratch', 'test-gatekeeper-sandbox');
const binScript = path.join(ROOT_DIR, 'bin', 'sporepo.js');

const DUMMY_VALID_META = `# META-PROMPT: [088] Fitur Notifikasi Realtime

> **Request ID:** 088  
> **Date:** 2026-11-17  
> **Status:** \`APPROVED\`  
> **Branch / Target:** \`feat/notif\`  
> **Target Scope:** Webhook & WebSocket Notification Service  

---

## 1. Konteks Bisnis & Tujuan Fitur (*Problem & Goal*)

### A. Latar Belakang Masalah (*Problem Statement*)
Pengguna sering kali terlambat menerima notifikasi penting karena sistem polling 60 detik.

### B. Tujuan Utama (*Goal*)
Membangun websocket gateway yang mampu mengirimkan notifikasi event secara sub-detik (< 500ms).

### C. Kriteria Keberhasilan (*Success Metrics*)
- Latensi pengiriman < 500ms.
- 100% test pass dengan nol runtime dependencies tambahan.

---

## 2. Matriks Persona & Pembagian Tanggung Jawab (*Multi-Persona Assignment*)

| Persona | Tanggung Jawab Spesifik | Batas Kepemilikan File (*File Ownership*) |
| :--- | :--- | :--- |
| **@Architect** | Desain protokol socket dan payload contract | \`docs/\`, \`src/types/\` |
| **@Backend** | Implementasi handler socket di \`src/ws/\` | \`src/ws/\` |
| **@QA** | Automated integration tests | \`tests/\` |

---

## 3. Batas Kepemilikan Berkas (*File Ownership & Touch Boundaries*)

- **Berkas yang Boleh Dibuat / Dimodifikasi (*Allowed Files*):**
  - \`src/ws/gateway.ts\`
  - \`tests/ws.test.ts\`
- **Berkas yang DILARANG Disentuh / Diubah (*Restricted / Read-Only Files*):**
  - \`package.json\` dependencies
- **Deliverables yang Diharapkan:**
  1. Modul gateway WebSocket
  2. Test suite komprehensif

---

## 4. INDEPENDENT REVIEWER GATEKEEPER (STRICT BARRIER) ⛔

### A. Audit Celah Spesifikasi & Edge Cases
Audit celah koneksi putus-nyambung dan heartbeat.

### B. Daftar Pertanyaan Keputusan untuk Pengguna (*Simultaneous Decision Round*)
- [x] **Pertanyaan 1 (Interval Heartbeat):**
  Apakah interval 30 detik disetujui? (Jawaban: Ya)

### C. Konfirmasi Persetujuan Pengguna (*User Sign-Off*)
- [x] **Status:** Disetujui oleh pengguna untuk mulai koding (\`APPROVED\`)
- **Catatan Persetujuan Pengguna:** Persetujuan diberikan oleh tech lead.

---

## 5. Rencana Eksekusi Atomik (*Subagent-Driven Development / SDD*)

- [ ] **Task 1: Setup WebSocket Gateway Core**
  - **Fokus Persona:** \`@Backend\`
  - **Aksi:** Buat class Gateway di \`src/ws/gateway.ts\`
  - **Verifikasi Task:** \`npm test tests/ws.test.ts\`

---

## 6. Protokol Verifikasi Akhir (*Verification Before Completion*)

### A. Terminal Command Verification
\`\`\`bash
npm test
\`\`\`
`;

const DUMMY_UNAPPROVED_META = `# META-PROMPT: [089] Fitur Mentah Belum Diaudit

> **Request ID:** 089  
> **Status:** \`REVIEW_PENDING\`  

---

## 1. Konteks Bisnis & Tujuan Fitur (*Problem & Goal*)
- **Latar Belakang:** Masalah performa.
- **Tujuan Utama (*Goal*):** Optimasi query database.
- **Kriteria Keberhasilan (*Success Metrics*):** Lebih cepat.

---

## 2. Matriks Persona & Pembagian Tanggung Jawab (*Multi-Persona Assignment*)

| Persona | Tanggung Jawab |
| :--- | :--- |
| **@Backend** | Optimasi kueri |

---

## 3. Batas Kepemilikan Berkas (*File Ownership & Touch Boundaries*)
- **Berkas yang Boleh Dibuat / Dimodifikasi:**
  - \`src/db/query.ts\`
- **Berkas yang DILARANG Disentuh / Diubah:**
  - \`schema.sql\`

---

## 4. INDEPENDENT REVIEWER GATEKEEPER (STRICT BARRIER) ⛔
### B. Daftar Pertanyaan Keputusan untuk Pengguna (*Simultaneous Decision Round*)
- [ ] **Pertanyaan 1:** Index apa yang dipakai?

### C. Konfirmasi Persetujuan Pengguna (*User Sign-Off*)
- [ ] **Status:** Disetujui oleh pengguna untuk mulai koding (\`APPROVED\`)

---

## 5. Rencana Eksekusi Atomik (*Subagent-Driven Development / SDD*)
- [ ] **Task 1: Add DB Index**
  - **Fokus Persona:** \`@Backend\`
  - **Aksi:** Buat indeks
  - **Verifikasi Task:** \`npm test\`
`;

describe('sporepo-gatekeeper - Specification Audit & Linter Test Suite', () => {
  let validFilePath: string;
  let unapprovedFilePath: string;
  let brokenFilePath: string;
  let reqsDir: string;

  before(() => {
    if (fs.existsSync(TEST_SANDBOX_DIR)) {
      fs.rmSync(TEST_SANDBOX_DIR, { recursive: true, force: true });
    }
    reqsDir = path.join(TEST_SANDBOX_DIR, 'docs', 'sporepo', 'reqs');
    ensureDir(reqsDir);

    validFilePath = path.join(reqsDir, '088-fitur-notifikasi-realtime.md');
    unapprovedFilePath = path.join(reqsDir, '089-fitur-mentah-belum-diaudit.md');
    brokenFilePath = path.join(reqsDir, '090-broken-spec.md');

    fs.writeFileSync(validFilePath, DUMMY_VALID_META, 'utf-8');
    fs.writeFileSync(unapprovedFilePath, DUMMY_UNAPPROVED_META, 'utf-8');
    fs.writeFileSync(brokenFilePath, '# Berkas Tanpa Format Baku\nHanya teks bebas tanpa seksi baku.', 'utf-8');
  });

  after(() => {
    if (fs.existsSync(TEST_SANDBOX_DIR)) {
      fs.rmSync(TEST_SANDBOX_DIR, { recursive: true, force: true });
    }
  });

  describe('1. auditMetaPromptFile Structural Validator', () => {
    it('should validate a compliant and approved Meta-Prompt with high score and zero critical findings', () => {
      const res = auditMetaPromptFile(validFilePath);
      assert.strictEqual(res.id, '088');
      assert.strictEqual(res.status, 'APPROVED');
      assert.strictEqual(res.isApproved, true);
      assert.strictEqual(res.isValid, true);
      assert.ok(res.score >= 90, `Score expected >= 90, got ${res.score}`);
      assert.strictEqual(res.findings.filter((f) => f.severity === 'CRITICAL').length, 0);
    });

    it('should catch unapproved status and report critical gatekeeper barrier finding', () => {
      const res = auditMetaPromptFile(unapprovedFilePath);
      assert.strictEqual(res.id, '089');
      assert.strictEqual(res.status, 'REVIEW_PENDING');
      assert.strictEqual(res.isApproved, false);
      assert.strictEqual(res.isValid, false);
      const barrierFinding = res.findings.find((f) => f.section.includes('Barrier') || f.section.includes('Sign-Off'));
      assert.ok(barrierFinding, 'Expected to find barrier/sign-off finding');
      assert.strictEqual(barrierFinding?.severity, 'CRITICAL');
    });

    it('should heavily penalize broken unstructured files with multiple critical findings', () => {
      const res = auditMetaPromptFile(brokenFilePath);
      assert.strictEqual(res.isValid, false);
      assert.ok(res.score < 50, `Score expected < 50, got ${res.score}`);
      const criticals = res.findings.filter((f) => f.severity === 'CRITICAL');
      assert.ok(criticals.length >= 3, `Expected at least 3 critical findings, got ${criticals.length}`);
    });

    it('should throw clear error when target file does not exist', () => {
      assert.throws(
        () => auditMetaPromptFile(path.join(TEST_SANDBOX_DIR, 'non-existent.md')),
        /Berkas tidak ditemukan/
      );
    });
  });

  describe('2. findTargetMetaPrompt Auto-Discovery', () => {
    it('should prioritize files with REVIEW_PENDING status over other files', () => {
      const autoFile = findTargetMetaPrompt(TEST_SANDBOX_DIR);
      assert.ok(autoFile, 'Expected target file to be found');
      assert.strictEqual(path.basename(autoFile!), '089-fitur-mentah-belum-diaudit.md');
    });

    it('should fallback to latest file by sequence number when no REVIEW_PENDING exists', () => {
      // Temporarily mark 089 as APPROVED
      try {
        fs.writeFileSync(unapprovedFilePath, DUMMY_UNAPPROVED_META.replace('REVIEW_PENDING', 'APPROVED'), 'utf-8');
        const autoFile = findTargetMetaPrompt(TEST_SANDBOX_DIR);
        assert.ok(autoFile);
        // 090 is highest sequence number in sandbox (90 > 89)
        assert.strictEqual(path.basename(autoFile!), '090-broken-spec.md');
      } finally {
        // Always revert 089 to unapproved
        fs.writeFileSync(unapprovedFilePath, DUMMY_UNAPPROVED_META, 'utf-8');
      }
    });
  });

  describe('3. gatekeeperCommand Orchestration & Options', () => {
    it('should audit all active files when --all option is passed', () => {
      const results = gatekeeperCommand(undefined, { all: true, targetDir: TEST_SANDBOX_DIR, quiet: true });
      assert.ok(results.length >= 2, `Expected at least 2 files audited, got ${results.length}`);
      const ids = results.map((r) => r.id);
      assert.ok(ids.includes('088'));
      assert.ok(ids.includes('089'));
    });

    it('should return valid JSON structure when quiet option is enabled', () => {
      const results = gatekeeperCommand(validFilePath, { quiet: true });
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, '088');
      assert.strictEqual(results[0].isValid, true);
    });
  });

  describe('4. CLI Executable gatekeeper & check End-to-End', () => {
    it('should execute bin/sporepo.js check on approved file and exit with 0', () => {
      const stdout = execFileSync('node', [binScript, 'check', validFilePath], {
        encoding: 'utf-8',
        cwd: ROOT_DIR,
      });
      assert.ok(stdout.includes('SPOREPO GATEKEEPER SPECIFICATION AUDIT'));
      assert.ok(stdout.includes('APPROVED'));
      assert.ok(stdout.includes('[088]'));
    });

    it('should execute bin/sporepo.js gatekeeper on unapproved file and exit with 1', () => {
      let exitCode = 0;
      let stderrOrStdout = '';
      try {
        stderrOrStdout = execFileSync('node', [binScript, 'gatekeeper', unapprovedFilePath], {
          encoding: 'utf-8',
          cwd: ROOT_DIR,
        });
      } catch (err: any) {
        exitCode = err.status || 1;
        stderrOrStdout = (err.stdout || '') + (err.stderr || '');
      }

      assert.strictEqual(exitCode, 1, 'Expected exit code 1 for unapproved file');
      assert.ok(stderrOrStdout.includes('CRITICAL'));
      assert.ok(stderrOrStdout.includes('BELUM DISETUJUI'));
    });

    it('should support --json flag and output valid parseable JSON via CLI', () => {
      const stdout = execFileSync('node', [binScript, 'check', '--json', validFilePath], {
        encoding: 'utf-8',
        cwd: ROOT_DIR,
      });
      const parsed = JSON.parse(stdout);
      assert.strictEqual(parsed.id, '088');
      assert.strictEqual(parsed.isApproved, true);
    });

    it('should show check command in sporepo --help screen', () => {
      const stdout = execFileSync('node', [binScript, '--help'], {
        encoding: 'utf-8',
        cwd: ROOT_DIR,
      });
      assert.ok(stdout.includes('check'));
      assert.ok(stdout.includes('gatekeeper'));
    });
  });
});
