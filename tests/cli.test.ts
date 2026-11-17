import test, { describe, it, before, after } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import {
  slugify,
  formatDate,
  getNextRequestNumber,
  getUniqueBugFilePath,
  ensureDir,
} from '../src/utils/file';
import { initCommand } from '../src/commands/init';
import { reqCommand } from '../src/commands/req';
import { bugCommand } from '../src/commands/bug';
import { auditCommand } from '../src/commands/audit';

const ROOT_DIR = path.resolve(__dirname, __dirname.includes('dist') ? '../..' : '..');
const TEST_SANDBOX_DIR = path.join(ROOT_DIR, '.scratch', 'test-sandbox');

describe('sporepo - Unit & Integration Test Suite', () => {
  before(() => {
    // Setup clean test sandbox
    if (fs.existsSync(TEST_SANDBOX_DIR)) {
      fs.rmSync(TEST_SANDBOX_DIR, { recursive: true, force: true });
    }
    ensureDir(TEST_SANDBOX_DIR);
  });

  after(() => {
    // Clean up test sandbox
    if (fs.existsSync(TEST_SANDBOX_DIR)) {
      fs.rmSync(TEST_SANDBOX_DIR, { recursive: true, force: true });
    }
  });

  describe('1. File Utilities (slugify, numbering, dates)', () => {
    it('should slugify complex titles with symbols, spaces, and diacritics', () => {
      assert.equal(slugify('Autentikasi JWT & Refresh Token'), 'autentikasi-jwt-refresh-token');
      assert.equal(slugify('Café & Crème brûlée v2.0'), 'cafe-creme-brulee-v2-0');
      assert.equal(slugify('---hello---world---'), 'hello-world');
      assert.equal(slugify('   '), 'item');
      assert.equal(slugify('Special@#$Chars!'), 'special-chars');
    });

    it('should format date to YYYY-MM-DD correctly', () => {
      const fixedDate = new Date(2026, 10, 17); // Nov 17, 2026
      assert.equal(formatDate(fixedDate), '2026-11-17');
    });

    it('should auto-increment 3-digit request numbers correctly', () => {
      const tmpDir = path.join(TEST_SANDBOX_DIR, 'numbering-test');
      ensureDir(tmpDir);

      // Empty dir -> 001
      assert.deepEqual(getNextRequestNumber(tmpDir), { num: 1, formatted: '001' });

      // Add 001-a.md -> next is 002
      fs.writeFileSync(path.join(tmpDir, '001-first.md'), 'test');
      assert.deepEqual(getNextRequestNumber(tmpDir), { num: 2, formatted: '002' });

      // Add 007-jump.md -> next is 008
      fs.writeFileSync(path.join(tmpDir, '007-jump.md'), 'test');
      assert.deepEqual(getNextRequestNumber(tmpDir), { num: 8, formatted: '008' });

      // Add 999-large.md -> next is 1000
      fs.writeFileSync(path.join(tmpDir, '999-large.md'), 'test');
      assert.deepEqual(getNextRequestNumber(tmpDir), { num: 1000, formatted: '1000' });
    });

    it('should avoid bug filename collisions by appending suffix counter', () => {
      const tmpDir = path.join(TEST_SANDBOX_DIR, 'bug-collision-test');
      ensureDir(tmpDir);

      const path1 = getUniqueBugFilePath(tmpDir, '2026-11-17', 'auth-error');
      assert.equal(path.basename(path1), '2026-11-17-auth-error.md');
      fs.writeFileSync(path1, 'first');

      const path2 = getUniqueBugFilePath(tmpDir, '2026-11-17', 'auth-error');
      assert.equal(path.basename(path2), '2026-11-17-auth-error-2.md');
      fs.writeFileSync(path2, 'second');

      const path3 = getUniqueBugFilePath(tmpDir, '2026-11-17', 'auth-error');
      assert.equal(path.basename(path3), '2026-11-17-auth-error-3.md');
    });
  });

  describe('2. initCommand', () => {
    it('should initialize repository structure and template files', () => {
      const targetDir = path.join(TEST_SANDBOX_DIR, 'init-target');
      const res = initCommand(targetDir, { quiet: true });

      assert.ok(fs.existsSync(path.join(targetDir, 'prompts', 'request')));
      assert.ok(fs.existsSync(path.join(targetDir, 'tests', 'bugs')));
      assert.ok(fs.existsSync(path.join(targetDir, 'prompts', 'README.md')));
      assert.ok(fs.existsSync(path.join(targetDir, 'tests', 'bugs', 'README.md')));
      assert.ok(fs.existsSync(path.join(targetDir, '.sporepo', 'rule.md')));

      assert.equal(res.createdFiles.length, 3);
    });

    it('should not overwrite existing files unless force option is true', () => {
      const targetDir = path.join(TEST_SANDBOX_DIR, 'init-target');
      const readmePath = path.join(targetDir, 'prompts', 'README.md');
      fs.writeFileSync(readmePath, 'CUSTOM_CONTENT');

      // Without force -> should skip
      const res1 = initCommand(targetDir, { quiet: true, force: false });
      assert.ok(res1.skippedFiles.includes('prompts/README.md'));
      assert.equal(fs.readFileSync(readmePath, 'utf-8'), 'CUSTOM_CONTENT');

      // With force -> should overwrite
      const res2 = initCommand(targetDir, { quiet: true, force: true });
      assert.ok(res2.createdFiles.includes('prompts/README.md'));
      assert.notEqual(fs.readFileSync(readmePath, 'utf-8'), 'CUSTOM_CONTENT');
    });
  });

  describe('3. reqCommand (Feature Requests)', () => {
    it('should create incremented request files with complete meta-prompt content', () => {
      const targetDir = path.join(TEST_SANDBOX_DIR, 'req-target');
      initCommand(targetDir, { quiet: true });

      const res1 = reqCommand('Payment Integration', { targetDir, quiet: true });
      assert.equal(res1.id, '001');
      assert.equal(res1.slug, 'payment-integration');
      assert.ok(fs.existsSync(res1.filePath));

      const content1 = fs.readFileSync(res1.filePath, 'utf-8');
      assert.ok(content1.includes('# META-PROMPT: [001] Payment Integration'));
      assert.ok(content1.includes('INDEPENDENT REVIEWER GATEKEEPER (STRICT BARRIER)'));
      assert.ok(content1.includes('@Backend'));
      assert.ok(content1.includes('@Frontend'));
      assert.ok(content1.includes('@QA'));

      // Second request -> 002
      const res2 = reqCommand('Push Notifications', { targetDir, quiet: true });
      assert.equal(res2.id, '002');
      assert.equal(res2.slug, 'push-notifications');
      assert.ok(fs.existsSync(res2.filePath));

      const content2 = fs.readFileSync(res2.filePath, 'utf-8');
      assert.ok(content2.includes('# META-PROMPT: [002] Push Notifications'));
    });

    it('should throw error when title is empty', () => {
      assert.throws(() => reqCommand('   ', { quiet: true }), /Nama\/judul fitur tidak boleh kosong/);
    });
  });

  describe('4. bugCommand (Bug Reports)', () => {
    it('should create bug report markdown with mandatory cURL & Systematic Debugging sections', () => {
      const targetDir = path.join(TEST_SANDBOX_DIR, 'bug-target');
      initCommand(targetDir, { quiet: true });

      const res = bugCommand('Auth 401 on Checkout', { targetDir, quiet: true });
      assert.ok(fs.existsSync(res.filePath));

      const content = fs.readFileSync(res.filePath, 'utf-8');
      assert.ok(content.includes('# BUG REPORT: Auth 401 on Checkout'));
      assert.ok(content.includes('Ground-Truth cURL Command'));
      assert.ok(content.includes('Actual Error Payload'));
      assert.ok(content.includes('THE IRON LAW: NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST'));
      assert.ok(content.includes('Phase 1: Investigasi Akar Masalah'));
      assert.ok(content.includes('Phase 3: Test-Driven Development'));
    });

    it('should throw error when bug title is empty', () => {
      assert.throws(() => bugCommand('', { quiet: true }), /Nama\/judul bug tidak boleh kosong/);
    });
  });

  describe('5. auditCommand', () => {
    it('should accurately audit repository status and compliance', () => {
      const targetDir = path.join(TEST_SANDBOX_DIR, 'audit-target');
      initCommand(targetDir, { quiet: true });

      reqCommand('Feature One', { targetDir, quiet: true });
      bugCommand('Bug One', { targetDir, quiet: true });

      const audit = auditCommand(targetDir, { quiet: true });
      assert.equal(audit.hasPromptsDir, true);
      assert.equal(audit.hasBugsDir, true);
      assert.equal(audit.hasSporepoRule, true);
      assert.equal(audit.requests.length, 1);
      assert.equal(audit.bugs.length, 1);
      assert.ok(audit.complianceScore >= 60);
    });
  });

  describe('6. CLI Executable End-to-End', () => {
    const binScript = path.join(ROOT_DIR, 'bin', 'sporepo.js');

    it('should execute bin/sporepo.js --help and exit with 0', () => {
      const rawOut = execFileSync(process.execPath, [binScript, '--help'], { encoding: 'utf-8' });
      const out = rawOut.replace(/\x1b\[[0-9;]*m/g, '');
      assert.ok(out.includes('sporepo v1.0.0'));
      assert.ok(out.includes('init [target-dir]'));
      assert.ok(out.includes('req  <"Nama Fitur">'));
      assert.ok(out.includes('bug  <"Nama Bug">'));
    });

    it('should execute bin/sporepo.js init, req, bug, and audit end-to-end via CLI', () => {
      const e2eDir = path.join(TEST_SANDBOX_DIR, 'e2e-cli-test');

      // 1. init
      const initOut = execFileSync(process.execPath, [binScript, 'init', e2eDir], { encoding: 'utf-8' });
      assert.ok(initOut.includes('Inisialisasi struktur rekayasa sporepo berhasil'));

      // 2. req
      const reqOut = execFileSync(
        process.execPath,
        [binScript, 'req', 'OAuth2 Google Sign In', '--dir', e2eDir],
        { encoding: 'utf-8' }
      );
      assert.ok(reqOut.includes('Meta-Prompt berhasil dibuat'));
      assert.ok(reqOut.includes('001-oauth2-google-sign-in.md'));

      // 3. bug
      const bugOut = execFileSync(
        process.execPath,
        [binScript, 'bug', 'Null Pointer in Token Parser', '--dir', e2eDir],
        { encoding: 'utf-8' }
      );
      assert.ok(bugOut.includes('Laporan Bug berhasil dibuat'));
      assert.ok(bugOut.includes('null-pointer-in-token-parser.md'));

      // 4. audit
      const auditOut = execFileSync(process.execPath, [binScript, 'audit', e2eDir], { encoding: 'utf-8' });
      assert.ok(auditOut.includes('Laporan Kepatuhan Rekayasa'));
      assert.ok(auditOut.includes('prompts/request/ : Ditemukan'));
      assert.ok(auditOut.includes('#001'));
    });
  });
});
