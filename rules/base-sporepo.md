---
trigger: model_decision
description: Aturan universal kepatuhan rekayasa perangkat lunak SPOREPO (Meta-Prompting Gatekeeper, Ground-Truth Bug Evidence, The Iron Law TDD, & Terminal-Proven Verification).
---

# Universal Base Rule: Standar Rekayasa Perangkat Lunak SPOREPO

Sebagai AI Agent di lingkungan workstation ini, Anda **WAJIB MUTLAK** mematuhi 4 pilar rekayasa di bawah ini pada setiap penambahan fitur maupun perbaikan bug:

---

## 1. Dilarang Menambah Fitur Kompleks Tanpa Meta-Prompt di `docs/sporepo/reqs/`
- Setiap permintaan fitur baru atau perubahan arsitektural non-sepele harus memiliki dokumen spesifikasi di `docs/sporepo/reqs/XXX-nama-fitur.md` (buat via `npx sporepo req "Nama Fitur"`).
- Dokumen harus memuat pembagian tanggung jawab persona (@Backend, @Frontend, @QA, dll) serta batas kepemilikan file yang tegas.

---

## 2. Mandat Stop: Independent Reviewer Gatekeeper Barrier ⛔
- **DILARANG KERAS** menyentuh atau menulis kode implementasi sebelum fase audit Gatekeeper tuntas!
- Sebelum mulai koding, agen WAJIB mengidentifikasi potensi celah logika, dependensi rapuh, dan skenario edge cases.
- Jika ada hal yang belum jelas, ajukan pertanyaan simultan dalam 1 putaran kepada pengguna dan **TUNGGU persetujuan eksplisit pengguna (`APPROVED`)**.

---

## 3. The Iron Law: Investigasi Akar Masalah & TDD Sebelum Memperbaiki Bug
- Setiap perbaikan bug harus didasarkan pada dokumen bukti riil di `docs/sporepo/bugs/YYYY-MM-DD-nama-bug.md` (buat via `npx sporepo bug "Nama Bug"`), lengkap dengan perintah cURL riil dan payload error.
- **"NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST"**: Dilarang melakukan perbaikan tebak-tebakan (*symptom patching*).
- **Mandat TDD:** Agen WAJIB menulis skenario automated test yang sengaja **GAGAL** terlebih dahulu untuk membuktikan bug sebelum menulis kode perbaikan. Kode baru boleh diubah hanya setelah test gagal tersebut tercipta (*Red-Green-Refactor*).

---

## 4. Larangan Mengklaim Selesai Tanpa Bukti Log Terminal (*Terminal-Proven Verification*)
- Dilarang membuat pernyataan keberhasilan ("sudah selesai", "sudah lulus", "semua berjalan normal") tanpa menjalankan perintah pengujian di terminal (`npm test` atau test runner resmi).
- Bukti output log terminal dengan exit code 0 harus dilampirkan secara transparan sebelum menutup sesi atau tugas.
- Berkas yang telah `VERIFIED` dapat diarsipkan dengan `npx sporepo archive <id>` atau `npx sporepo archive --all-verified`.
