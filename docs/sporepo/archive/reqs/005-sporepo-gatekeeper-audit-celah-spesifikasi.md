# META-PROMPT: [005] sporepo-gatekeeper: Skill Mandiri Audit Celah Spesifikasi & Single-Round Decision Gate

> **Request ID:** 005  
> **Date:** 2026-11-17  
> **Status:** `VERIFIED` <!-- Options: DRAFT | REVIEW_PENDING | APPROVED | IN_PROGRESS | VERIFIED -->  
> **Archived At:** 2026-11-17
> **Branch / Target:** `feat/sporepo-gatekeeper`  
> **Target Scope:** Global Skill `sporepo-gatekeeper`, CLI Linter `sporepo gatekeeper`, dan Template Audit Adversial  

---

## 1. Konteks Bisnis & Tujuan Fitur (*Problem & Goal*)

### A. Latar Belakang Masalah (*Problem Statement*)
Meskipun SPOREPO memiliki aturan *Reviewer Gatekeeper Barrier* di Seksi 4 Meta-Prompt, proses audit celah spesifikasi ini sering kali:
1. **Pasif dan Tidak Terstandarisasi:** Bergantung pada inisiatif agen umum yang sering kali melewatkan audit mendalam karena terburu-buru ingin langsung mengimplementasikan kode.
2. **Tidak Modular:** Pengguna yang baru memiliki draf ide atau spesifikasi mentah tidak bisa memanggil reviewer independen secara terisolasi tanpa harus menjalankan alur pengembangan penuh.
3. **Pertanyaan Berulang (*Ping-Pong Delays*):** Tanpa protokol terstruktur, agen sering bertanya satu per satu secara mencicil, menghabiskan waktu pengguna, alih-alih mengumpulkan semua hal yang perlu diputuskan dalam satu putaran simultan (*Single-Round Decision*).

### B. Tujuan Utama (*Goal*)
Membangun modul dan skill mandiri **`sporepo-gatekeeper`** yang berfungsi sebagai **Adversarial Specification Reviewer**:
1. Mengaudit dokumen spesifikasi teknis / Meta-Prompt terhadap 5 pilar celah: logika alur bisnis, dependensi rapuh, risiko *breaking changes*, skenario *edge cases*, dan validasi keamanan.
2. Mengumpulkan seluruh ambiguitas dan menyajikan **Daftar Pertanyaan Keputusan Simultan dalam SATU putaran** (*Single-Round Simultaneous Decision Round*) lengkap dengan opsi rekomendasi.
3. Menghasilkan laporan audit kesiapan spesifikasi (*Spec Audit Report*) dengan rekomendasi status: `APPROVED` atau `NEEDS_REVISION`.
4. Menyediakan perkakas CLI pembantu: `npx sporepo gatekeeper <file>` (alias: `sporepo check`) untuk me-lint kelengkapan struktural dokumen Meta-Prompt secara deterministik.

### C. Kriteria Keberhasilan (*Success Metrics*)
- 100% Zero runtime dependencies.
- Terbitnya global skill mandiri `skills/sporepo-gatekeeper/SKILL.md` (dan terpasang di `~/.gemini/config/skills/sporepo-gatekeeper/SKILL.md`).
- Perintah CLI `npx sporepo gatekeeper <file>` mampu mendeteksi ketiadaan seksi wajib, persona yang hilang, dan touch boundaries yang belum didefinisikan.
- 100% kelulusan automated test suite baru.

---

## 2. Matriks Persona & Pembagian Tanggung Jawab (*Multi-Persona Assignment*)

| Persona | Tanggung Jawab Spesifik | Batas Kepemilikan File (*File Ownership*) |
| :--- | :--- | :--- |
| **@Architect** | Desain protokol audit spesifikasi adversial, kriteria single-round decision, dan struktur laporan | `docs/`, `skills/sporepo-gatekeeper/SKILL.md` |
| **@Backend** | Implementasi linter Meta-Prompt pada CLI `src/commands/gatekeeper.ts` dan integrasi `src/cli.ts` | `src/commands/gatekeeper.ts`, `src/cli.ts` |
| **@PromptEngineer** | Desain template audit adversial `templates/gatekeeper/spec-audit-prompt.md` | `templates/gatekeeper/` |
| **@QA** | Automated unit tests untuk linter gatekeeper, verifikasi pesan error, dan zero-dependency | `tests/gatekeeper.test.ts` |

