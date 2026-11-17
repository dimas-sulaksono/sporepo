import { initCommand } from './commands/init';
import { reqCommand } from './commands/req';
import { bugCommand } from './commands/bug';
import { auditCommand } from './commands/audit';
import { archiveCommand } from './commands/archive';
import { migrateCommand } from './commands/migrate';
import { sddBriefCommand, sddInitCommand, sddPackCommand, sddParseCommand } from './commands/sdd';

const VERSION = '1.1.0';

export function printHelp(): void {
  console.log(`
\x1b[1m\x1b[36msporepo\x1b[0m \x1b[33mv${VERSION}\x1b[0m - AI-Assisted Software Engineering Framework
(Hybrid of Context-Rich Meta-Prompting & Superpowers Discipline)

\x1b[1mPENGGUNAAN:\x1b[0m
  $ npx sporepo <command> [arguments] [options]
  $ sporepo <command> [arguments] [options]

\x1b[1mPERINTAH UTAMA:\x1b[0m
  \x1b[32minit\x1b[0m    [target-dir]       Inisialisasi struktur docs/sporepo/ (reqs, bugs, archive) & .sporepo/
  \x1b[32mreq\x1b[0m     <"Nama Fitur">     Buat Meta-Prompt fitur baru dengan auto-increment 3 digit (001, 002...)
  \x1b[32mbug\x1b[0m     <"Nama Bug">       Buat laporan investigasi bug dengan ground-truth cURL & TDD plan
  \x1b[32marchive\x1b[0m <id | -a>          Arsipkan berkas yang selesai ke docs/sporepo/archive/
  \x1b[32mmigrate\x1b[0m [target-dir]       Migrasi struktur lama (prompts/ & tests/bugs/) ke docs/sporepo/
  \x1b[32msdd\x1b[0m     <subcommand>       Orkestrasi Subagent-Driven Development (init, brief, pack, parse)
  \x1b[32maudit\x1b[0m   [target-dir]       Audit kepatuhan repositori terhadap standar rekayasa sporepo

\x1b[1mOPSI:\x1b[0m
  -a, --all-verified        Arsipkan seluruh berkas yang berstatus VERIFIED
  -f, --force               Timpa berkas yang sudah ada saat inisialisasi
  -d, --dir <path>          Tentukan target direktori proyek
  -v, --version             Tampilkan versi sporepo
  -h, --help                Tampilkan bantuan ini

\x1b[1mCONTOH:\x1b[0m
  $ npx sporepo init
  $ npx sporepo req "Autentikasi JWT & Refresh Token"
  $ npx sporepo bug "Auth 401 Gagal pada Endpoint Checkout"
  $ npx sporepo archive 001
  $ npx sporepo archive --all-verified
  $ npx sporepo migrate
  $ npx sporepo audit
`);
}

export function printVersion(): void {
  console.log(`sporepo v${VERSION}`);
}

