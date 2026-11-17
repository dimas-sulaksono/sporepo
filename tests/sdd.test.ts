import test, { describe, it, before, after } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { ensureDir } from '../src/utils/file';
import {
  parseMetaPrompt,
  generateTaskBriefContent,
  createReviewPackage,
} from '../src/utils/sdd-parser';
import {
  sddInitCommand,
  sddBriefCommand,
  sddPackCommand,
} from '../src/commands/sdd';

const ROOT_DIR = path.resolve(__dirname, __dirname.includes('dist') ? '../..' : '..');
const TEST_SANDBOX_DIR = path.join(ROOT_DIR, '.scratch', 'test-sdd-sandbox');
const binScript = path.join(ROOT_DIR, 'bin', 'sporepo.js');

const DUMMY_META_PROMPT = `# META-PROMPT: [099] Test Feature for SDD

> **Request ID:** 099  
> **Status:** \`APPROVED\`  
> **Branch / Target:** \`feat/test\`  

---

## 3. Batas Kepemilikan Berkas (*Touch Boundaries*)
- **Berkas yang Boleh Dibuat / Dimodifikasi:**
  - \`src/core/test.ts\`
  - \`tests/unit/test.test.ts\`
- **Berkas yang DILARANG Disentuh / Diubah:**
  - \`package.json\` dependencies
  - \`LICENSE\`

---

## 5. Rencana Eksekusi Atomik (*Subagent-Driven Development / SDD*)

- [ ] **Task 1: Setup Core Module**
  - **Fokus Persona:** \`@Backend\`
  - **Aksi:** Buat fungsi calculate() di src/core/test.ts
  - **Verifikasi Task:** \`npm test tests/unit/test.test.ts\`
- [x] **Task 2: Add Helper Utilities**
  - **Fokus Persona:** \`@Architect\`
  - **Aksi:** Buat helper di src/core/helper.ts
  - **Verifikasi Task:** \`npm test\`
`;

