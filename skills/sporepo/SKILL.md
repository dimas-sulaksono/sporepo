---
name: sporepo
description: Framework Standar Rekayasa Perangkat Lunak AI (Hybrid antara Context-Rich Meta-Prompting & Superpowers Discipline). Otomatis aktif saat pengguna menyebut prompts/request, docs/sporepo, sporepo, "buatkan meta prompt", "laporkan bug", "arsipkan fitur", atau "jalankan SPO".
---

# Global Skill: SPOREPO (AI Software Engineering Standard)

## Ringkasan & Filosofi Hibrida (*The Hybrid Standard*)

**sporepo** adalah framework rekayasa perangkat lunak mandiri (*self-contained*) yang memadukan kedalaman konteks *Meta-Prompting multi-persona* dengan disiplin eksekusi *Superpowers*:
1. **Zero-Dependency CLI (`npx sporepo`):** Perkakas baris perintah ringan tanpa runtime dependencies pihak ketiga.
2. **Pusat Dokumentasi Terisolasi (`docs/sporepo/`):** Seluruh spesifikasi, bug, dan arsip tersimpan rapi di dalam `docs/sporepo/` agar root repositori selalu bersih (*Zero Tolerance Root Pollution*).
3. **Reviewer Gatekeeper Barrier:** Mandat mutlak bagi agen untuk berhenti dan mengaudit celah spesifikasi sebelum menyentuh kode implementasi.
4. **Siklus Pengarsipan Otomatis (`archive/`):** Berkas yang sudah `VERIFIED` dapat diarsipkan (`npx sporepo archive`) tanpa merusak penomoran auto-increment 3 digit.
5. **The Iron Law (Systematic Debugging):** Tidak ada perbaikan kode tanpa investigasi akar masalah riil dan pembuatan failing test terlebih dahulu (*TDD*).
6. **Deterministic Ground-Truth Bug Evidence:** Setiap bug wajib disertai bukti cURL riil, actual error payload, dan regression test plan.
7. **Terminal-Proven Verification:** Larangan mengklaim tugas selesai tanpa bukti konkret log eksekusi terminal (exit code 0).

---

## Workspace Precedence & CLI Integration

Inisialisasi struktur sporepo di repositori:
```bash
npx sporepo init
```
Struktur resmi yang dibentuk:
```text
docs/sporepo/
  ├── README.md
  ├── reqs/
  │     └── XXX-nama-fitur.md      # Auto-increment 3 digit (001, 002, ...)
  ├── bugs/
  │     └── YYYY-MM-DD-nama-bug.md # Laporan bug ground-truth
  └── archive/
        ├── reqs/                  # Fitur yang telah tuntas (VERIFIED)
        └── bugs/                  # Bug yang telah tuntas (VERIFIED)
.sporepo/
  └── rule.md                      # Aturan repositori lokal
```

> **Migrasi dari Versi Lama:**  
> Jika repositori menggunakan format lama (`prompts/request/` atau `tests/bugs/`), jalankan:
> ```bash
> npx sporepo migrate
> ```

---

## 1. Alur Fitur Baru (*Feature Request Workflow*)

### Langkah 1: Buat Meta-Prompt Terstandar
```bash
npx sporepo req "Nama Fitur Spesifik"
```
Berkas akan terbentuk di `docs/sporepo/reqs/XXX-nama-fitur.md`.

### Langkah 2: Audit Reviewer Gatekeeper (MANDAT STOP MUTLAK) ⛔
> [!CAUTION]
> AI Agent **DILARANG KERAS** menulis atau menyentuh kode implementasi sebelum fase audit ini selesai dan disetujui pengguna!

1. Periksa kelengkapan **Matriks Persona** (`@Architect`, `@Backend`, `@Frontend`, `@Database`, `@Security`, `@QA`).
2. Tentukan **Batas Kepemilikan File** (*Touch Boundaries*) yang boleh dan dilarang disentuh.
3. Lakukan audit kritis terhadap celah logika, dependensi tersembunyi, risiko breaking changes, dan edge cases.
4. Jika ada keputusan arsitektural yang ambigu, ajukan pertanyaan pilihan/keputusan secara **simultan dalam maksimal 1 putaran** kepada pengguna.
5. **TUNGGU konfirmasi persetujuan pengguna** hingga status dicentang:
   `[x] Status: Disetujui oleh pengguna untuk mulai koding (APPROVED)`.

### Langkah 3: Eksekusi Atomik Subagent-Driven Development (SDD)
Setelah status `APPROVED`:
1. Jalankan inisiasi SDD dan buat buku besar pelacak:
   ```bash
   npx sporepo sdd init docs/sporepo/reqs/XXX-nama-fitur.md
   ```
2. Eksekusi task secara atomik menggunakan protokol **`sporepo-sdd`**:
   - Agen induk murni bertindak sebagai koordinator (*zero context pollution*).
   - Ekstrak brief per task: `npx sporepo sdd brief <file> <task-num>`.
   - Dispatch subagent Implementer terisolasi per task.
   - Paketkan diff: `npx sporepo sdd pack <base> <head>`.
   - Dispatch subagent Task Reviewer (Spec Compliance + Code Quality).
   - Jalankan continuous execution tanpa jeda konfirmasi sepele (*Rulings, not stalls*).
   *(Lihat panduan lengkap pada global skill `sporepo-sdd`).*

### Langkah 4: Verifikasi Terminal & Pengarsipan
1. Jalankan test suite di terminal:
   ```bash
   npm test
   ```
2. Lampirkan bukti log terminal ke dalam dokumen dan ubah status menjadi `VERIFIED`.
3. Arsipkan dokumen yang telah selesai:
   ```bash
   npx sporepo archive <id>
   # Atau arsipkan semua yang selesai:
   npx sporepo archive --all-verified
   ```

---

## 2. Alur Perbaikan Bug (*Bug Fix Workflow*)

### Langkah 1: Catat Laporan Bug dengan Bukti Riil
```bash
npx sporepo bug "Nama Bug Spesifik"
```
Berkas akan terbentuk di `docs/sporepo/bugs/YYYY-MM-DD-nama-bug.md`.

### Langkah 2: Lengkapi Bukti Ground-Truth
Wajib mengisi: Metadata, Ground-Truth cURL riil, Actual Error Payload, dan Expected Behavior.

### Langkah 3: Systematic Debugging (The Iron Law)
> [!IMPORTANT]
> **"NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST"**
- **Phase 1 & 2:** Investigasi akar masalah & isolasi cacat logika.
- **Phase 3 (TDD / RED):** Tulis automated test yang sengaja GAGAL terlebih dahulu.
- **Phase 4 (GREEN):** Terapkan perbaikan kode seminimal mungkin hingga test LULUS.

### Langkah 4: Full Regression Pass & Terminal Proof
1. Jalankan seluruh test suite repositori (`npm test`).
2. Tempelkan bukti output log terminal ke dalam dokumen bug report dan tandai `VERIFIED`.
3. Arsipkan via `npx sporepo archive <nama-bug>`.

---

## 3. Audit Kepatuhan Repositori (*Repo Health Audit*)

```bash
npx sporepo audit
```
Perintah ini akan menampilkan skor kepatuhan (*compliance score*), status persetujuan Gatekeeper, daftar dokumen aktif vs arsip, serta mendeteksi dokumen `[VERIFIED]` yang siap diarsipkan.
