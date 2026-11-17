---
trigger: model_decision
description: Aturan rekayasa perangkat lunak SPOREPO (Meta-Prompting Gatekeeper, Ground-Truth Bug Evidence, Systematic Debugging, & Terminal Verification).
---

# SPOREPO: Aturan Rekayasa Perangkat Lunak AI Terstandar

Repositori ini menerapkan framework **sporepo**. Seluruh AI Agent yang bekerja di repositori ini **WAJIB MUTLAK** mematuhi 4 pilar di bawah ini:

---

## 1. Alur Fitur Baru: Meta-Prompt & Reviewer Gatekeeper ⛔
- **DILARANG** mengimplementasikan fitur non-sepele tanpa dokumen spesifikasi di `prompts/request/XXX-nama-fitur.md`.
- **MANDAT STOP (Reviewer Gatekeeper Barrier):** Sebelum menulis kode apa pun, agen WAJIB mengaudit celah logika, dependensi, dan edge cases pada spesifikasi. Ajukan pertanyaan keputusan kepada pengguna jika ada ambiguitas, dan **TUNGGU persetujuan pengguna** (`APPROVED`) sebelum mulai implementasi.

---

## 2. Alur Perbaikan Bug: Ground-Truth Evidence di `tests/bugs/`
- Setiap investigasi bug **WAJIB** memiliki dokumen bukti riil di `tests/bugs/YYYY-MM-DD-nama-bug.md`.
- Dokumen harus memuat bukti cURL nyata (*ground-truth*), kode error aktual, dan perilaku yang diharapkan.

---

## 3. The Iron Law: Investigasi Akar Masalah & TDD
- **"NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST"**
- Dilarang keras melakukan perbaikan coba-coba (*symptom patching* / *guesswork*).
- Agen **WAJIB** menulis automated test yang **GAGAL** terlebih dahulu untuk mereproduksi bug tersebut sebelum menyentuh kode perbaikan.
- Perbaiki kode hingga test lulus (*Red-Green-Refactor*).

---

## 4. Bukti Konkret Terminal (*Verification Before Completion*)
- **DILARANG** mengklaim bahwa tugas telah "selesai", "lulus", atau "bekerja dengan baik" tanpa menjalankan perintah pengujian di terminal (`npm test` atau runner terkait).
- Bukti log terminal nyata dengan exit code 0 harus dilampirkan sebelum menutup task.
