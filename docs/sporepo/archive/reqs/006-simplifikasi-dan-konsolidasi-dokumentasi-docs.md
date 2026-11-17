# META-PROMPT: [006] Simplifikasi dan Konsolidasi Dokumentasi Docs

> **Request ID:** 006  
> **Date:** 2026-11-17  
> **Status:** `VERIFIED` <!-- Options: DRAFT | REVIEW_PENDING | APPROVED | IN_PROGRESS | VERIFIED -->  
> **Archived At:** 2026-11-17
> **Branch / Target:** `main`  
> **Target Scope:** Seluruh Berkas Dokumentasi `docs/*.md` dan `README.md`  
> **Tingkat Kritis:** `MEDIUM (Developer Experience & Documentation Lean Quality)`  

---

## 1. Konteks Bisnis & Tujuan Fitur (*Problem & Goal*)

### A. Latar Belakang Masalah (*Problem Statement*)
Seiring dengan pesatnya penambahan kapabilitas pada `sporepo v1.1.0` (Workspace Lifecycle, SDD Engine, Gatekeeper Linter, Security CI, dan Packaging), berkas dokumentasi di direktori `docs/` mengalami pembengkakan dan potensi redundansi:
1. **Redundansi README:** Keberadaan `README.md` di root dan `docs/README.md` menimbulkan duplikasi indeks dan kebingungan navigasi pengguna (dua file dengan nama yang sama dan konten tabel yang serupa).
2. **Kepadatan Informasi yang Kurang Efisien:** Beberapa dokumen di `docs/` memuat penjelasan naratif yang panjang lebar dan berulang (misal: contoh CLI yang terlalu panjang atau teks deskripsi yang bisa diringkas menjadi tabel/cheatsheet visual).
3. **Beban Kognitif Pengguna Baru:** Pengguna dan kontributor membutuhkan panduan yang **singkat, padat, to-the-point, namun tetap informatif** dan memiliki perintah terminal yang dapat langsung disalin (*strictly reproducible*).

### B. Tujuan Utama (*Goal*)
1. Menuntaskan status `docs/README.md` vs root `README.md`: memutuskan apakah `docs/README.md` dieliminasi atau ditransformasi menjadi indeks sub-folder yang ultra-ramping tanpa menduplikasi root.
2. Menyederhanakan dan merefaktor seluruh berkas `*.md` di `docs/` (`architecture.md`, `cli-reference.md`, `gatekeeper-protocol.md`, `sdd-orchestration.md`, `packaging-and-release.md`) agar lebih ringkas, bernilai informasi tinggi (*high signal-to-noise ratio*), dan bebas dari teks pengisi (*filler*).
3. Memastikan tidak ada perintah CLI, opsi, parameter, atau konsep arsitektur krusial yang hilang selama proses penyederhanaan.
4. Memvalidasi seluruh tautan relatif (*relative links*) agar 100% valid dan bebas dari tautan rusak (*broken/dead links*).

### C. Kriteria Keberhasilan (*Success Metrics*)
- Seluruh dokumen di `docs/` lebih mudah dibaca dan dipahami dalam waktu singkat (< 3 menit baca per file).
- Redundansi antara root `README.md` dan `docs/` hilang 100%.
- 0 tautan rusak di seluruh berkas `.md` repositori.
- Test suite dan linter repositori tetap 100% lulus (`npm test` & `sporepo check`).

---

## 2. Matriks Persona & Pembagian Tanggung Jawab (*Multi-Persona Assignment*)

| Persona | Tanggung Jawab Spesifik | Batas Kepemilikan Berkas (*File Ownership*) |
| :--- | :--- | :--- |
| **@InformationArchitect** | Evaluasi struktur navigasi, audit hubungan `README.md` vs `docs/README.md`, perancangan taksonomi informasi yang bersih dan bebas duplikasi. | `README.md`, `docs/README.md`, taksonomi folder `docs/` |
| **@LeadDocumentationEngineer** | Refaktor, penyederhanaan teks, konversi narasi panjang menjadi matriks/tabel cheatsheet ringkas, pemadatan dokumen teknis. | `docs/architecture.md`, `docs/cli-reference.md`, `docs/gatekeeper-protocol.md`, `docs/sdd-orchestration.md`, `docs/packaging-and-release.md` |
| **@ReviewerGatekeeper** | Audit integritas teknis pasca-refaktor, verifikasi kelengkapan parameter CLI, pengecekan dead link menyeluruh, dan formulasi gerbang keputusan pengguna. | Seluruh repositori, link verification, & audit gate |

