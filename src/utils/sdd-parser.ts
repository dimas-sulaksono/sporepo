import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { ensureDir } from './file';

export interface SDDTask {
  taskNum: number;
  title: string;
  persona: string;
  action: string;
  verification: string;
  completed: boolean;
  rawContent: string;
}

export interface ParsedMetaPrompt {
  filePath: string;
  id: string;
  title: string;
  status: string;
  branch: string;
  allowedFiles: string[];
  restrictedFiles: string[];
  tasks: SDDTask[];
}

/**
 * Parses a SPOREPO Meta-Prompt markdown file into structured metadata and atomic tasks.
 */
export function parseMetaPrompt(filePath: string): ParsedMetaPrompt {
  if (!fs.existsSync(filePath)) {
    throw new Error(`[sporepo-sdd] Berkas Meta-Prompt tidak ditemukan: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  // 1. Extract ID & Title
  const headerMatch = content.match(/^# META-PROMPT:\s*(\[(\d+)\]\s*)?(.*)$/m);
  const idMatch = content.match(/\*\*Request ID:\*\*\s*([0-9A-Za-z_-]+)/i);
  const id = idMatch ? idMatch[1] : headerMatch && headerMatch[2] ? headerMatch[2] : '000';
  const title = headerMatch ? headerMatch[3].trim() : path.basename(filePath, '.md');

  // 2. Extract Status & Branch
  const statusMatch = content.match(/\*\*Status:\*\*\s*`?([A-Z_]+)`?/i);
  const status = statusMatch ? statusMatch[1].toUpperCase() : 'UNKNOWN';

  const branchMatch = content.match(/\*\*Branch \/ Target:\*\*\s*`?([^`\n]+)`?/i);
  const branch = branchMatch ? branchMatch[1].trim() : 'main';

  // 3. Extract Allowed & Restricted Files
  const allowedFiles: string[] = [];
  const restrictedFiles: string[] = [];

  const allowedMatch = content.match(/Berkas yang Boleh Dibuat \/ Dimodifikasi[^:]*:\s*([\s\S]*?)(?=Berkas yang DILARANG|Deliverables|---|\n## )/i);
  if (allowedMatch) {
    const lines = allowedMatch[1].split('\n');
    for (const line of lines) {
      const itemMatch = line.trim().match(/^[-*]\s*`?([^`\n]+)`?/);
      if (itemMatch && itemMatch[1].trim() && !itemMatch[1].includes('...')) {
        allowedFiles.push(itemMatch[1].trim());
      }
    }
  }

  const restrictedMatch = content.match(/Berkas yang DILARANG Disentuh \/ Diubah[^:]*:\s*([\s\S]*?)(?=Deliverables|---|\n## )/i);
  if (restrictedMatch) {
    const lines = restrictedMatch[1].split('\n');
    for (const line of lines) {
      const itemMatch = line.trim().match(/^[-*]\s*`?([^`\n]+)`?/);
      if (itemMatch && itemMatch[1].trim() && !itemMatch[1].includes('...')) {
        restrictedFiles.push(itemMatch[1].trim());
      }
    }
  }

  // 4. Extract Atomic Tasks from Section 5
  const tasksSectionMatch = content.match(/## 5\.\s*Rencana Eksekusi Atomik[\s\S]*?(?=\n## 6\.|\n---\s*\n## 6\.|$)/i);
  const tasksContent = tasksSectionMatch ? tasksSectionMatch[0] : '';

  const taskRegex = /[-*]\s*\[([ xX])\]\s*\*\*Task\s*(\d+)[:.]\s*([^*]+)\*\*([\s\S]*?)(?=(?:[-*]\s*\[[ xX]\]\s*\*\*Task\s*\d+[:.]|$))/gi;
  const tasks: SDDTask[] = [];

  let match: RegExpExecArray | null;
  while ((match = taskRegex.exec(tasksContent)) !== null) {
    const completed = match[1].toLowerCase() === 'x';
    const taskNum = parseInt(match[2], 10);
    const taskTitle = match[3].trim();
    const taskBody = match[4].trim();

    // Extract Persona
    const personaMatch = taskBody.match(/\*\*Fokus Persona:\*\*\s*([^\n]+)/i);
    const persona = personaMatch ? personaMatch[1].trim() : '@General';

    // Extract Action
    const actionMatch = taskBody.match(/\*\*Aksi:\*\*\s*([^\n]+)/i);
    const action = actionMatch ? actionMatch[1].trim() : '';

    // Extract Verification
    const verifMatch = taskBody.match(/\*\*Verifikasi Task:\*\*\s*([^\n]+)/i);
    const verification = verifMatch ? verifMatch[1].trim() : '';

    tasks.push({
      taskNum,
      title: taskTitle,
      persona,
      action,
      verification,
      completed,
      rawContent: taskBody,
    });
  }

  return {
    filePath,
    id,
    title,
    status,
    branch,
    allowedFiles,
    restrictedFiles,
    tasks,
  };
}

/**
 * Generates an isolated, self-contained Markdown brief for a single task.
 */
export function generateTaskBriefContent(meta: ParsedMetaPrompt, taskNum: number): string {
  const task = meta.tasks.find((t) => t.taskNum === taskNum);
  if (!task) {
    throw new Error(`[sporepo-sdd] Task #${taskNum} tidak ditemukan dalam Meta-Prompt [${meta.id}].`);
  }

  const allowedList = meta.allowedFiles.length > 0
    ? meta.allowedFiles.map((f) => `- \`${f}\``).join('\n')
    : '- *(Lihat deskripsi aksi di bawah)*';

  const restrictedList = meta.restrictedFiles.length > 0
    ? meta.restrictedFiles.map((f) => `- \`${f}\``).join('\n')
    : '- `package.json` runtime dependencies (Zero-Dependency Rule)';

  return `# TASK BRIEF: Task ${task.taskNum} - ${task.title}

> **Parent Request:** [${meta.id}] ${meta.title}  
> **Source Meta-Prompt:** \`${meta.filePath}\`  
> **Assigned Persona:** ${task.persona}  
> **Execution Mode:** Isolated Implementer Subagent  

---

## 1. Lingkup & Batas Kepemilikan (*Touch Boundaries*)
- **Berkas yang Diizinkan Disentuh (*Allowed Files*):**
${allowedList}
- **Berkas yang DILARANG Disentuh (*Restricted Files*):**
${restrictedList}

---

## 2. Instruksi Aksi Spesifik (*Specific Action*)
${task.action ? `> **Aksi Utama:** ${task.action}\n` : ''}
${task.rawContent}

---

## 3. Kriteria Verifikasi Tugas (*Task Verification Criteria*)
- **Perintah Verifikasi:** \`${task.verification || 'npm test'}\`
- **Syarat Lolos:** Seluruh automated test harus lulus 100% dengan exit code 0.
- **Higienitas:** Bebas lint/type errors dan tidak menyisakan file sementara di root direktori.

---

## 4. Instruksi Pelaporan (*Reporting Contract*)
Tulis laporan terstruktur ke berkas laporan implementer yang ditentukan koordinator, kemudian kembalikan ringkasan status \`DONE\` beserta commit hash.
`;
}

/**
 * Creates a git diff review package file between baseCommit and headCommit.
 */
export function createReviewPackage(
  baseCommit: string,
  headCommit: string = 'HEAD',
  outputPath: string
): { commitCount: number; filesChanged: number; outputPath: string } {
  ensureDir(path.dirname(outputPath));

  // 1. Commit list
  let logOutput = '';
  try {
    logOutput = execFileSync('git', ['log', '--oneline', `${baseCommit}..${headCommit}`], { encoding: 'utf-8' });
  } catch (err: any) {
    logOutput = `(Gagal membaca log git: ${err.message})`;
  }

  // 2. Diff stat
  let statOutput = '';
  try {
    statOutput = execFileSync('git', ['diff', '--stat', `${baseCommit}..${headCommit}`], { encoding: 'utf-8' });
  } catch (err: any) {
    statOutput = `(Gagal membaca stat git: ${err.message})`;
  }

  // 3. Unified diff (-U10)
  let diffOutput = '';
  try {
    diffOutput = execFileSync('git', ['diff', '-U10', `${baseCommit}..${headCommit}`], { encoding: 'utf-8' });
  } catch (err: any) {
    diffOutput = `(Gagal membaca diff git: ${err.message})`;
  }

  const commitCount = logOutput.trim() ? logOutput.trim().split('\n').length : 0;
  const filesChanged = (statOutput.match(/\|/g) || []).length;

  const packageContent = `# Review Package: ${baseCommit.substring(0, 7)}..${headCommit.substring(0, 7)}

## 1. Commit Log (${commitCount} commits)
\`\`\`text
${logOutput.trim() || '(No commits)'}
\`\`\`

## 2. Diff Summary
\`\`\`text
${statOutput.trim() || '(No changes)'}
\`\`\`

## 3. Unified Diff (-U10 Context)
\`\`\`diff
${diffOutput.trim() || '(Empty diff)'}
\`\`\`
`;

  fs.writeFileSync(outputPath, packageContent, 'utf-8');
  return { commitCount, filesChanged, outputPath };
}