export function run(argv: string[] = process.argv.slice(2)): void {
  if (argv.length === 0 || argv[0] === '-h' || argv[0] === '--help' || argv[0] === 'help') {
    printHelp();
    return;
  }

  if (argv.includes('-v') || argv.includes('--version') || argv[0] === 'version') {
    printVersion();
    return;
  }

  const command = argv[0].toLowerCase();
  const restArgs = argv.slice(1);

  try {
    switch (command) {
      case 'init': {
        const force = restArgs.includes('--force') || restArgs.includes('-f');
        const dirArg = restArgs.find((a) => !a.startsWith('-'));
        initCommand(dirArg, { force });
        break;
      }

      case 'req':
      case 'request': {
        const dirIdx = restArgs.findIndex((a) => a === '--dir' || a === '-d');
        let targetDir: string | undefined;
        let filteredArgs = restArgs;

        if (dirIdx !== -1 && restArgs[dirIdx + 1]) {
          targetDir = restArgs[dirIdx + 1];
          filteredArgs = restArgs.filter((_, idx) => idx !== dirIdx && idx !== dirIdx + 1);
        }

        const titleArgs = filteredArgs.filter((a) => !a.startsWith('-'));
        const title = titleArgs.join(' ');
        if (!title) {
          console.error('\x1b[31m[sporepo] Error: Judul fitur wajib diisi.\x1b[0m');
          console.error('Contoh: npx sporepo req "Payment Gateway OVO"\n');
          process.exit(1);
        }
        reqCommand(title, { targetDir });
        break;
      }

      case 'bug': {
        const dirIdx = restArgs.findIndex((a) => a === '--dir' || a === '-d');
        let targetDir: string | undefined;
        let filteredArgs = restArgs;

        if (dirIdx !== -1 && restArgs[dirIdx + 1]) {
          targetDir = restArgs[dirIdx + 1];
          filteredArgs = restArgs.filter((_, idx) => idx !== dirIdx && idx !== dirIdx + 1);
        }

        const titleArgs = filteredArgs.filter((a) => !a.startsWith('-'));
        const title = titleArgs.join(' ');
        if (!title) {
          console.error('\x1b[31m[sporepo] Error: Judul/temuan bug wajib diisi.\x1b[0m');
          console.error('Contoh: npx sporepo bug "Login Timeout 504 Gateway"\n');
          process.exit(1);
        }
        bugCommand(title, { targetDir });
        break;
      }

      case 'archive': {
        const allVerified = restArgs.includes('--all-verified') || restArgs.includes('-a');
        const dirIdx = restArgs.findIndex((a) => a === '--dir' || a === '-d');
        let targetDir: string | undefined;
        let filteredArgs = restArgs;

        if (dirIdx !== -1 && restArgs[dirIdx + 1]) {
          targetDir = restArgs[dirIdx + 1];
          filteredArgs = restArgs.filter((_, idx) => idx !== dirIdx && idx !== dirIdx + 1);
        }

        const idArg = filteredArgs.find((a) => !a.startsWith('-'));
        archiveCommand(idArg, { allVerified, targetDir });
        break;
      }

      case 'migrate': {
        const dirArg = restArgs.find((a) => !a.startsWith('-'));
        migrateCommand(dirArg);
        break;
      }

      case 'sdd': {
        const sub = restArgs[0]?.toLowerCase();
        const subArgs = restArgs.slice(1);

        if (!sub || sub === '--help' || sub === '-h' || sub === 'help') {
          console.log(`
\x1b[1m\x1b[36msporepo sdd\x1b[0m - Subagent-Driven Development Orchestration Helper

\x1b[1mPENGGUNAAN:\x1b[0m
  $ npx sporepo sdd init  <meta-prompt-path>
  $ npx sporepo sdd brief <meta-prompt-path> <task-number> [--out <output>]
  $ npx sporepo sdd pack  <base-commit> [head-commit] [--out <output>]
  $ npx sporepo sdd parse <meta-prompt-path>

\x1b[1mSUBPERINTAH:\x1b[0m
  \x1b[32minit\x1b[0m  <file>             Inisiasi ledger pelacak SDD di .scratch/sdd/<id>/ledger.md
  \x1b[32mbrief\x1b[0m <file> <task-num>   Ekstrak instruksi brief terisolasi untuk Implementer Subagent
  \x1b[32mpack\x1b[0m  <base> [head]      Buat paket diff Git terstruktur untuk Task Reviewer Subagent
  \x1b[32mparse\x1b[0m <file>             Tampilkan ringkasan tugas atomik dan batasan file
`);
          break;
        }

        switch (sub) {
          case 'init': {
            const metaPath = subArgs.find((a) => !a.startsWith('-'));
            if (!metaPath) {
              console.error('\x1b[31m[sporepo sdd] Error: Path berkas Meta-Prompt wajib disertakan.\x1b[0m');
              process.exit(1);
            }
            sddInitCommand(metaPath);
            break;
          }
          case 'brief': {
            const outIdx = subArgs.findIndex((a) => a === '--out' || a === '-o');
            let outPath: string | undefined;
            let cleanArgs = subArgs;
            if (outIdx !== -1 && subArgs[outIdx + 1]) {
              outPath = subArgs[outIdx + 1];
              cleanArgs = subArgs.filter((_, idx) => idx !== outIdx && idx !== outIdx + 1);
            }
            const nonFlagArgs = cleanArgs.filter((a) => !a.startsWith('-'));
            const metaPath = nonFlagArgs[0];
            const taskNum = nonFlagArgs[1];
            if (!metaPath || !taskNum) {
              console.error('\x1b[31m[sporepo sdd] Error: Path berkas Meta-Prompt dan nomor task wajib diisi.\x1b[0m');
              console.error('Contoh: npx sporepo sdd brief docs/sporepo/reqs/003-nama-fitur.md 1');
              process.exit(1);
            }
            sddBriefCommand(metaPath, taskNum, { out: outPath });
            break;
          }
          case 'pack': {
            const outIdx = subArgs.findIndex((a) => a === '--out' || a === '-o');
            let outPath: string | undefined;
            let cleanArgs = subArgs;
            if (outIdx !== -1 && subArgs[outIdx + 1]) {
              outPath = subArgs[outIdx + 1];
              cleanArgs = subArgs.filter((_, idx) => idx !== outIdx && idx !== outIdx + 1);
            }
            const nonFlagArgs = cleanArgs.filter((a) => !a.startsWith('-'));
            const base = nonFlagArgs[0];
            const head = nonFlagArgs[1] || 'HEAD';
            if (!base) {
              console.error('\x1b[31m[sporepo sdd] Error: Base commit hash wajib disertakan.\x1b[0m');
              console.error('Contoh: npx sporepo sdd pack <base-commit> [head-commit]');
              process.exit(1);
            }
            sddPackCommand(base, head, { out: outPath });
            break;
          }
          case 'parse': {
            const metaPath = subArgs.find((a) => !a.startsWith('-'));
            if (!metaPath) {
              console.error('\x1b[31m[sporepo sdd] Error: Path berkas Meta-Prompt wajib disertakan.\x1b[0m');
              process.exit(1);
            }
            sddParseCommand(metaPath);
            break;
          }
          default: {
            console.error(`\x1b[31m[sporepo sdd] Subperintah tidak dikenal: "${sub}"\x1b[0m`);
            process.exit(1);
          }
        }
        break;
      }

      case 'audit':
      case 'status': {
        const dirArg = restArgs.find((a) => !a.startsWith('-'));
        auditCommand(dirArg);
        break;
      }

      default: {
        console.error(`\x1b[31m[sporepo] Perintah tidak dikenal: "${command}"\x1b[0m`);
        printHelp();
        process.exit(1);
      }
    }
  } catch (err: any) {
    console.error(`\x1b[31m[sporepo] Error: ${err.message || err}\x1b[0m`);
    process.exit(1);
  }
}
