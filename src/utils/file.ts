import * as fs from 'fs';
import * as path from 'path';

export interface SporepoPaths {
  targetDir: string;
  baseDir: string;
  reqsDir: string;
  bugsDir: string;
  archiveDir: string;
  archiveReqsDir: string;
  archiveBugsDir: string;
  legacyPromptsDir: string;
  legacyBugsDir: string;
  rulePath: string;
}

/**
 * Returns the standardized paths for sporepo directories in a target repository.
 */
export function getSporepoPaths(targetDir: string = process.cwd()): SporepoPaths {
  const resolvedTarget = path.resolve(process.cwd(), targetDir);
  const baseDir = path.join(resolvedTarget, 'docs', 'sporepo');
  const archiveDir = path.join(baseDir, 'archive');

  return {
    targetDir: resolvedTarget,
    baseDir,
    reqsDir: path.join(baseDir, 'reqs'),
    bugsDir: path.join(baseDir, 'bugs'),
    archiveDir,
    archiveReqsDir: path.join(archiveDir, 'reqs'),
    archiveBugsDir: path.join(archiveDir, 'bugs'),
    legacyPromptsDir: path.join(resolvedTarget, 'prompts', 'request'),
    legacyBugsDir: path.join(resolvedTarget, 'tests', 'bugs'),
    rulePath: path.join(resolvedTarget, '.sporepo', 'rule.md'),
  };
}

/**
 * Normalizes any title string into a URL-friendly, filesystem-safe kebab-case slug.
 */
export function slugify(text: string): string {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9]+/g, '-')     // replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '');        // trim leading/trailing hyphens

  return normalized || 'item';
}

/**
 * Returns today's date formatted as YYYY-MM-DD (local time).
 */
export function formatDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Ensures that a directory exists recursively.
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Checks if a file exists.
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Scans directories for request markdown files (e.g. 001-*.md) and calculates the next sequence number.
 * Scans both active and archived request directories so numbers never reset.
 */
export function getNextRequestNumber(dirPath: string, extraDirs: string[] = []): { num: number; formatted: string } {
  const dirsToScan = [dirPath, ...extraDirs].filter((d) => d && fs.existsSync(d));
  let maxNum = 0;

  for (const d of dirsToScan) {
    const files = fs.readdirSync(d);
    for (const file of files) {
      const match = file.match(/^(\d{1,})-.*\.md$/i);
      if (match) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed > maxNum) {
          maxNum = parsed;
        }
      }
    }
  }

  const nextNum = maxNum + 1;
  const formatted = String(nextNum).padStart(3, '0');
  return { num: nextNum, formatted };
}

/**
 * Resolves the directory where templates are located.
 * Supports running from source (`src/`), build output (`dist/src/utils/` or `dist/`), and global package installation.
 */
export function findTemplatesDir(): string {
  const candidates = [
    path.resolve(__dirname, '../../templates'),
    path.resolve(__dirname, '../templates'),
    path.resolve(__dirname, '../../../templates'),
    path.resolve(process.cwd(), 'templates'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, 'meta-prompt.md'))) {
      return candidate;
    }
  }

  throw new Error(`[sporepo] Cannot find templates directory. Searched in: ${candidates.join(', ')}`);
}

/**
 * Reads a template file by name.
 */
export function readTemplate(templateName: string): string {
  const templatesDir = findTemplatesDir();
  const fullPath = path.join(templatesDir, templateName);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`[sporepo] Template not found: ${fullPath}`);
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

/**
 * Simple key-value template interpolation: replaces `{{KEY}}` with provided value.
 */
export function renderTemplate(templateContent: string, vars: Record<string, string>): string {
  let result = templateContent;
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

/**
 * Generates an uncollided bug report file path in the target directory.
 * If YYYY-MM-DD-slug.md already exists, tries YYYY-MM-DD-slug-2.md, etc.
 */
export function getUniqueBugFilePath(dirPath: string, dateStr: string, slug: string): string {
  const baseName = `${dateStr}-${slug}`;
  let candidate = path.join(dirPath, `${baseName}.md`);
  if (!fs.existsSync(candidate)) {
    return candidate;
  }

  let counter = 2;
  while (fs.existsSync(path.join(dirPath, `${baseName}-${counter}.md`))) {
    counter++;
  }
  return path.join(dirPath, `${baseName}-${counter}.md`);
}
