# META-PROMPT: [002] Pembaruan Manajemen Workspace docs/sporepo & Siklus Arsip

> **Request ID:** 002  
> **Date:** 2026-11-17  
> **Status:** `VERIFIED` <!-- Selesai & Terverifikasi Terminal -->  
> **Archived At:** 2026-11-17
> **Branch / Target:** `main`  
> **Target Scope:** CLI sporepo, Template Scaffolding, & Workspace Directory Management  

---

## 1. Konteks Bisnis & Tujuan Fitur (*Problem & Goal*)
Saat ini, sporepo menyimpan berkas aktif di root repositori (`prompts/request/` dan `tests/bugs/`). Untuk meningkatkan kepatuhan terhadap aturan universal *Workspace Hygiene* dan meniru keunggulan manajemen dokumentasi terisolasi seperti Superpowers (`docs/superpowers`), sporepo berevolusi dengan memusatkan manajemen artefaknya di dalam `docs/sporepo/`.

- **Latar Belakang:** Folder root yang memuat banyak direktori kerja rentan mencemari root workspace. Diperlukan isolasi dokumentasi yang rapi, pemisahan antara berkas aktif vs arsip, serta kejelasan alur spec dan plan.
- **Tujuan Utama (*Goal*):**
  1. Merelokasi struktur repositori resmi ke `docs/sporepo/reqs/`, `docs/sporepo/bugs/`, dan `docs/sporepo/archive/`.
  2. Menyediakan perintah `sporepo migrate` untuk memindahkan struktur lama ke `docs/sporepo/`.
  3. Membangun siklus hidup pengarsipan (`docs/sporepo/archive/`) dengan perintah CLI baru (`sporepo archive <id>` dan `sporepo archive --all-verified`), serta deteksi otomatis pada `sporepo audit`.
- **Kriteria Keberhasilan (*Success Metrics*):**
  - CLI `sporepo init` menginisiasi struktur `docs/sporepo/reqs/`, `docs/sporepo/bugs/`, `docs/sporepo/archive/`.
  - `sporepo migrate` secara otomatis dan aman memindahkan berkas legacy tanpa kehilangan data.
  - `sporepo archive` memindahkan berkas yang berstatus `VERIFIED` ke folder arsip.
  - Scanner nomor urut 3 digit (`getNextRequestNumber`) tetap membaca arsip sehingga penomoran tidak pernah reset.
  - 100% test suite lulus.

---

## 2. Matriks Persona & Pembagian Tanggung Jawab (*Multi-Persona Assignment*)

| Persona | Tanggung Jawab Spesifik | Batas Kepemilikan File (*File Ownership*) |
| :--- | :--- | :--- |
| **@LeadArchitect** | Desain layout folder `docs/sporepo/`, resolusi arsip, skema migrasi | `src/utils/file.ts`, `docs/` |
| **@BackendCLI** | Implementasi `archive.ts`, `migrate.ts`, pembaruan `init.ts`, `req.ts`, `bug.ts`, `audit.ts`, `cli.ts` | `src/commands/`, `src/cli.ts` |
| **@ReviewerGatekeeper** | Audit batas kepemilikan dan verifikasi backward compatibility | *Review* |
| **@QA** | Penambahan automated tests untuk `archive`, `migrate`, dan regresi | `tests/` |

---

## 3. Batas Kepemilikan Berkas (*Touch Boundaries*)

- **Berkas yang Boleh Dibuat / Dimodifikasi (*Allowed Files*):**
  - `src/commands/archive.ts` (baru)
  - `src/commands/migrate.ts` (baru)
  - `src/commands/init.ts`
  - `src/commands/req.ts`
  - `src/commands/bug.ts`
  - `src/commands/audit.ts`
  - `src/utils/file.ts`
  - `templates/`
  - `skills/`
  - `rules/`
  - `tests/`
- **Berkas yang DILARANG Disentuh / Diubah (*Restricted / Read-Only Files*):**
  - `package.json` (dilarang menambah runtime dependencies)
  - `LICENSE`

---

## 4. INDEPENDENT REVIEWER GATEKEEPER SIGN-OFF ⛔

- [x] **Status:** Disetujui oleh pengguna untuk mulai koding (`APPROVED`)
- **Keputusan Terkunci dari Pengguna:**
  1. **Layout Folder:** `docs/sporepo/reqs/`, `docs/sporepo/bugs/`, `docs/sporepo/archive/`.
  2. **Backward Compatibility:** Mode *Strict Migration* dengan menyediakan perintah `sporepo migrate` untuk memindahkan struktur lama otomatis.
  3. **Mekanisme Arsip:** Mode Ganda (*Dual Mode*): perintah manual fleksibel (`sporepo archive <id>` / `--all-verified`) + deteksi interaktif pada `sporepo audit`.

---

## 5. Rencana Eksekusi Atomik (*Subagent-Driven Development / SDD*)

- [x] **Task 1: Pembaruan File Utilities (`src/utils/file.ts`)**
  - Dukungan path `docs/sporepo/reqs/`, `docs/sporepo/bugs/`, `docs/sporepo/archive/`.
  - Integrasi pembacaan sequence number lintas folder aktif + arsip.
- [x] **Task 2: Pembuatan Perintah `sporepo migrate` (`src/commands/migrate.ts`)**
  - Memindahkan `prompts/request/` $\rightarrow$ `docs/sporepo/reqs/`.
  - Memindahkan `tests/bugs/` $\rightarrow$ `docs/sporepo/bugs/`.
- [x] **Task 3: Pembuatan Perintah `sporepo archive` (`src/commands/archive.ts`)**
  - Dukungan pengarsipan per ID (`sporepo archive 001`) dan massal (`--all-verified`).
- [x] **Task 4: Pembaruan Perintah `init`, `req`, `bug`, `audit`, & `cli`**
  - Sinkronisasi path ke `docs/sporepo/` dan pendaftaran argumen CLI baru.
- [x] **Task 5: Pembaruan Templates, Global Skills, & Rules**
  - Selaraskan template dan aturan dengan layout `docs/sporepo/`.
- [x] **Task 6: Automated Testing & Verifikasi Terminal**
  - Test suite komprehensif untuk seluruh alur baru (25 tests lulus 100%).
- [x] **Task 7: Eksekusi Migrasi Mandiri (*Self-Hosting Migration*)**
  - Jalankan `sporepo migrate` pada repositori `sporepo` ini sendiri.

---

## 6. Protokol Verifikasi Akhir (*Verification Before Completion*)
```bash
npm test
node bin/sporepo.js audit
```

### Bukti Output Terminal (*Terminal Output Proof*)
```text
▶ sporepo - Unit & Integration Test Suite (13 tests pass)
▶ SPOREPO - Advanced QA & Security Edge-Cases (12 tests pass)
ℹ tests 25 | suites 11 | pass 25 | fail 0 | cancelled 0 | skipped 0

$ node bin/sporepo.js audit
🔍 [sporepo audit] Laporan Kepatuhan Rekayasa:
  Pemeriksaan Fondasi Struktur:
  [✔] docs/sporepo/reqs/    : Ditemukan
  [✔] docs/sporepo/bugs/    : Ditemukan
  [✔] docs/sporepo/archive/ : Ditemukan
  [✔] .sporepo/rule.md      : Ditemukan
```
