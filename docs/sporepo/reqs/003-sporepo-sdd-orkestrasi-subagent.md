# META-PROMPT: [003] sporepo-sdd: Orkestrasi Subagent Mandiri (Adapted from Superpowers SDD)

> **Request ID:** 003  
> **Date:** 2026-11-17  
> **Status:** `VERIFIED` <!-- Options: DRAFT | REVIEW_PENDING | APPROVED | IN_PROGRESS | VERIFIED -->  
> **Branch / Target:** `feat/sporepo-sdd`  
> **Target Scope:** Framework Orkestrasi Subagent Mandiri (`sporepo-sdd`), CLI Helper, dan Template Dispatch  

---

## 1. Konteks Bisnis & Tujuan Fitur (*Problem & Goal*)

### A. Latar Belakang Masalah (*Problem Statement*)
Pada framework `sporepo v1.0.0`, alur fitur telah memiliki template Meta-Prompt multi-persona dan Reviewer Gatekeeper Barrier. Namun, pada fase pelaksanaan:
1. **Context Pollution & Amnesia:** Jika seluruh task dikerjakan dalam satu sesi konteks agen induk yang panjang, akumulasi log dan kode menyebabkan pembengkakan token, amnesia pasca-kompaksi, dan agen kehilangan jejak tugas yang sudah selesai (*re-dispatching completed tasks*).
2. **Ketiadaan Dual-Verification Per Task:** Implementer sering kali mengklaim pekerjaannya selesai tanpa pemeriksaan kepatuhan spesifikasi (*spec compliance*) dan kualitas kode (*code quality*) oleh agen peninjau terpisah.
3. **Stalls pada Keraguan Sepele:** Agen sering kali berhenti untuk bertanya hal-hal minor ke pengguna di tengah pengerjaan, alih-alih membuat keputusan (*ruling*) yang tercatat di ledger.
4. **Ketergantungan Eksternal:** Repositori target masih bergantung pada plugin eksternal `obra/superpowers` jika ingin menjalankan orkestrasi subagent berstandar tinggi.

### B. Tujuan Utama (*Goal*)
Membangun modul dan skill mandiri **`sporepo-sdd`** yang mengadaptasi prinsip terbaik dari `superpowers/skills/subagent-driven-development/SKILL.md` dengan penyesuaian khas SPOREPO:
1. **Coordinator-Driven Execution:** Agen induk murni bertindak sebagai koordinator orkestrasi (tidak menulis kode implementasi secara langsung).
2. **Fresh Subagent Per Task:** Setiap task pada Meta-Prompt memicu subagent implementer baru dengan konteks bersih (*zero context pollution*).
3. **Dual Review Gate Per Task:** Peninjauan oleh Task Reviewer subagent mencakup *Spec Compliance* (apakah memenuhi kriteria Meta-Prompt) dan *Code Quality* (kebersihan, test hygiene, YAGNI).
4. **Structured Fix-Loop & Breaker:** Siklus perbaikan maksimal 3 putaran terarah sebelum eskalasi.
5. **Ledger-Based Anti-Amnesia:** Mencatat progress dan commit range di berkas ledger lokal (`.scratch/sdd/<id>/ledger.md`) sehingga tahan dari pembersihan memori atau konteks restart.
6. **Zero-Dependency CLI Integration:** Menyediakan perintah pembantu `npx sporepo sdd` untuk mengekstrak task brief dan memaketkan git diff tanpa dependensi bash luar.

### C. Kriteria Keberhasilan (*Success Metrics*)
- 100% Zero runtime dependencies (tetap modul standar Node.js).
- Terbitnya skill mandiri `skills/sporepo-sdd/SKILL.md` (dan terpasang di `~/.gemini/config/skills/sporepo-sdd/SKILL.md`).
- Terbitnya template pendukung: `templates/sdd/implementer-prompt.md`, `templates/sdd/task-reviewer-prompt.md`, `templates/sdd/final-reviewer-prompt.md`.
- Fitur CLI `sporepo sdd` (subcommand: `brief`, `review-pack`, `status`) berjalan mulus lintas OS (macOS, Linux, Windows).
- 100% test passing pada unit & integration tests baru.

---

## 2. Matriks Persona & Pembagian Tanggung Jawab (*Multi-Persona Assignment*)

