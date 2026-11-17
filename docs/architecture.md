# Arsitektur Teknis Framework sporepo

Dokumen ini mendokumentasikan spesifikasi arsitektur internal, prinsip desain, pembagian modul, serta integrasi sistem pada framework **sporepo v1.0.0**.

---

## 1. Konteks & Problem Statement

Pembangunan aplikasi dengan bantuan AI agent sering kali menghadapi dua masalah utama:
1. **Kehilangan Konteks & Scope Creep:** Agent langsung menulis kode tanpa memahami batasan file ownership, dependensi, atau implikasi arsitektur.
2. **Symptom Patching & Kurangnya Pembuktian:** Agent memperbaiki bug berdasarkan tebakan (guesswork) tanpa mencari akar masalah atau menulis automated test terlebih dahulu.

**sporepo** menyelesaikan masalah tersebut dengan memadukan dua paradigma:
- **Context-Rich Meta-Prompting:** Penugasan berbasis multi-persona (@Architect, @Backend, @Frontend, @QA) dengan batas kepemilikan file tegas dan Reviewer Gatekeeper barrier.
- **Superpowers Discipline:** Investigasi akar masalah (The Iron Law), penulisan failing test terlebih dahulu (TDD Red-Green-Refactor), dan verifikasi terminal wajib sebelum pekerjaan dianggap selesai.

---

## 2. Struktur Modul & Dependensi

Proyek ini dibangun menggunakan TypeScript dengan target runtime Node.js >= 18.0.0 tanpa runtime dependency eksternal (**Zero-Dependency Core**).

### A. Dependensi Sistem
- **Runtime:** Node.js (modul standar: `fs`, `path`, `child_process`, `crypto`).
- **Dependencies (`package.json`):** 0 runtime dependencies (`dependencies: {}`).
- **DevDependencies (`package.json`):** `typescript` (^5.7.2), `@types/node` (^22.10.1).
- **Test Runner:** Node.js native test runner (`node:test`, `node:assert/strict`).

### B. Diagram Alur Modul

```
[CLI Invocation: npx sporepo / node bin/sporepo.js]
                        │
                        ▼
                 [bin/sporepo.js]
       (Executable Shebang + Dist Resolver)
                        │
                        ▼
                 [src/cli.ts]
      (Argument Parser & Subcommand Router)
       ┌───────────┬───────────┬───────────┐
       ▼           ▼           ▼           ▼
  [init.ts]    [req.ts]    [bug.ts]    [audit.ts]
       │           │           │           │
       └───────────┴─────┬─────┴───────────┘
                         ▼
                 [src/utils/file.ts]
  (Template Engine, Path Resolver, Slugifier, Safe I/O)
                         │
                         ▼
                [templates/*.md]
  (Meta-Prompt, Bug Report, Local Rule, README guides)
```

### C. Deskripsi Tanggung Jawab Modul

| Modul | Path | Tanggung Jawab Utama |
| :--- | :--- | :--- |
| **Executable Entrypoint** | `bin/sporepo.js` | Entrypoint CLI berizin eksekusi (`chmod +x`), mendeteksi runtime `dist/src/cli.js` atau `dist/cli.js`, dan meneruskan `process.argv`. |
| **Command Router** | `src/cli.ts` | Parsing argumen CLI murni tanpa library pihak ketiga, menangani flag `--help`, `--version`, `--dir`, `--force`, dan routing ke handler perintah. |
| **Init Handler** | `src/commands/init.ts` | Menginisiasi fondasi folder `prompts/request/`, `tests/bugs/`, menyematkan `.sporepo/rule.md`, serta README panduan. |
| **Request Handler** | `src/commands/req.ts` | Menghitung nomor urut tertinggi, memformat sequence 3-digit (`001`, `002`), men-slugify judul, dan merender template meta-prompt. |
| **Bug Handler** | `src/commands/bug.ts` | Menentukan tanggal ISO `YYYY-MM-DD`, mencegah tabrakan nama file dengan counter otomatis (`-2.md`), dan merender template laporan bug. |
| **Audit Handler** | `src/commands/audit.ts` | Mengaudit repositori target: memeriksa kelengkapan folder, status review gatekeeper fitur, kelengkapan cURL pada bug, dan menghitung skor kepatuhan (0 - 100). |
| **File Utilities** | `src/utils/file.ts` | Helper murni untuk sanitasi slug, auto-increment numbering, penanganan template, traversal direktori aman, dan resolusi path multi-lingkungan. |

---

## 3. Template Engine & Standar Format

Sistem template sporepo menggunakan interpolasi variabel deterministik:
- `templates/meta-prompt.md`: Menyediakan template spesifikasi fitur lengkap dengan 6 persona, batasan kepemilikan file, dan gerbang Reviewer Gatekeeper.
- `templates/bug-report.md`: Menyediakan template pelaporan bug dengan metadata lingkungan, cURL ground-truth, payload JSON aktual, dan 4 fase Systematic Debugging.
- `templates/sporepo-rule.md`: Template aturan kerja AI Agent yang disematkan ke `.sporepo/rule.md` pada repositori klien.

Variabel template yang didukung:
- `{{ID}}`: Nomor urut 3 digit (contoh: `001`, `002`).
- `{{TITLE}}`: Judul fitur atau deskripsi bug asli.
- `{{DATE}}`: Tanggal pembuatan format `YYYY-MM-DD` (waktu lokal).
- `{{SLUG}}`: String judul yang disanitasi menjadi kebab-case aman.

---

## 4. Mekanisme Keamanan & Integritas File

1. **Path Traversal Protection:**
   Fungsi resolusi path pada `src/utils/file.ts` menggunakan `path.resolve()` terhadap root yang ditentukan sehingga mencegah injeksi path keluar direktori target secara tidak sengaja.
2. **Collision-Safe Bug File Naming:**
   Jika file `tests/bugs/YYYY-MM-DD-slug.md` sudah ada, sistem tidak akan menimpa file tersebut, melainkan membuat file berikutnya: `tests/bugs/YYYY-MM-DD-slug-2.md`.
3. **Idempotent Initialization:**
   Perintah `init` tidak akan menimpa file README atau konfigurasi yang telah dimodifikasi pengguna kecuali flag `--force` (`-f`) disertakan secara eksplisit.
