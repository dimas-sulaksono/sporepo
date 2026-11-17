import test, { describe, it, before, after } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import {
  slugify,
  getNextRequestNumber,
  getUniqueBugFilePath,
  ensureDir,
} from '../src/utils/file';
import { initCommand } from '../src/commands/init';
import { reqCommand } from '../src/commands/req';
import { bugCommand } from '../src/commands/bug';

const ROOT_DIR = path.resolve(__dirname, __dirname.includes('dist') ? '../..' : '..');
const SANDBOX_DIR = path.join(ROOT_DIR, '.scratch', 'qa-security-sandbox');
const binScript = path.join(ROOT_DIR, 'bin', 'sporepo.js');

describe('SPOREPO - Advanced QA & Security Edge-Cases', () => {
  before(() => {
    if (fs.existsSync(SANDBOX_DIR)) {
      fs.rmSync(SANDBOX_DIR, { recursive: true, force: true });
    }
    ensureDir(SANDBOX_DIR);
  });

  after(() => {
    if (fs.existsSync(SANDBOX_DIR)) {
      fs.rmSync(SANDBOX_DIR, { recursive: true, force: true });
    }
  });

  describe('Task 1: QA Functional & Edge-Case Testing', () => {
    it('should sanitize extreme slug titles with emojis, punctuation, and multi-byte diacritics', () => {
      const complex1 = slugify('Payment (QRIS / OVO / GoPay) 🚀 100% Secure!');
      assert.equal(complex1, 'payment-qris-ovo-gopay-100-secure');

      const complex2 = slugify('Über cool Crème Brûlée & Café!');
      assert.equal(complex2, 'uber-cool-creme-brulee-cafe');

      const complex3 = slugify('---___---!!!***---');
      assert.equal(complex3, 'item'); // fallback for pure symbols
    });

    it('should ignore non-conforming filenames when computing next sequence number', () => {
      const testDir = path.join(SANDBOX_DIR, 'sequence-fuzz');
      ensureDir(testDir);

      // Create random noise files
      fs.writeFileSync(path.join(testDir, 'README.md'), 'docs');
      fs.writeFileSync(path.join(testDir, 'not-a-number.md'), 'test');
      fs.writeFileSync(path.join(testDir, 'abc-001.md'), 'test');
      fs.writeFileSync(path.join(testDir, '005-login.md'), 'test');
      fs.writeFileSync(path.join(testDir, '009-checkout.md'), 'test');

      const next = getNextRequestNumber(testDir);
      assert.equal(next.num, 10);
      assert.equal(next.formatted, '010');
    });

    it('should seamlessly handle transition from 999 to 1000+ request numbers', () => {
      const testDir = path.join(SANDBOX_DIR, 'large-sequence');
      ensureDir(testDir);

      fs.writeFileSync(path.join(testDir, '999-limit.md'), 'test');
      const next1 = getNextRequestNumber(testDir);
      assert.equal(next1.num, 1000);
      assert.equal(next1.formatted, '1000');

      fs.writeFileSync(path.join(testDir, '1000-reached.md'), 'test');
      const next2 = getNextRequestNumber(testDir);
      assert.equal(next2.num, 1001);
      assert.equal(next2.formatted, '1001');
    });

    it('should resolve multiple bug collisions on identical date without data loss', () => {
      const testDir = path.join(SANDBOX_DIR, 'bug-collisions');
      ensureDir(testDir);

      const path1 = getUniqueBugFilePath(testDir, '2026-11-17', 'auth-timeout');
      fs.writeFileSync(path1, 'Bug 1 content');
      const path2 = getUniqueBugFilePath(testDir, '2026-11-17', 'auth-timeout');
      fs.writeFileSync(path2, 'Bug 2 content');
      const path3 = getUniqueBugFilePath(testDir, '2026-11-17', 'auth-timeout');
      fs.writeFileSync(path3, 'Bug 3 content');

      assert.equal(path.basename(path1), '2026-11-17-auth-timeout.md');
      assert.equal(path.basename(path2), '2026-11-17-auth-timeout-2.md');
      assert.equal(path.basename(path3), '2026-11-17-auth-timeout-3.md');
      assert.equal(fs.readFileSync(path1, 'utf-8'), 'Bug 1 content');
      assert.equal(fs.readFileSync(path2, 'utf-8'), 'Bug 2 content');
      assert.equal(fs.readFileSync(path3, 'utf-8'), 'Bug 3 content');
    });

    it('should preserve existing user custom configurations when re-running init without --force', () => {
      const testDir = path.join(SANDBOX_DIR, 'idempotent-init');
      initCommand(testDir, { quiet: true });

      const ruleFile = path.join(testDir, '.sporepo', 'rule.md');
      fs.writeFileSync(ruleFile, 'CUSTOM_RULE_OVERRIDE');

      initCommand(testDir, { quiet: true }); // rerun without force
      assert.equal(fs.readFileSync(ruleFile, 'utf-8'), 'CUSTOM_RULE_OVERRIDE');

      initCommand(testDir, { quiet: true, force: true }); // rerun with force
      assert.notEqual(fs.readFileSync(ruleFile, 'utf-8'), 'CUSTOM_RULE_OVERRIDE');
    });
  });

  describe('Task 2: Security & Path Traversal Audit', () => {
    it('should safely normalize target directory paths with ../ without unintended escaping', () => {
      const nestedDir = path.join(SANDBOX_DIR, 'level1', 'level2');
      ensureDir(nestedDir);

      // Traversal target pointing to level1 from level2
      const res = initCommand(path.join(nestedDir, '..'), { quiet: true });
      assert.equal(res.targetDir, path.join(SANDBOX_DIR, 'level1'));
      assert.ok(fs.existsSync(path.join(SANDBOX_DIR, 'level1', 'prompts', 'request')));
    });

    it('should verify binary file permissions have executable flag 0755', () => {
      const stats = fs.statSync(binScript);
      const isExecutable = (stats.mode & 0o111) !== 0;
      assert.ok(isExecutable, 'bin/sporepo.js must be executable (chmod +x / 0755)');
    });

    it('should confirm source code has zero unsafe eval or dynamic code execution', () => {
      const srcDir = path.join(ROOT_DIR, 'src');
      const files = fs.readdirSync(srcDir, { recursive: true }) as string[];

      for (const file of files) {
        if (typeof file === 'string' && file.endsWith('.ts')) {
          const content = fs.readFileSync(path.join(srcDir, file), 'utf-8');
          assert.equal(content.includes('eval('), false, `unsafe eval found in ${file}`);
          assert.equal(content.includes('new Function('), false, `unsafe Function constructor in ${file}`);
          assert.equal(content.includes('child_process.exec('), false, `unsafe child_process.exec in ${file}`);
        }
      }
    });
  });

  describe('Task 3: Packaging & Zero-Dependency Purity', () => {
    it('should verify package.json has 0 runtime dependencies', () => {
      const pkgPath = path.join(ROOT_DIR, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      assert.deepEqual(pkg.dependencies || {}, {}, 'sporepo must strictly have ZERO runtime dependencies');
      assert.ok(pkg.bin && pkg.bin.sporepo, 'bin.sporepo must be defined in package.json');
      assert.equal(pkg.license, 'MIT');
    });

    it('should execute binary CLI and exit cleanly with proper status codes', () => {
      // Missing command -> prints help, exit 0
      const rawHelp = execFileSync(process.execPath, [binScript], { encoding: 'utf-8' });
      const cleanHelp = rawHelp.replace(/\x1b\[[0-9;]*m/g, '');
      assert.ok(cleanHelp.includes('sporepo v1.0.0'));

      // Version flag -> exit 0
      const verOut = execFileSync(process.execPath, [binScript, '-v'], { encoding: 'utf-8' });
      assert.equal(verOut.trim(), 'sporepo v1.0.0');

      // Invalid command -> exit 1
      assert.throws(() => {
        execFileSync(process.execPath, [binScript, 'unknown-cmd'], { encoding: 'utf-8' });
      });

      // Missing argument for req -> exit 1
      assert.throws(() => {
        execFileSync(process.execPath, [binScript, 'req'], { encoding: 'utf-8' });
      });
    });
  });
});