| Persona | Tanggung Jawab Spesifik | Batas Kepemilikan File (*File Ownership*) |
| :--- | :--- | :--- |
| **@Architect** | Desain protokol koordinator, kontrak brief/report, dan integrasi dengan Meta-Prompt | `docs/`, `skills/sporepo-sdd/SKILL.md` |
| **@Backend** | Implementasi parser Meta-Prompt, command `src/commands/sdd.ts`, helper git diff | `src/commands/sdd.ts`, `src/utils/sdd-*.ts`, `src/cli.ts` |
| **@PromptEngineer** | Penyusunan template implementer, reviewer, final review, dan fix-loop | `templates/sdd/*.md` |
| **@QA** | Pengujian unit parser brief, formatting diff, simulasi ledger, dan edge-case | `tests/sdd.test.ts` |

---

## 3. Batas Kepemilikan Berkas (*File Ownership & Touch Boundaries*)

- **Berkas yang Boleh Dibuat / Dimodifikasi (*Allowed Files*):**
  - `src/commands/sdd.ts` (Handler perintah CLI `sporepo sdd`)
  - `src/utils/sdd-parser.ts` (Ekstraksi task dari markdown Meta-Prompt)
  - `src/cli.ts` (Pendaftaran subcommand `sdd`)
  - `templates/sdd/implementer-prompt.md`
  - `templates/sdd/task-reviewer-prompt.md`
  - `templates/sdd/final-reviewer-prompt.md`
  - `skills/sporepo-sdd/SKILL.md`
  - `docs/sdd-orchestration.md`
  - `tests/sdd.test.ts`
  - `README.md`, `package.json`
- **Berkas yang DILARANG Disentuh / Diubah (*Restricted / Read-Only Files*):**
  - `package.json` runtime dependencies (WAJIB tetap `{}` / Zero-Dependency).
  - Format dasar `templates/meta-prompt.md` v1.0.0 (hanya boleh diperluas secara backward-compatible).

---

## 4. INDEPENDENT REVIEWER GATEKEEPER (STRICT BARRIER) ⛔

> [!CAUTION]
> **MANDAT STOP MUTLAK BAGI AI AGENT:**
> Agen **DILARANG KERAS** menyentuh atau menulis kode implementasi sebelum fase audit ini selesai dan disetujui pengguna!

### A. Audit Celah Spesifikasi & Edge Cases
1. **Dukungan Lingkungan Eksekusi (Tool Availability):**
   - *Kondisi:* Di Antigravity, kita memiliki tool `invoke_subagent`. Namun di harness lain atau saat tool subagent dinonaktifkan, bagaimana SDD dijalankan?
   - *Solusi:* `sporepo-sdd` harus mendukung 2 mode:
     - **Mode Subagent (Native):** Memanggil `invoke_subagent` per task.
     - **Mode Inline Fallback:** Koordinator mengeksekusi task satu per satu secara atomik dengan me-reset konteks memori manual jika subagent tool tidak tersedia.
2. **Pencegahan Injeksi & Parsing Markdown Fleksibel:**
   - Format `## 5. Rencana Eksekusi Atomik` pada Meta-Prompt dapat ditulis dengan checkbox `- [ ] Task 1:` atau format angka. Parser `sdd-parser.ts` harus tangguh mengenali berbagai variasi penulisan task.
3. **Penyimpanan Ledger & Workspace Hygiene:**
   - Ledger disimpan di `.scratch/sdd/<request-id>/ledger.md`. Karena folder `.scratch/` sudah terdaftar di `.gitignore`, ini menjamin kebersihan root tanpa mengotori commit git.
4. **Strategi Pemilihan Model (Model Selection):**
   - Mengadopsi prinsip Superpowers: Gunakan model hemat untuk implementasi mekanikal 1-2 file, model standar untuk integrasi, dan model terbaik untuk review arsitektural & final review.

### B. Daftar Pertanyaan Keputusan untuk Pengguna (*Simultaneous Decision Round*)
- [x] **Pertanyaan 1 (Scope Integrasi CLI):**  
  Apakah Anda setuju jika fitur SDD ini dilengkapi perintah CLI bawaan:  
  `npx sporepo sdd brief <request-file> <task-number>` (untuk mengekstrak brief tugas ke file mandiri) dan  
  `npx sporepo sdd pack <base-commit> <head-commit>` (untuk memaketkan diff review tanpa skrip bash eksternal)?
  - **Keputusan Pengguna:** Disetujui (CLI bawaan `sporepo sdd` akan dibuat).