describe('sporepo-sdd - Subagent-Driven Development Test Suite', () => {
  let sampleMetaPath: string;

  before(() => {
    if (fs.existsSync(TEST_SANDBOX_DIR)) {
      fs.rmSync(TEST_SANDBOX_DIR, { recursive: true, force: true });
    }
    ensureDir(TEST_SANDBOX_DIR);
    sampleMetaPath = path.join(TEST_SANDBOX_DIR, '099-test-feature.md');
    fs.writeFileSync(sampleMetaPath, DUMMY_META_PROMPT, 'utf-8');
  });

  after(() => {
    if (fs.existsSync(TEST_SANDBOX_DIR)) {
      fs.rmSync(TEST_SANDBOX_DIR, { recursive: true, force: true });
    }
  });

  describe('1. SDD Parser Utility', () => {
    it('should parse Meta-Prompt metadata, touch boundaries, and atomic tasks', () => {
      const meta = parseMetaPrompt(sampleMetaPath);
      assert.equal(meta.id, '099');
      assert.equal(meta.title, 'Test Feature for SDD');
      assert.equal(meta.status, 'APPROVED');
      assert.equal(meta.branch, 'feat/test');

      assert.ok(meta.allowedFiles.includes('src/core/test.ts'));
      assert.ok(meta.allowedFiles.includes('tests/unit/test.test.ts'));
      assert.ok(meta.restrictedFiles.includes('package.json'));

      assert.equal(meta.tasks.length, 2);
      assert.equal(meta.tasks[0].taskNum, 1);
      assert.equal(meta.tasks[0].title, 'Setup Core Module');
      assert.equal(meta.tasks[0].persona, '`@Backend`');
      assert.equal(meta.tasks[0].completed, false);

      assert.equal(meta.tasks[1].taskNum, 2);
      assert.equal(meta.tasks[1].title, 'Add Helper Utilities');
      assert.equal(meta.tasks[1].completed, true);
    });

    it('should throw error when parsing non-existent Meta-Prompt file', () => {
      assert.throws(
        () => parseMetaPrompt(path.join(TEST_SANDBOX_DIR, 'non-existent.md')),
        /Berkas Meta-Prompt tidak ditemukan/
      );
    });

    it('should generate isolated task brief content with touch boundaries and criteria', () => {
      const meta = parseMetaPrompt(sampleMetaPath);
      const brief = generateTaskBriefContent(meta, 1);

      assert.ok(brief.includes('# TASK BRIEF: Task 1 - Setup Core Module'));
      assert.ok(brief.includes('`src/core/test.ts`'));
      assert.ok(brief.includes('`package.json`'));
      assert.ok(brief.includes('npm test tests/unit/test.test.ts'));
      assert.ok(brief.includes('Reporting Contract'));
    });

    it('should throw error when generating brief for invalid task number', () => {
      const meta = parseMetaPrompt(sampleMetaPath);
      assert.throws(() => generateTaskBriefContent(meta, 999), /Task #999 tidak ditemukan/);
    });
  });

  describe('2. SDD Commands Logic', () => {
    it('should initialize SDD ledger with initial commit and pending task map', () => {
      const res = sddInitCommand(sampleMetaPath, { targetDir: TEST_SANDBOX_DIR, quiet: true });
      assert.ok(fs.existsSync(res.ledgerPath));
      assert.equal(res.requestId, '099');
      assert.equal(res.totalTasks, 2);

      const content = fs.readFileSync(res.ledgerPath, 'utf-8');
      assert.ok(content.includes('# SDD Ledger — Request: [099] Test Feature for SDD'));
      assert.ok(content.includes('Task Execution Map'));
      assert.ok(content.includes('Setup Core Module'));
      assert.ok(content.includes('Rulings & Decisions Record'));
    });

    it('should extract task brief to designated output file', () => {
      const customOut = path.join(TEST_SANDBOX_DIR, 'custom-task-1-brief.md');
      const res = sddBriefCommand(sampleMetaPath, 1, { out: customOut, quiet: true });

      assert.equal(res.briefPath, customOut);
      assert.ok(fs.existsSync(customOut));
      assert.equal(res.taskNum, 1);
      assert.equal(res.taskTitle, 'Setup Core Module');

      const content = fs.readFileSync(customOut, 'utf-8');
      assert.ok(content.includes('# TASK BRIEF: Task 1'));
    });

    it('should create review package between commit range without errors', () => {
      const outPack = path.join(TEST_SANDBOX_DIR, 'test-pack.md');
      const res = sddPackCommand('HEAD~1', 'HEAD', { out: outPack, quiet: true });

      assert.ok(fs.existsSync(res.packagePath));
      const content = fs.readFileSync(res.packagePath, 'utf-8');
      assert.ok(content.includes('# Review Package:'));
      assert.ok(content.includes('Commit Log'));
      assert.ok(content.includes('Diff Summary'));
      assert.ok(content.includes('Unified Diff'));
    });
  });

  describe('3. CLI Executable sdd Subcommands End-to-End', () => {
    it('should display sdd help screen', () => {
      const rawOut = execFileSync(process.execPath, [binScript, 'sdd', '--help'], { encoding: 'utf-8' });
      const out = rawOut.replace(/\x1b\[[0-9;]*m/g, '');
      assert.ok(out.includes('sporepo sdd'));
      assert.ok(out.includes('init  <file>'));
      assert.ok(out.includes('brief <file> <task-num>'));
      assert.ok(out.includes('pack  <base> [head]'));
      assert.ok(out.includes('parse <file>'));
    });

    it('should execute sporepo sdd parse via CLI', () => {
      const out = execFileSync(process.execPath, [binScript, 'sdd', 'parse', sampleMetaPath], { encoding: 'utf-8' });
      assert.ok(out.includes('Ringkasan Tugas Meta-Prompt [099]'));
      assert.ok(out.includes('Task 1: Setup Core Module'));
      assert.ok(out.includes('Task 2: Add Helper Utilities'));
    });

    it('should execute sporepo sdd brief via CLI', () => {
      const out = execFileSync(
        process.execPath,
        [binScript, 'sdd', 'brief', sampleMetaPath, '2', '--out', path.join(TEST_SANDBOX_DIR, 'cli-brief-2.md')],
        { encoding: 'utf-8' }
      );
      assert.ok(out.includes('Task Brief berhasil diekstrak'));
      assert.ok(out.includes('Task 2: Add Helper Utilities'));
      assert.ok(fs.existsSync(path.join(TEST_SANDBOX_DIR, 'cli-brief-2.md')));
    });
  });
});
