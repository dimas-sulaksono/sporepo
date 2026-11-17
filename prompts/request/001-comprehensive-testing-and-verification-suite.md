# META-PROMPT: [001] Comprehensive Testing and Verification Suite

> **Request ID:** 001  
> **Date:** 2026-11-17  
> **Status:** `VERIFIED` <!-- 100% verified with terminal proof -->  
> **Branch / Target:** `main`  
> **Target Scope:** Comprehensive Testing and Verification Suite  

---

## 1. Konteks Bisnis & Tujuan Fitur (*Problem & Goal*)
Repositori `sporepo` adalah framework rekayasa perangkat lunak AI zero-dependency. Pengujian komprehensif diperlukan untuk memvalidasi stabilitas, keamanan, dan kebersihan distribusi paket sebelum rilis publik.

- **Latar Belakang:** Framework ini menjadi landasan metodologi seluruh proyek AI di workstation pengguna.
- **Tujuan Utama (*Goal*):** Menjalankan pengujian multi-sudut pandang (QA Functional & Edge Cases, AppSec Path Traversal & Permissions, DevOps Packaging & Zero-Dependency).
- **Kriteria Keberhasilan (*Success Metrics*):**
  1. 100% test suite lulus tanpa cacat logika.
  2. Bebas dari celah sanitasi input dan path traversal.
  3. Murni Zero Runtime Dependencies (`dependencies: {}`).
  4. Lolos simulasi packaging rilis npm (`npm pack --dry-run`).

---

## 2. Matriks Persona & Pembagian Tanggung Jawab (*Multi-Persona Assignment*)

| Persona | Tanggung Jawab Spesifik | Batas Kepemilikan File (*File Ownership*) |
| :--- | :--- | :--- |
| **@ReviewerGatekeeper** | Audit batas pengujian, memastikan kepatuhan isolasi | *Read-Only* |
| **@QA** | Pengujian fungsional CLI, edge cases slug, numbering, collision | `tests/`, `.scratch/` |
| **@Security** | Audit path traversal, permission binary `bin/sporepo.js`, sanitasi | `tests/`, `.scratch/` |
| **@DevOps** | Packaging npm, verifikasi zero runtime dependencies | `package.json`, `.scratch/` |

---

## 3. Batas Kepemilikan Berkas (*File Ownership & Touch Boundaries*)

- **Berkas yang Boleh Dibuat / Dimodifikasi (*Allowed Files*):**
  - `tests/`
  - `.scratch/` (temporary test sandbox)
- **Berkas yang DILARANG Disentuh / Diubah (*Restricted / Read-Only Files*):**
  - `src/` (kecuali ada bug riil yang ditemukan via alur `sporepo bug`)
  - `package.json` (dilarang menambah runtime dependencies)
  - `LICENSE`

---

## 4. INDEPENDENT REVIEWER GATEKEEPER (STRICT BARRIER) ⛔

- [x] **Status:** Disetujui oleh pengguna untuk mulai pengujian (`APPROVED`)
- **Catatan Persetujuan Pengguna:** "Approved, jalankan pengujian Task 1 hingga Task 3."

---

## 5. Rencana Eksekusi Atomik (*Subagent-Driven Development / SDD*)

- [x] **Task 1: QA Functional & Edge-Case Testing (@QA)**
  - Uji numbering auto-increment (gap & boundary >= 1000)
  - Uji slugification dengan emoji, simbol unik, spasi berlebih
  - Uji collision handler laporan bug
  - Uji idempotensi init command
- [x] **Task 2: Security & Path Traversal Audit (@Security)**
  - Uji opsi path traversal (`--dir ../../../tmp/test`)
  - Verifikasi binary execution permission (`chmod +x` / `0755`)
  - Audit codebase: bebas dari unsafe `eval()` dan unescaped shell execution
- [x] **Task 3: Packaging & Zero-Dependency Purity (@DevOps)**
  - Audit `npm list --omit=dev` (wajib 0 runtime dependencies)
  - Audit file tarball `npm pack --dry-run`
  - Verifikasi mapping entrypoint binary `bin/sporepo.js`

---

## 6. Protokol Verifikasi Akhir (*Verification Before Completion*)

### A. Terminal Command Verification
```bash
npm test
npm list --omit=dev
npm pack --dry-run
node bin/sporepo.js audit
```

### B. Bukti Output Terminal (*Terminal Output Proof*)
```text
▶ sporepo - Unit & Integration Test Suite (13 tests pass)
▶ SPOREPO - Advanced QA & Security Edge-Cases (10 tests pass)
ℹ tests 23 | suites 11 | pass 23 | fail 0 | cancelled 0 | skipped 0

$ npm list --omit=dev
sporepo@1.0.0 /Users/sulaksono/work/projects/tools/sporepo
└── (empty)

$ node bin/sporepo.js audit
Skor Kepatuhan   : 100 / 100
Pemeriksaan Fondasi Struktur:
  [✔] prompts/request/ : Ditemukan
  [✔] tests/bugs/      : Ditemukan
  [✔] .sporepo/rule.md  : Ditemukan
```