---

## 3. Batas Kepemilikan Berkas (*File Ownership & Touch Boundaries*)

- **Berkas yang Boleh Dibuat / Dimodifikasi (*Allowed Files*):**
  - `src/commands/gatekeeper.ts` (CLI command handler)
  - `src/cli.ts` (Registrasi subcommand `gatekeeper` / `check`)
  - `templates/gatekeeper/spec-audit-prompt.md`
  - `skills/sporepo-gatekeeper/SKILL.md`
  - `docs/gatekeeper-protocol.md`
  - `tests/gatekeeper.test.ts`
  - `README.md`, `docs/cli-reference.md`, `notes.md`
  - `docs/sporepo/reqs/005-sporepo-gatekeeper-audit-celah-spesifikasi.md`
- **Berkas yang DILARANG Disentuh / Diubah (*Restricted / Read-Only Files*):**
  - `package.json` runtime dependencies (Zero-Dependency Guarantee).
  - Berkas modul inti `init.ts`, `req.ts`, `bug.ts`, `sdd.ts` (hanya integrasi clean import).

---

## 4. INDEPENDENT REVIEWER GATEKEEPER (STRICT BARRIER) ⛔

> [!CAUTION]
> **MANDAT STOP MUTLAK BAGI AI AGENT:**
> Agen **DILARANG KERAS** menyentuh atau menulis kode implementasi sebelum fase audit ini selesai dan disetujui pengguna!

### A. Audit Celah Spesifikasi & Edge Cases
1. **Metode Penyajian Pertanyaan Simultan:**
   - Pertanyaan keputusan harus dirancang dengan opsi terstruktur (misal: format bullet berlabel `(Rekomendasi)` atau tool `ask_question`), sehingga pengguna cukup membalas nomor opsi atau satu konfirmasi ringkas tanpa perlu mengetik esai panjang.
2. **Fleksibilitas Input Linter CLI:**
   - Perintah `npx sporepo gatekeeper [file]` harus dapat menerima path berkas aktif di `docs/sporepo/reqs/`, path lama `prompts/request/`, atau mencari file `REVIEW_PENDING` terbaru jika dipanggil tanpa argumen file.
3. **Pemisahan Peran Tegas:**
   - Gatekeeper HANYA bertugas mengaudit spesifikasi dan mengunci keputusan. Gatekeeper TIDAK menulis kode implementasi fitur.

### B. Daftar Pertanyaan Keputusan untuk Pengguna (*Simultaneous Decision Round*)
- [x] **Pertanyaan 1 (Format Pertanyaan Keputusan):**  
  Apakah Anda setuju jika saat `sporepo-gatekeeper` menemukan celah, pertanyaan keputusan disajikan dalam format *Multiple Choice / Structured Options* dengan rekomendasi jelas di opsi pertama, sehingga Anda bisa memutuskan semua poin dalam satu putaran cepat?  
  - **Keputusan Pengguna:** Ya (format opsi terstruktur dengan rekomendasi disetujui).
- [x] **Pertanyaan 2 (Nama Perintah CLI & Alias):**  
  Apakah Anda setuju perintah CLI utama dinamai `npx sporepo gatekeeper <file>` dengan alias praktis `npx sporepo check <file>`?  
  - **Keputusan Pengguna:** Ya (perintah `sporepo gatekeeper` dan alias `sporepo check` disetujui).

### C. Konfirmasi Persetujuan Pengguna (*User Sign-Off*)
- [x] **Status:** Disetujui oleh pengguna untuk mulai koding (`APPROVED`)
- **Catatan Persetujuan Pengguna:** Pengguna mengonfirmasi persetujuan penuh atas format pertanyaan keputusan simultan dan perintah CLI `gatekeeper` / `check`.

---

## 5. Rencana Eksekusi Atomik (*Subagent-Driven Development / SDD*)

- [x] **Task 1: Template Audit Adversial Gatekeeper**
  - **Fokus Persona:** `@PromptEngineer` / `@Architect`
  - **Aksi:** Buat template `templates/gatekeeper/spec-audit-prompt.md` berisi 5 lensa audit celah spesifikasi dan format penyajian pertanyaan keputusan simultan.
  - **Verifikasi Task:** Template tersimpan rapi dan tervalidasi.
