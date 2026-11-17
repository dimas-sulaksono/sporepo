---
name: sporepo-gatekeeper
description: Adversarial Specification Gatekeeper for SPOREPO. Audits technical specifications, Meta-Prompts, or RFCs for hidden assumptions, logic gaps, fragile dependencies, breaking change risks, and edge cases before coding starts. Formulates structured single-round simultaneous decision questions with recommendations. Triggered by "audit spesifikasi ini", "gatekeeper review", "sporepo-gatekeeper", "/sporepo-gatekeeper", "cek celah spesifikasi", or before executing Section 5.
---

# Global Skill: SPOREPO-GATEKEEPER (Adversarial Specification Gatekeeper)

## 1. Doktrin & Mandat Mutlak (*The Gatekeeper Doctrine*)

> [!CAUTION]
> **MANDAT STOP MUTLAK BAGI AI AGENT:**  
> AI Agent **DILARANG KERAS** menyentuh atau menulis kode implementasi sebelum fase audit Gatekeeper selesai dan disetujui pengguna!  
> *"Ambiguitas yang ditemukan pada spesifikasi membutuhkan 5 menit perbaikan; ambiguitas yang baru disadari saat koding memicu refactor berjam-jam, context pollution, dan regresi sistem."*

`sporepo-gatekeeper` bertindak sebagai auditor independen yang meneliti draf spesifikasi teknis (Meta-Prompt) secara adversial untuk memastikan rencana rekayasa bebas dari celah logika, dependensi rapuh, dan risiko breaking changes sebelum diserahkan ke agen pelaksana.

---

## 2. Alur Kerja Gatekeeper (*The 4-Step Gatekeeper Workflow*)

```
[Draf Meta-Prompt] 
       ↓
(Langkah 1: CLI Linter) → npx sporepo check <file>
       ↓
(Langkah 2: Audit 5 Lensa) → Bedah celah logika, dependensi, regresi, konkurensi, keamanan
       ↓
(Langkah 3: Decision Gate) → Ajukan SEMUA pertanyaan ambigu dalam 1 putaran simultan
       ↓
(Langkah 4: User Sign-Off) → Status: APPROVED → Handoff ke sporepo-sdd
```

### Langkah 1: Validasi Struktural Cepat (*CLI Linter Check*)
Jalankan linter deterministik bawaan sporepo:
```bash
# Audit spesifikasi file tertentu
npx sporepo check docs/sporepo/reqs/XXX-nama-fitur.md

# Atau audit otomatis berkas berstatus REVIEW_PENDING terbaru
npx sporepo check
```
CLI akan memverifikasi kelengkapan seksi:
- **Header:** ID 3 digit, Judul, dan Status.
- **Section 1:** Problem Statement, Goal terukur, dan Success Metrics objektif.
- **Section 2:** Matriks pembagian tanggung jawab persona (@Architect, @Backend, @QA, dll).
- **Section 3:** Touch boundaries tegas (Allowed Files, Restricted Files, dan Deliverables).
- **Section 4:** Gatekeeper barrier dan blok persetujuan pengguna (*User Sign-Off*).
- **Section 5:** Rencana eksekusi atomik (Task 1, Task 2, dll).
- **Section 6:** Protokol verifikasi akhir terminal (exit code 0).

---

### Langkah 2: Bedah Adversial dengan 5 Lensa Kritis (*The 5 Audit Lenses*)

Gunakan template kontrak `templates/gatekeeper/spec-audit-prompt.md` dan teliti:
1. **Lensa 1: Celah Logika Bisnis & Kejelasan Cakupan (*Business Logic & Scope*)**
   - Apakah ada happy-path bias? Bagaimana penanganan data kosong, timeout, atau kegagalan jaringan?
   - Apakah tujuan fitur terukur atau ambigu?
2. **Lensa 2: Batasan Dependensi & Integrasi (*Dependency Boundaries*)**
   - Apakah spesifikasi mematuhi aturan **Zero Runtime Dependencies**?
   - Apakah ada utilitas tersembunyi yang tidak portabel di lintas OS (macOS/Linux/Windows)?
