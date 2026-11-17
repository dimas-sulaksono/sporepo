# Protokol Gatekeeper & Audit Spesifikasi Adversial (SPOREPO-GATEKEEPER)

Dokumen ini mendefinisikan standar operasional baku bagi AI Agent dan perekayasa sistem dalam melakukan audit celah spesifikasi teknis (Meta-Prompt) sebelum menulis satu baris kode pun.

---

## 1. Doktrin & Filosofi Adversial (*The Gatekeeper Doctrine*)

> [!CAUTION]
> **MANDAT STOP MUTLAK BAGI AI AGENT:**  
> AI Agent **DILARANG KERAS** menyentuh atau menulis kode implementasi sebelum fase audit Gatekeeper selesai dan disetujui pengguna!  
> *"Ambiguitas yang ditemukan pada spesifikasi membutuhkan 5 menit perbaikan. Ambiguitas yang baru disadari saat koding memicu refactor berjam-jam, context pollution, dan regresi sistem."*

### Mengapa Audit Harus Adversial?
Model AI generatif secara bawaan memiliki *happy-path bias*—cenderung mengasumsikan segala skenario input valid, dependensi tersedia, dan lingkungan selalu ideal. Doktrin Adversarial Gatekeeper memaksa agen bertindak sebagai peninjau kritis yang secara aktif mencari titik kegagalan, asumsi tersembunyi, dan inkonsistensi arsitektur.

---

## 2. Lima Lensa Audit Adversial (*The 5 Audit Lenses*)

Setiap dokumen Meta-Prompt di `docs/sporepo/reqs/` wajib dibedah menggunakan 5 lensa berikut:

```
                  ┌─────────────────────────────────────────┐
                  │       5 Lensa Audit Gatekeeper          │
                  └────────────────────┬────────────────────┘
                                       │
     ┌─────────────────┬───────────────┼───────────────┬─────────────────┐
     ▼                 ▼               ▼               ▼                 ▼
[1. Logika Bisnis] [2. Dependensi] [3. Regresi] [4. Konkurensi]   [5. Keamanan & Batas]
 (Scope & Goals)  (Zero-Dep Purity)(Breaking Chg)(Collisions/Race) (Touch Boundaries)
```

### Lensa 1: Celah Logika Bisnis & Kejelasan Cakupan (*Business Logic & Scope Clarity*)
- **Target Pemeriksaan:** Apakah Problem Statement, Goal, dan Success Metrics terukur objektif?
- **Poin Kritis:** Hindari tujuan abstrak seperti *"memperbaiki performa"* atau *"membuat kode lebih rapi"*. Wajib ada batasan kuantitatif (contoh: *"latensi < 200ms"*, *"0 penambahan package"*).
- **Penanganan Kasus Kosong:** Bagaimana perilaku sistem bila input kosong, file tidak ada, atau parameter salah?

### Lensa 2: Batasan Dependensi & Integrasi (*Dependency & Integration Boundaries*)
- **Target Pemeriksaan:** Kepatuhan terhadap mandat **100% Zero Runtime Dependencies** (`dependencies: {}` pada `package.json`).
- **Poin Kritis:** Apakah implementer tergoda menambahkan library eksternal? Apakah ada dependensi tersembunyi ke tool OS yang tidak cross-platform (misal skrip bash yang gagal di Windows Command Prompt)?

### Lensa 3: Risiko Breaking Changes & Kompatibilitas (*Breaking Changes & Regression Risks*)
- **Target Pemeriksaan:** Kompatibilitas terhadap pemanggilan CLI, argumen, flag, atau format data lama.
- **Poin Kritis:** Apakah perintah lama tetap berfungsi? Apakah ada migrasi struktur folder yang harus ditangani secara aman dengan fallback?

### Lensa 4: Konkurensi, Integritas State & Edge Cases (*Concurrency, State Integrity & Edge Cases*)
- **Target Pemeriksaan:** Tabrakan nama file (*filename collision*), race conditions, dan batasan memori.
- **Poin Kritis:** Bagaimana jika dua fitur atau bug dibuat pada hari yang sama dengan slug serupa? Apakah operasi file bersifat atomik?

### Lensa 5: Keamanan, Validasi & Batas File (*Security, Validation & Touch Boundaries*)
- **Target Pemeriksaan:** Batas kepemilikan file (*Touch Boundaries*) pada Section 3.
- **Poin Kritis:**
  - Apakah daftar berkas *Allowed Files* terlalu luas (misal wildcard `src/**`)?
  - Apakah berkas penting terdaftar di *Restricted Files* agar tidak disentuh implementer tanpa izin?
  - Apakah ada risiko path traversal (`../`) atau evaluasi kode dinamis?

---

## 3. Gerbang Keputusan Simultan Satu Putaran (*Single-Round Decision Gate*) ⛔