- [x] **Task 2: CLI Linter Meta-Prompt `src/commands/gatekeeper.ts`**
  - **Fokus Persona:** `@Backend`
  - **Aksi:** Implementasikan fungsi audit struktural Meta-Prompt (memeriksa Goal, Persona, Touch Boundaries, Deliverables, Status), daftarkan di `src/cli.ts` sebagai subperintah `gatekeeper` dan alias `check`.
  - **Verifikasi Task:** `node bin/sporepo.js gatekeeper --help` dan `node bin/sporepo.js check <file>` berjalan mulus.
- [x] **Task 3: Pembuatan Global Skill Mandiri `sporepo-gatekeeper`**
  - **Fokus Persona:** `@Architect`
  - **Aksi:** Buat `skills/sporepo-gatekeeper/SKILL.md` (dan pasang di `~/.gemini/config/skills/sporepo-gatekeeper/SKILL.md`), tautkan referensi di `skills/sporepo/SKILL.md`.
  - **Verifikasi Task:** Skill terdaftar valid di direktori global Antigravity / Gemini.
- [x] **Task 4: Automated Test Suite `tests/gatekeeper.test.ts`**
  - **Fokus Persona:** `@QA`
  - **Aksi:** Buat pengujian komprehensif untuk mendeteksi spesifikasi yang tidak lengkap, error handling, flag CLI, dan zero-dependency.
  - **Verifikasi Task:** `npm test` lulus 100% (47 tests pass).
- [x] **Task 5: Dokumentasi Protokol & Panduan Operasional**
  - **Fokus Persona:** `@Architect`
  - **Aksi:** Buat `docs/gatekeeper-protocol.md`, perbarui `docs/cli-reference.md`, `README.md`, dan `notes.md`.
  - **Verifikasi Task:** Tautan dokumentasi valid dan `npm pack --dry-run` bersih.

---

## 6. Protokol Verifikasi Akhir (*Verification Before Completion*)

### A. Terminal Command Verification
```bash
# 1. Kompilasi TypeScript
npm run build

# 2. Eksekusi Test Suite Penuh
npm test

# 3. Uji Linter Gatekeeper CLI
node bin/sporepo.js gatekeeper docs/sporepo/reqs/005-sporepo-gatekeeper-audit-celah-spesifikasi.md
node bin/sporepo.js check docs/sporepo/reqs/005-sporepo-gatekeeper-audit-celah-spesifikasi.md

# 4. Packaging Dry-Run (< 35 KB compressed)
npm pack --dry-run
```

### B. Bukti Output Terminal (*Terminal Output Proof*)
```text
> sporepo@1.1.0 test
> tsc && node --test dist/tests/**/*.test.js

▶ sporepo - Unit & Integration Test Suite (222ms, 6 suites, 14 tests pass)
▶ SPOREPO - Advanced QA & Security Edge-Cases (153ms, 3 suites, 11 tests pass)
▶ sporepo-gatekeeper - Specification Audit & Linter Test Suite (162ms, 4 suites, 11 tests pass)
▶ sporepo-sdd - Subagent-Driven Development Test Suite (167ms, 3 suites, 11 tests pass)

ℹ tests 47
ℹ suites 20
ℹ pass 47
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SPOREPO GATEKEEPER SPECIFICATION AUDIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Berkas Target  : docs/sporepo/reqs/005-sporepo-gatekeeper-audit-celah-spesifikasi.md
  Request ID     : [005] sporepo-gatekeeper: Skill Mandiri Audit Celah Spesifikasi & Single-Round Decision Gate
  Status Dokumen : VERIFIED
  User Sign-Off  : ✓ APPROVED (Siap Koding)
  Kematangan     : 100 / 100 [MEMENUHI SYARAT]

✔ Sempurna: Tidak ditemukan celah spesifikasi atau kekurangan struktural.
```

### C. Pembaruan Dokumentasi
- [x] `docs/gatekeeper-protocol.md` telah dibuat.
- [x] `README.md` dan `docs/cli-reference.md` telah disinkronkan.