---

## 3. Batas Kepemilikan Berkas (*Touch Boundaries*)

- **Berkas yang Boleh Dibuat / Dimodifikasi (*Allowed Files*):**
  - `README.md`
  - `docs/README.md` (disederhanakan atau dihapus sesuai keputusan)
  - `docs/architecture.md`
  - `docs/cli-reference.md`
  - `docs/gatekeeper-protocol.md`
  - `docs/sdd-orchestration.md`
  - `docs/packaging-and-release.md`
  - `docs/release-readiness-certificate.md`
- **Berkas yang DILARANG Disentuh / Diubah (*Restricted / Read-Only Files*):**
  - `src/**` (kode sumber CLI tidak boleh diubah pada task dokumentasi ini)
  - `tests/**` (test suite inti tetap dipertahankan)
  - `package.json` & `tsconfig.json`
  - `LICENSE`
  - `docs/sporepo/**` (arsip dan spesifikasi lama tidak boleh diubah sembarangan)
- **Deliverables yang Diharapkan:**
  1. Resolusi definitif terhadap `docs/README.md` (dihapus atau dirampingkan tanpa duplikasi).
  2. Berkas `docs/architecture.md`, `docs/cli-reference.md`, `docs/gatekeeper-protocol.md`, `docs/sdd-orchestration.md`, dan `docs/packaging-and-release.md` yang ringkas, to-the-point, dan informatif.
  3. Seksi `## Documentation` pada root `README.md` yang tersinkronisasi 100% dengan tautan aktif.
  4. Laporan verifikasi bebas broken link dan kepatuhan test suite.

---

## 4. INDEPENDENT REVIEWER GATEKEEPER (STRICT BARRIER) ⛔

> [!CAUTION]
> **MANDAT STOP MUTLAK BAGI AI AGENT:**
> Agen DILARANG KERAS langsung mengubah isi berkas dokumentasi sebelum fase audit Gatekeeper ini disetujui oleh pengguna!

### A. Checklist Audit Kritis Pra-Refaktor
1. [x] **Analisis Peran `docs/README.md`:** Root `README.md` sudah memiliki seksi `## Documentation` lengkap. `docs/README.md` diputuskan untuk dihapus demi mencegah duplikasi dan desinkronisasi.
2. [x] **Preservasi Informasi Kritis:** Seluruh opsi/parameter CLI baru (`--all`, `--json`, `archive --all-verified`, sub-perintah `sdd`) tetap dipertahankan utuh dalam tabel opsi ringkas.
3. [x] **Konsistensi Format:** Dokumen dirampingkan dengan format tabel cheatsheet, bebas filler naratif, strictly reproducible, dan tanpa emoji berlebih.

### B. Daftar Pertanyaan Keputusan untuk Pengguna (*Simultaneous Decision Round*)
- [x] **Pertanyaan 1 (Status `docs/README.md`):** Disetujui Opsi A (Hapus `docs/README.md`, jadikan root `README.md` sebagai Single Source of Truth).
- [x] **Pertanyaan 2 (Format Simplifikasi Dokumen Teknis):** Disetujui Opsi A (Tetap modular per topik, pangkas filler naratif menjadi tabel cheatsheet & opsi ringkas).

### C. Konfirmasi Persetujuan Pengguna (*User Sign-Off*)
- [x] **Status:** Disetujui oleh pengguna untuk mulai eksekusi (`APPROVED`)
- **Catatan Persetujuan Pengguna:** Pengguna memilih Opsi A untuk kedua pertanyaan keputusan pada 2026-11-17. Eksekusi refaktor dokumentasi diizinkan berjalan.

---

## 5. Rencana Eksekusi Atomik (*Atomic Execution Tasks*)