3. **Lensa 3: Risiko Breaking Changes & Kompatibilitas (*Breaking Changes*)**
   - Apakah ada perubahan flag/argumen CLI, struktur direktori, atau skema data yang merusak fungsi lama?
   - Apakah alur migrasi aman terhadap data historis?
4. **Lensa 4: Konkurensi & Integritas State (*Concurrency & Edge Cases*)**
   - Apakah ada potensi tabrakan nama file (*collision*), race conditions, atau path traversal?
5. **Lensa 5: Keamanan, Validasi & Batas File (*Security & Touch Boundaries*)**
   - Apakah file yang boleh disentuh (*Allowed*) terlalu longgar?
   - Apakah file yang dilarang disentuh (*Restricted*) berpotensi terlanggar oleh task di Section 5?

---

### Langkah 3: Gerbang Keputusan Simultan Satu Putaran (*Single-Round Decision Gate*) ⛔

> [!IMPORTANT]
> **Larangan Ping-Pong Interaktif:**  
> Dilarang keras bertanya satu per satu secara mencicil yang menginterupsi pengguna berkali-kali.  
> Jika ditemukan keraguan arsitektural atau pilihan teknis, **kumpulkan SELURUH pertanyaan sekaligus ke dalam 1 putaran pilihan terstruktur**.

**Format Standar Pertanyaan:**
1. Masalah/risiko konkret jika tidak diputuskan.
2. Opsi pilihan terstruktur saling eksklusif.
3. Opsi pertama diawali `(Rekomendasi)` beserta alasan teknisnya.

Contoh penyajian:
```markdown
### ⛔ Gatekeeper Audit Findings & Simultaneous Decision Questions

Ditemukan 2 poin keputusan arsitektural yang perlu disepakati sebelum koding dimulai:

1. **Pertanyaan 1 (Strategi Penanganan Collision File):**
   - A. (Rekomendasi) Tolak operasi dan minta flag `--force` agar data pengguna tidak tertimpa tanpa sengaja.
   - B. Buat file baru otomatis dengan suffix nomor auto-increment.
   - C. Timpa langsung tanpa notifikasi.

2. **Pertanyaan 2 (Penamaan Perintah CLI):**
   - A. (Rekomendasi) Perintah utama `sporepo gatekeeper` dengan alias `sporepo check`.
   - B. Hanya `sporepo check` tanpa alias.
```

---

### Langkah 4: Tanda Tangan Pengguna & Transisi Status (*User Sign-Off*)

Setelah pengguna memberikan jawaban/konfirmasi:
1. Perbarui Section 4B dengan jawaban pengguna.
2. Centang blok tanda tangan di Section 4C:
   ```markdown
   ### C. Konfirmasi Persetujuan Pengguna (*User Sign-Off*)
   - [x] **Status:** Disetujui oleh pengguna untuk mulai koding (`APPROVED`)
   - **Catatan Persetujuan Pengguna:** Pengguna mengonfirmasi opsi A untuk pertanyaan 1 & 2.
   ```
3. Ubah header dokumen: `> **Status:** APPROVED`.
4. Barrier terbuka! Lakukan serah terima (*handoff*) ke **`sporepo-sdd`** untuk mengeksekusi Task 1:
   ```bash
   npx sporepo sdd init docs/sporepo/reqs/XXX-nama-fitur.md
   ```

---

## 3. Ringkasan Perintah CLI Pembantu

| Perintah | Deskripsi |
| :--- | :--- |
| `npx sporepo check [file]` | Linter cepat audit spesifikasi Meta-Prompt |
| `npx sporepo gatekeeper [file]` | Nama lengkap identik dengan `sporepo check` |
| `npx sporepo check --all` | Audit seluruh berkas Meta-Prompt aktif di proyek |
| `npx sporepo check --json` | Keluarkan hasil audit dalam format JSON untuk CI |