- [x] **Pertanyaan 2 (Nama & Penempatan Skill):**  
  Apakah modul ini dipasang sebagai **Global Skill Mandiri terpisah** bernama `sporepo-sdd` (`~/.gemini/config/skills/sporepo-sdd/SKILL.md`) yang dapat dipanggil via trigger `/sporepo-sdd` atau kata kunci *"jalankan SDD"*, sambil tetap direferensikan di dalam skill utama `sporepo`?
  - **Keputusan Pengguna:** Disetujui (dibuat sebagai Global Skill mandiri terpisah `sporepo-sdd`).

### C. Konfirmasi Persetujuan Pengguna (*User Sign-Off*)
- [x] **Status:** Disetujui oleh pengguna untuk mulai koding (`APPROVED`)
- **Catatan Persetujuan Pengguna:** Pengguna mengonfirmasi persetujuan penuh untuk CLI bawaan `sporepo sdd` dan Global Skill mandiri `sporepo-sdd`.

---

## 5. Rencana Eksekusi Atomik (*Subagent-Driven Development / SDD*)

- [x] **Task 1: Template Dispatch & Review Subagent**
  - **Fokus Persona:** `@PromptEngineer` / `@Architect`
  - **Aksi:** Buat template `templates/sdd/implementer-prompt.md`, `templates/sdd/task-reviewer-prompt.md`, dan `templates/sdd/final-reviewer-prompt.md` dengan isolasi context dan format report terstandar.
  - **Verifikasi Task:** File template terstruktur rapi dan tervalidasi.
- [x] **Task 2: Parser Meta-Prompt & CLI Helper `sporepo sdd`**
  - **Fokus Persona:** `@Backend`
  - **Aksi:** Buat `src/utils/sdd-parser.ts` untuk mem-parsing daftar task dari Meta-Prompt, dan `src/commands/sdd.ts` untuk subperintah `brief` dan `pack`.
  - **Verifikasi Task:** `npm run build && node bin/sporepo.js sdd --help` berjalan normal.
- [x] **Task 3: Pembuatan Global Skill `sporepo-sdd`**
  - **Fokus Persona:** `@Architect`
  - **Aksi:** Buat `skills/sporepo-sdd/SKILL.md` (dan pasang di `~/.gemini/config/skills/sporepo-sdd/SKILL.md`) berisi panduan orkestrasi lengkap: Coordinator protocol, Implementer dispatch, Review loop, Ledger tracking, dan Final review.
  - **Verifikasi Task:** Skill terdaftar dan valid di sistem konfigurasi Gemini/Antigravity.
- [x] **Task 4: Automated Test Suite & Edge-Cases**
  - **Fokus Persona:** `@QA`
  - **Aksi:** Buat `tests/sdd.test.ts` untuk menguji parsing task, handling gap numbering, pembuatan package review, dan zero-dependency verification.
  - **Verifikasi Task:** `npm test` lulus 100%.
- [x] **Task 5: Dokumentasi Arsitektur & Panduan Operasional**
  - **Fokus Persona:** `@Architect`
  - **Aksi:** Buat `docs/sdd-orchestration.md` dan perbarui `README.md` serta `docs/README.md`.
  - **Verifikasi Task:** Verifikasi tautan dokumentasi valid.

---

## 6. Protokol Verifikasi Akhir (*Verification Before Completion*)

### A. Terminal Command Verification
```bash
# 1. Kompilasi TypeScript
npm run build

# 2. Eksekusi Test Suite Penuh
npm test

# 3. Uji Simulasi Ekstraksi Brief & Diff Packaging
node bin/sporepo.js sdd brief docs/sporepo/reqs/003-sporepo-sdd-orkestrasi-subagent.md 1
node bin/sporepo.js sdd --help
```

### B. Bukti Output Terminal (*Terminal Output Proof*)
```text
✔ sporepo - Unit & Integration Test Suite (195.48ms)
✔ SPOREPO - Advanced QA & Security Edge-Cases (122.62ms)
✔ sporepo-sdd - Subagent-Driven Development Test Suite (138.79ms)
ℹ tests 35
ℹ suites 15
ℹ pass 35
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 236.48ms
```

### C. Pembaruan Dokumentasi
- [x] `docs/sdd-orchestration.md` telah dibuat.
- [x] `README.md` dan `notes.md` telah disinkronkan.
