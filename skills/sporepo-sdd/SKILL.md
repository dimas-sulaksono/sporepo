---
name: sporepo-sdd
description: Subagent-Driven Development (SDD) Orchestrator for SPOREPO. Use when executing implementation plans or atomic tasks from a Meta-Prompt using isolated implementer and reviewer subagents. Triggered by "jalankan SDD", "sporepo-sdd", "orkestrasi subagent", or when executing Section 5 of any SPOREPO Meta-Prompt.
---

# Global Skill: SPOREPO-SDD (Subagent-Driven Development)

## 1. Filosofi & Peran Koordinator (*The Conductor Protocol*)

**sporepo-sdd** adalah mesin orkestrasi pelaksanaan rencana tugas (*implementation plan*) yang memadukan prinsip isolasi konteks (*zero context pollution*) dengan peninjauan ganda (*dual review gates*).

### Aturan Emas Koordinator (*The Golden Rules*):
1. **Koordinator Adalah Konduktor, Bukan Pekerja:** Anda DILARANG menulis kode implementasi secara langsung di sesi utama. Tugas Anda adalah memecah tugas, mendispatch subagent yang tepat, meninjau hasil, dan memelihara buku besar (*ledger*).
2. **Eksekusi Berkesinambungan (*Continuous Execution*):** Jangan berhenti di antara tugas hanya untuk bertanya *"Apakah saya boleh lanjut?"* kepada pengguna. Jalankan seluruh task dari awal hingga akhir tanpa henti.
3. **Keputusan Sepihak (*Rulings, Not Stalls*):** Jangan memarkir sesi hanya karena keraguan minor atau ambiguitas kecil. Ambil keputusan berdasar akal sehat rekayasa, catat di ledger:
   `Ruling: <keputusan> — <alasan> — <biaya jika salah>`, dan teruskan pengerjaan.
4. **Hanya 4 Hal yang Boleh Menghentikan Koordinator:**
   - Operasi destruktif / tidak dapat dibatalkan (`rm -rf` data penting, reset branch bersama).
   - Tindakan sensitif keamanan (meminta token rahasia pengguna).
   - Efek samping di luar repositori (`git push`, `npm publish`).
   - Rencana tugas rusak fatal sehingga seluruh langkah berikutnya hanya tebakan liar.

---

## 2. Inisiasi Sesi SDD & Ledger

Sebelum memulai Task 1:
```bash
# 1. Pastikan status Meta-Prompt sudah disetujui (APPROVED)
# 2. Inisiasi sesi dan buat berkas ledger
npx sporepo sdd init docs/sporepo/reqs/XXX-nama-fitur.md
```
Berkas ledger akan dibuat di: `.scratch/sdd/<request-id>/ledger.md`.
Ledger ini adalah memori pelacak Anda yang kebal dari kompaksi konteks.

---

## 3. Alur Siklus Per Tugas (*The Per-Task Loop*)

Untuk setiap Task $N$ pada Meta-Prompt:

### Langkah A: Catat Base Commit
Simpan hash commit awal sebelum menyentuh kode:
```bash
BASE=$(git rev-parse HEAD)
```

### Langkah B: Ekstrak Brief Tugas
Jalankan perintah pembantu CLI:
```bash
npx sporepo sdd brief docs/sporepo/reqs/XXX-nama-fitur.md N
```
Perintah ini akan menghasilkan berkas brief mandiri di `.scratch/sdd/<id>/task-N-brief.md` dan menentukan berkas laporan di `.scratch/sdd/<id>/task-N-report.md`.

### Langkah C: Panggil Implementer Subagent
Panggil subagent implementer (via tool `invoke_subagent`):
- **Role:** `Implementer Task N`
- **Model:** Pilih model sesuai kompleksitas (model hemat/cepat untuk tugas mekanik 1-2 file; model standar untuk integrasi).
- **Prompt:** Gunakan format template `templates/sdd/implementer-prompt.md`. Berikan path `task-N-brief.md` dan perintahkan implementer menulis laporan lengkap ke `task-N-report.md`.
- **Aturan Implementer:** Implementer DILARANG memanggil subagent lagi. Implementer wajib menjalankan automated test lokal sebelum lapor selesai.

