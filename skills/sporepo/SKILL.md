---
name: sporepo
description: Framework Standar Rekayasa Perangkat Lunak AI (Hybrid antara Context-Rich Meta-Prompting & Superpowers Discipline). Otomatis aktif saat pengguna menyebut prompts/request, tests/bugs, sporepo, "buatkan meta prompt", "laporkan bug", atau "jalankan SPO".
---

# Global Skill: SPOREPO (AI Software Engineering Standard)

## Ringkasan & Filosofi Hibrida (*The Hybrid Standard*)

**sporepo** adalah framework rekayasa perangkat lunak mandiri (*self-contained*) yang memadukan kedalaman konteks *Meta-Prompting multi-persona* dengan disiplin eksekusi *Superpowers*:
1. **Zero-Dependency CLI (`npx sporepo`):** Perkakas baris perintah ringan tanpa runtime dependencies pihak ketiga.
2. **Reviewer Gatekeeper Barrier:** Mandat mutlak bagi agen untuk berhenti dan mengaudit celah spesifikasi sebelum menyentuh kode implementasi.
3. **The Iron Law (Systematic Debugging):** Tidak ada perbaikan kode tanpa investigasi akar masalah riil dan pembuatan failing test terlebih dahulu (*TDD*).
4. **Deterministic Ground-Truth Bug Evidence:** Setiap bug wajib disertai bukti cURL riil, actual error payload, dan regression test plan.
5. **Terminal-Proven Verification:** Larangan mengklaim tugas selesai tanpa bukti konkret log eksekusi terminal (exit code 0).

---

## Workspace Precedence & CLI Integration

Jika repositori belum diinisialisasi dengan struktur sporepo, inisialisasi terlebih dahulu:
```bash
npx sporepo init
```
Struktur resmi yang akan dibentuk:
```
prompts/
  ├── README.md
  └── request/
        └── XXX-nama-fitur.md    # Auto-increment 3 digit (001, 002, ...)
tests/
  └── bugs/
        ├── README.md
        └── YYYY-MM-DD-nama-bug.md # Laporan bug ground-truth
.sporepo/
  └── rule.md                    # Aturan repositori lokal
```

---

## 1. Alur Fitur Baru (*Feature Request Workflow*)

### Langkah 1: Buat Meta-Prompt Terstandar
Jalankan CLI untuk membuat template dengan penomoran urut otomatis 3 digit:
```bash
npx sporepo req "Nama Fitur Spesifik"
```
Berkas akan terbentuk di `prompts/request/XXX-nama-fitur.md`.

### Langkah 2: Audit Reviewer Gatekeeper (MANDAT STOP MUTLAK) ⛔
> [!CAUTION]
> **ATURAN MUTLAK AGEN:**
> AI Agent **DILARANG KERAS** menulis atau menyentuh kode implementasi sebelum fase audit ini selesai dan disetujui pengguna!

1. Periksa kelengkapan **Matriks Persona** (`@Architect`, `@Backend`, `@Frontend`, `@Database`, `@Security`, `@QA`).
2. Tentukan **Batas Kepemilikan File** (*Touch Boundaries*) yang boleh dan dilarang disentuh.
3. Lakukan audit kritis terhadap celah logika, dependensi tersembunyi, risiko breaking changes, dan edge cases.
4. Jika ada keputusan arsitektural yang ambigu, ajukan pertanyaan pilihan/keputusan secara **simultan dalam maksimal 1 putaran** kepada pengguna.
5. **TUNGGU konfirmasi persetujuan pengguna** hingga status dicentang:
   `[x] Status: Disetujui oleh pengguna untuk mulai koding (APPROVED)`.

### Langkah 3: Eksekusi Atomik Subagent-Driven Development (SDD)
Setelah status `APPROVED`:
1. Pecah pekerjaan menjadi subtugas (*tasks*) atomik.
2. Kerjakan tugas satu per satu (*task-by-task*):
   - Terapkan kode sesuai kepemilikan persona.
   - Uji setiap task secara terisolasi.
   - Periksa kesesuaian kode terhadap batasan spesifikasi.

### Langkah 4: Verifikasi Akhir Terminal (*Verification Before Completion*)
1. Jalankan test suite dan linting di terminal:
   ```bash
   npm test
   npm run lint || npx tsc --noEmit
   ```
2. Pastikan exit code 0 dan 0 error.
3. Lampirkan cuplikan log terminal nyata ke dalam dokumen `prompts/request/XXX-nama-fitur.md`.
4. Ubah status menjadi `VERIFIED`.

---

## 2. Alur Perbaikan Bug (*Bug Fix Workflow*)

### Langkah 1: Catat Laporan Bug dengan Bukti Riil
Jalankan CLI untuk membuat laporan bug:
```bash
npx sporepo bug "Nama Bug Spesifik"
```
Berkas akan terbentuk di `tests/bugs/YYYY-MM-DD-nama-bug.md`.

### Langkah 2: Lengkapi Bukti Ground-Truth
Wajib mengisi:
1. **Metadata:** Tanggal, environment (Local/Staging/Prod), role user, device.
2. **Ground-Truth cURL:** Perintah cURL nyata lengkap dengan URL, headers, dan payload yang mereproduksi bug.
3. **Actual Error Payload:** HTTP status code, Trace ID, dan response body/stack trace aktual.
4. **Expected Behavior:** Respons dan alur yang seharusnya terjadi.

### Langkah 3: Systematic Debugging (The Iron Law)
> [!IMPORTANT]
> **"NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST"**
> Dilarang keras melakukan *guesswork* atau *symptom patching*.

Ikuti 4 fase terstruktur:
- **Phase 1 (Investigasi Akar Masalah):** Telusuri log, stack trace, dan alur kode dari entrypoint hingga lapisan database. Temukan akar penyebab sebenarnya.
- **Phase 2 (Isolasi Cacat Logika):** Tentukan berkas dan baris kode spesifik yang menyebabkan malfungsi.
- **Phase 3 (Test-Driven Development / RED):** Tulis automated test baru di test suite repositori yang secara deterministik mereproduksi bug dan **GAGAL**.
- **Phase 4 (Perbaikan Terarah / GREEN):** Ubah kode seminimal dan sebersih mungkin hingga automated test tersebut **LULUS**.

### Langkah 4: Full Regression Pass & Terminal Proof
1. Jalankan seluruh test suite repositori:
   ```bash
   npm test
   ```
2. Pastikan tidak ada regresi pada modul lain.
3. Tempelkan bukti output log terminal ke dalam dokumen bug report.
4. Ubah status laporan menjadi `VERIFIED`.

---

## 3. Audit Kepatuhan Repositori (*Repo Health Audit*)

Untuk memeriksa status seluruh Meta-Prompt dan laporan bug di repositori:
```bash
npx sporepo audit
```
Perintah ini akan menampilkan skor kepatuhan (*compliance score*), status persetujuan Gatekeeper, dan kelengkapan bukti uji regresi.
