# META-PROMPT: [{{ID}}] {{TITLE}}

> **Request ID:** {{ID}}  
> **Date:** {{DATE}}  
> **Status:** `DRAFT` <!-- Options: DRAFT | REVIEW_PENDING | APPROVED | IN_PROGRESS | VERIFIED -->  
> **Branch / Target:** `main`  
> **Target Scope:** {{TITLE}}  

---

## 1. Konteks Bisnis & Tujuan Fitur (*Problem & Goal*)
*Jelaskan latar belakang mengapa fitur ini dibutuhkan, masalah apa yang ingin diselesaikan, dan dampak positif terhadap pengguna/sistem.*

- **Latar Belakang:** 
- **Tujuan Utama (*Goal*):** 
- **Kriteria Keberhasilan (*Success Metrics*):** 

---

## 2. Matriks Persona & Pembagian Tanggung Jawab (*Multi-Persona Assignment*)

| Persona | Tanggung Jawab Spesifik | Batas Kepemilikan File (*File Ownership*) |
| :--- | :--- | :--- |
| **@Architect** | Desain arsitektur, pemilihan pola, kontrak data | `docs/`, `src/core/` |
| **@Backend** | Implementasi API, services, alur bisnis | `src/api/`, `src/services/` |
| **@Frontend** | Komponen UI, integrasi state, UX flow | `src/components/`, `src/views/` |
| **@Database** | Skema, migrasi, kueri aman (*anti-lock*) | `src/db/`, `migrations/` |
| **@Security** | Validasi input, sanitasi, auth & permissions | `src/middleware/`, `src/auth/` |
| **@QA** | Automated test suite, edge-cases verification | `tests/`, `e2e/` |

---

## 3. Batas Kepemilikan Berkas (*File Ownership & Touch Boundaries*)

- **Berkas yang Boleh Dibuat / Dimodifikasi (*Allowed Files*):**
  - `...`
- **Berkas yang DILARANG Disentuh / Diubah (*Restricted / Read-Only Files*):**
  - `...`
- **Deliverables yang Diharapkan:**
  1. ...
  2. ...

---

## 4. INDEPENDENT REVIEWER GATEKEEPER (STRICT BARRIER) ⛔

> [!CAUTION]
> **MANDAT STOP MUTLAK BAGI AI AGENT:**
> Agen **DILARANG KERAS** menyentuh atau menulis kode implementasi sebelum fase audit ini selesai dan disetujui!

### A. Audit Celah Spesifikasi & Edge Cases
Sebelum mulai mengimplementasikan, lakukan audit kritis terhadap aspek-aspek berikut:
1. **Celah Logika & Ambiguitas:** Apakah ada alur bisnis yang belum didefinisikan secara tuntas?
2. **Dampak Perubahan (*Breaking Changes*):** Apakah ada API kontrak atau struktur database lama yang berpotensi rusak?
3. **Penanganan Kasus Ekstrem (*Edge Cases*):** Bagaimana perilaku sistem saat jaringan timeout, input tak valid, atau concurrency tinggi?
4. **Keamanan & Validasi:** Apakah ada celah injeksi atau bypass autentikasi/otorisasi?

### B. Daftar Pertanyaan Keputusan untuk Pengguna (*Simultaneous Decision Round*)
*Jika ditemukan keraguan arsitektural atau celah spesifikasi, ajukan pertanyaan secara simultan dalam 1 putaran di bawah ini:*
- [ ] **Pertanyaan 1:** 
- [ ] **Pertanyaan 2:** 

### C. Konfirmasi Persetujuan Pengguna (*User Sign-Off*)
- [ ] **Status:** Disetujui oleh pengguna untuk mulai koding (`APPROVED`)
- **Catatan Persetujuan Pengguna:** *(Salin konfirmasi atau catatan spesifik dari pengguna di sini)*

---

## 5. Rencana Eksekusi Atomik (*Subagent-Driven Development / SDD*)

Pecah implementasi menjadi subtugas atomik independen. Setiap subtugas harus memiliki kriteria verifikasi yang jelas:

- [ ] **Task 1: [Nama Subtugas 1]**
  - **Fokus Persona:** `@Backend` / `@Architect`
  - **Aksi:** Buat / ubah berkas `...`
  - **Verifikasi Task:** `npm test tests/...` atau perintah terminal spesifik
- [ ] **Task 2: [Nama Subtugas 2]**
  - **Fokus Persona:** `@Frontend`
  - **Aksi:** Buat komponen `...`
  - **Verifikasi Task:** Verifikasi UI atau component test
- [ ] **Task 3: [Nama Subtugas 3 - Testing & Integrasi]**
  - **Fokus Persona:** `@QA`
  - **Aksi:** Tulis automated integration / end-to-end tests
  - **Verifikasi Task:** Seluruh skenario pengujian baru lulus

---

## 6. Protokol Verifikasi Akhir (*Verification Before Completion*)

Sebelum menandai request ini selesai (`VERIFIED`), seluruh kriteria di bawah ini WAJIB terpenuhi dengan bukti terminal:

### A. Terminal Command Verification
Jalankan dan pastikan 100% exit code 0:
```bash
# 1. Jalankan test suite
npm test

# 2. Type-check / Linting
npm run lint || npx tsc --noEmit
```

### B. Bukti Output Terminal (*Terminal Output Proof*)
```text
<!-- Tempelkan output log terminal yang membuktikan test suite 100% pass di sini -->
```

### C. Pembaruan Dokumentasi
- [ ] Dokumentasi arsitektur / API di Knowledge Base (`docs/` atau `README.md`) telah diperbarui.