- [x] **Task 1: Audit dan Resolusi Redundansi `docs/README.md` vs `README.md`**
  - **Fokus Persona:** `@InformationArchitect`
  - **Aksi:**
    1. Terapkan keputusan pengguna atas Pertanyaan 1 (`git rm docs/README.md`).
    2. Sinkronkan seksi `## Documentation` pada root `README.md` agar seluruh tautan dan deskripsi dokumen akurat, tajam, dan mudah dinavigasi.
  - **Kriteria Verifikasi:** Navigasi dokumen bersih, tidak ada duplikasi teks indeks.

- [x] **Task 2: Simplifikasi & Pemadatan Panduan Arsitektur & CLI Reference**
  - **Fokus Persona:** `@LeadDocumentationEngineer`
  - **Aksi:**
    1. Refaktor `docs/architecture.md`: Perjelas diagram Mermaid, satukan tabel modul agar ringkas, perbarui ke v1.1.0.
    2. Refaktor `docs/cli-reference.md`: Ubah format narasi panjang per perintah menjadi format standar: *Sintaks*, *Deskripsi Singkat*, *Tabel Opsi*, dan *Contoh Satu Baris*. Lengkapi perintah `archive` dan `migrate`.
    3. Refaktor `docs/packaging-and-release.md`: Buat alur pra-rilis menjadi checklist langkah konkret 1-2-3 tanpa basa-basi.
  - **Kriteria Verifikasi:** Panjang baris berkurang 25-40% dengan kepadatan informasi teknis meningkat.

- [x] **Task 3: Simplifikasi & Pemadatan Protokol SDD & Gatekeeper**
  - **Fokus Persona:** `@LeadDocumentationEngineer`
  - **Aksi:**
    1. Refaktor `docs/sdd-orchestration.md`: Fokus langsung pada 4 perintah SDD (`init`, `brief`, `pack`, `parse`), siklus Conductor-Implementer-Reviewer, dan template ledger.
    2. Refaktor `docs/gatekeeper-protocol.md`: Padatkan penjelasan 5 lensa audit menjadi kartu acuan cepat (*quick reference table*), aturan single-round decision, dan sintaks `sporepo check`.
    3. Sinkronkan metrik pengujian di `docs/release-readiness-certificate.md` menjadi 48 automated test cases.
  - **Kriteria Verifikasi:** Penjelasan mudah dipahami dalam sekali baca oleh pengembang baru.

- [x] **Task 4: Link Integrity, Linter Check, & Final Gatekeeper Sign-Off**
  - **Fokus Persona:** `@ReviewerGatekeeper`
  - **Aksi:**
    1. Jalankan pemindaian broken link pada seluruh berkas `.md` repositori (0 broken links).
    2. Jalankan `node bin/sporepo.js check docs/sporepo/reqs/006-simplifikasi-dan-konsolidasi-dokumentasi-docs.md` (skor 100/100).
    3. Jalankan `npm test` (48 passing, 0 failing).
    4. Jalankan `node bin/sporepo.js audit` (skor 100/100).
  - **Kriteria Verifikasi:** 0 broken links, 100% tests pass, Gatekeeper score 100/100.

---

## 6. Protokol Verifikasi Akhir (*Verification Before Completion*)

### A. Terminal Commands
```bash
# 1. Pindai broken markdown links
python3 -c "import os, re; ..."

# 2. Validasi spesifikasi dengan gatekeeper linter
node bin/sporepo.js check docs/sporepo/reqs/006-simplifikasi-dan-konsolidasi-dokumentasi-docs.md

# 3. Jalankan test suite penuh
npm test

# 4. Audit kepatuhan repositori
node bin/sporepo.js audit
```

### B. Bukti Output Terminal (*Terminal Output Proof*)
```text
Total broken links: 0

SPOREPO GATEKEEPER SPECIFICATION AUDIT:
  Status Dokumen : VERIFIED
  User Sign-Off  : ✓ APPROVED (Siap Koding)
  Kematangan     : 100 / 100 [MEMENUHI SYARAT]
  ✔ Sempurna: Tidak ditemukan celah spesifikasi atau kekurangan struktural.

npm test:
  ℹ tests 48
  ℹ suites 20
  ℹ pass 48
  ℹ fail 0

sporepo audit:
  Skor Kepatuhan : 100 / 100
```
```