### Langkah D: Terima Laporan Implementer
Saat implementer melaporkan status `DONE`:
1. Periksa apakah implementer menyertakan commit hash dan ringkasan pengujian.
2. Catat commit HEAD saat ini:
   ```bash
   HEAD=$(git rev-parse HEAD)
   ```

### Langkah E: Paketkan Diff & Panggil Task Reviewer Subagent
Jangan pernah melewati tahap peninjauan task!
1. Buat paket diff Git:
   ```bash
   npx sporepo sdd pack $BASE $HEAD
   ```
   Paket akan tersimpan di `.scratch/sdd/review-pack-$BASE-$HEAD.md`.
2. Panggil subagent reviewer terpisah:
   - **Role:** `Task Reviewer Task N`
   - **Model:** Model standar atau mampu (jangan gunakan model terlemah untuk review).
   - **Prompt:** Gunakan format template `templates/sdd/task-reviewer-prompt.md`. Berikan berkas brief, laporan implementer, dan berkas review package.
   - **Mandat Reviewer:** Memeriksa 2 Lensa:
     - **Spec Compliance:** Apakah seluruh kriteria deliverable terpenuhi secara verbatim?
     - **Code Quality:** Zero-dependency check, kebersihan kode, YAGNI, test coverage.

### Langkah F: Penanganan Vonis & Fix-Loop
- **Jika Reviewer APPROVE (Dual PASS):**
  - Perbarui status Task $N$ pada Meta-Prompt menjadi `- [x]`.
  - Catat keberhasilan di ledger: `Task N: complete (commits $BASE..$HEAD, review clean)`.
  - Lanjutkan langsung ke Task $N+1$.
- **Jika Reviewer REQUEST_FIXES (Ada temuan Critical/Important):**
  - Buka siklus perbaikan (*Fix-Loop*).
  - Panggil kembali implementer yang sama dengan memberikan daftar temuan reviewer.
  - Maksimal 3 putaran perbaikan. Jika putaran ke-3 masih bermasalah, Koordinator membuat *Ruling* formal di ledger untuk mengunci arah solusi.

---

## 4. Peninjauan Menyeluruh (*Final Whole-Branch Review*)

Setelah seluruh tugas atomik selesai:
1. Paketkan diff seluruh branch terhadap baseline awal branch:
   ```bash
   npx sporepo sdd pack <branch-base-commit> HEAD --out .scratch/sdd/final-review-pack.md
   ```
2. Panggil **Final Reviewer Subagent** pada model paling kapabel menggunakan template `templates/sdd/final-reviewer-prompt.md`.
3. Periksa konsistensi arsitektur, kelulusan seluruh test suite (`npm test`), dan higienitas workspace.
4. Lampirkan bukti terminal pass ke dokumen Meta-Prompt dan ubah status menjadi `VERIFIED`.

---

## 5. Matriks Pemilihan Model (*Model Selection Strategy*)

| Jenis Tugas | Karakteristik Beban Kerja | Rekomendasi Model |
| :--- | :--- | :--- |
| **Mechanical Implementation** | Menulis fungsi terisolasi 1-2 file, spec sangat gamblang | Model Cepat & Hemat (`flash` / `flash_lite`) |
| **Integration Implementation** | Koordinasi multi-berkas, alur data antarmodul, refactor | Model Standar (`inherit` / `flash`) |
| **Task Reviewer** | Menguji spec compliance dan mencari potensi regresi diff | Model Standar (`inherit`) |
| **Architecture & Final Review** | Evaluasi konsistensi seluruh cabang dan dampak sistemik | Model Terbaik / Kapabel (`pro` / `inherit`) |