> [!IMPORTANT]
> **Larangan Ping-Pong Interaktif:**  
> Agen dilarang keras bertanya satu per satu secara mencicil yang menginterupsi pengguna berulang kali.  
> Jika ditemukan celah spesifikasi atau pilihan arsitektur, **seluruh pertanyaan WAJIB dikumpulkan sekaligus dalam 1 putaran terstruktur**.

### Format Standar Pertanyaan Keputusan
Setiap butir pertanyaan wajib menyertakan:
1. **Pernyataan Masalah/Celah:** Mengapa hal ini perlu diputuskan sekarang.
2. **Opsi Pilihan Terstruktur:** Opsi pilihan yang konkret dan saling eksklusif.
3. **Prefix Rekomendasi:** Rekomendasi teknis terbaik diletakkan di opsi pertama diawali `(Rekomendasi)`.

#### Contoh Nyata:
```markdown
### ⛔ Gatekeeper Audit Findings & Simultaneous Decision Questions

Ditemukan 2 poin keputusan arsitektural yang perlu disepakati sebelum koding dimulai:

1. **Pertanyaan 1 (Format Pertanyaan Keputusan):**  
   Apakah Anda setuju jika saat `sporepo-gatekeeper` menemukan celah, pertanyaan keputusan disajikan dalam format Multiple Choice dengan rekomendasi jelas di opsi pertama?  
   - A. (Rekomendasi) Ya, opsi terstruktur memudahkan keputusan sekaligus dalam 1 putaran.  
   - B. Tidak, gunakan pertanyaan terbuka teks bebas.

2. **Pertanyaan 2 (Nama Perintah CLI & Alias):**  
   Apakah Anda setuju perintah CLI utama dinamai `npx sporepo gatekeeper <file>` dengan alias praktis `npx sporepo check <file>`?  
   - A. (Rekomendasi) Ya, deskriptif sekaligus cepat diketik.  
   - B. Hanya gunakan nama gatekeeper tanpa alias.
```

---

## 4. Perkakas CLI Linter: `sporepo check` & `sporepo gatekeeper`

SPOREPO menyediakan validator otomatis deterministik untuk memeriksa kelengkapan Meta-Prompt sebelum diajukan ke pengguna atau diproses oleh agen.

### Penggunaan CLI:
```bash
# 1. Audit berkas spesifikasi tertentu
npx sporepo check docs/sporepo/reqs/005-nama-fitur.md

# 2. Audit berkas menggunakan alias nama lengkap
npx sporepo gatekeeper docs/sporepo/reqs/005-nama-fitur.md

# 3. Auto-Discovery: Otomatis mendeteksi berkas REVIEW_PENDING terbaru
npx sporepo check

# 4. Audit seluruh berkas Meta-Prompt aktif di repositori
npx sporepo check --all

# 5. Keluarkan output dalam format JSON untuk CI Pipeline
npx sporepo check --json docs/sporepo/reqs/005-nama-fitur.md
```

### Model Penilaian Kematangan (*Scoring Model* - 0 hingga 100 Poin):
- **Header Metadata (10 Poin):** ID 3 digit terstruktur, judul resmi, status dokumen.
- **Section 1: Problem & Goal (15 Poin):** Latar belakang masalah, tujuan objektif, dan metrik keberhasilan.
- **Section 2: Multi-Persona Matrix (15 Poin):** Minimal 2 persona (@Architect/@Backend dan @QA).
- **Section 3: Touch Boundaries (15 Poin):** Allowed Files, Restricted Files, dan Deliverables terdefinisi.
- **Section 4: Gatekeeper Barrier (20 Poin):** Checklist 5 lensa, pertanyaan simultan, dan blok tanda tangan persetujuan pengguna (*User Sign-Off*).
- **Section 5: Atomic Tasks / SDD Plan (15 Poin):** Subtugas atomik dengan persona, aksi, dan verifikasi konkret.
- **Section 6: Terminal Verification Protocol (10 Poin):** Blok perintah terminal pengujian nyata.

### Exit Codes:
- `0`: Dokumen memenuhi syarat (`score >= 70`, 0 temuan CRITICAL, dan status telah `APPROVED` / `VERIFIED`).
- `1`: Dokumen belum disetujui, terdapat temuan CRITICAL, atau berkas tidak ditemukan.

---

## 5. Integrasi Siklus Hidup (*Lifecycle Integration*)

```
[ DRAFT ] 
    ↓  (npx sporepo req "Nama Fitur")
[ REVIEW_PENDING ] 
    ↓  (npx sporepo check & audit 5 lensa)
[ Simultaneous Decision Round ] → Pengguna konfirmasi ("1 Ya, 2 Ya")
    ↓
[ APPROVED ] 
    ↓  (npx sporepo sdd init docs/sporepo/reqs/XXX.md)
[ IN_PROGRESS ] 
    ↓  (Subagent-Driven Development: task-by-task + dual review)
[ VERIFIED ] 
    ↓  (npx sporepo archive XXX)
[ ARCHIVED ]
```
