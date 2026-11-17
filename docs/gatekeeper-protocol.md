# Protokol Gatekeeper & Audit Spesifikasi

Doktrin audit celah spesifikasi adversial, gerbang keputusan simultan, dan linter **sporepo-gatekeeper**.

---

## 1. Doktrin Gatekeeper (*Strict Barrier*)

> [!CAUTION]
> AI Agent **DILARANG KERAS** menulis kode implementasi sebelum spesifikasi diaudit menggunakan 5 lensa dan disetujui secara resmi oleh pengguna (*User Sign-Off*).  
> *"Ambiguitas yang diselesaikan di spesifikasi memakan waktu 5 menit. Ambiguitas saat koding memicu refactor berjam-jam, context pollution, dan regresi sistem."*

---

## 2. Lima Lensa Audit Adversial

Setiap berkas Meta-Prompt di `docs/sporepo/reqs/` wajib diaudit menggunakan 5 lensa berikut:

| Lensa Audit | Target Pemeriksaan | Fokus Pertanyaan Kritis |
| :--- | :--- | :--- |
| **1. Logika & Cakupan** | Problem statement, goals, success metrics | Apakah tujuan terukur objektif? Bagaimana perilaku saat input kosong atau parameter salah? |
| **2. Batasan Dependensi** | Kepatuhan Zero-Dependency Core | Apakah implementer tergoda menambah library baru? Apakah ada dependensi tersembunyi ke tool OS non-cross-platform? |
| **3. Risiko Regresi** | Kompatibilitas mundur (backward-compatibility) | Apakah syntax CLI atau format lama rusak? Apakah ada jalur migrasi data? |
| **4. Integritas State** | Konkurensi & penamaan file | Apakah ada risiko tabrakan nama file (*collision*)? Apakah operasi penulisan file bersifat atomik? |
| **5. Batas File (Touch)** | Section 3 (*Allowed* vs *Restricted Files*) | Apakah batasan file cukup ketat? Apakah ada file krusial yang rawan tersentuh tanpa izin? |

---

## 3. Gerbang Keputusan Simultan (*Single-Round Decision Gate*)

> [!IMPORTANT]
> **Larangan Interupsi Berulang:** Agen dilarang bertanya mencicil satu per satu. Seluruh pertanyaan keputusan wajib dikumpulkan sekaligus dalam 1 putaran terstruktur dengan rekomendasi jelas di opsi pertama `(Rekomendasi)`.

### Format Standar Pertanyaan Keputusan
```markdown
### ⛔ Gatekeeper Audit Findings & Simultaneous Decision Questions

- [ ] **Pertanyaan 1 (<Topik>):**
  - **Pilihan A (Rekomendasi):** <Solusi optimal berbasis arsitektur>.
  - **Pilihan B:** <Alternatif kompromi>.
- [ ] **Pertanyaan 2 (<Topik>):**
  - **Pilihan A (Rekomendasi):** ...
  - **Pilihan B:** ...
```

---

## 4. CLI Linter: `sporepo check` & `gatekeeper`

Validator deterministik untuk mengukur kematangan spesifikasi Meta-Prompt:

```bash
# Audit berkas spesifik
npx sporepo check docs/sporepo/reqs/006-nama-fitur.md

# Auto-discovery: Otomatis mendeteksi berkas REVIEW_PENDING terbaru
npx sporepo check

# Audit seluruh berkas di docs/sporepo/reqs/
npx sporepo check --all

# Output format JSON untuk CI Pipeline
npx sporepo check --json docs/sporepo/reqs/006-nama-fitur.md
```

### Model Skor Kematangan (0 - 100 Poin)

| Komponen Evaluasi | Bobot | Kriteria Lolos |
| :--- | :--- | :--- |
| **Header Metadata** | 10 | Format ID 3-digit, title, status valid (`REVIEW_PENDING`, `APPROVED`, dst.). |
| **Section 1: Problem & Goal** | 15 | Latar belakang, problem statement, sasaran kuantitatif. |
| **Section 2: Multi-Persona** | 15 | Minimal 2 persona terdefinisi beserta batas kepemilikan. |
| **Section 3: Touch Boundaries** | 15 | Allowed Files, Restricted Files, dan Deliverables terdaftar. |
| **Section 4: Gatekeeper Barrier** | 20 | Checklist audit, pertanyaan keputusan, blok `User Sign-Off`. |
| **Section 5: Atomic Tasks (SDD)** | 15 | Rencana tugas atomik dengan persona, aksi, dan kriteria verifikasi. |
| **Section 6: Terminal Verification**| 10 | Blok perintah terminal copy-pasteable untuk membuktikan hasil. |

- **Exit Code `0`:** Skor >= 70, 0 temuan CRITICAL, status disetujui (`APPROVED` / `VERIFIED`).
- **Exit Code `1`:** Dokumen berstatus `REVIEW_PENDING`, terdapat temuan CRITICAL, atau format rusak.

---

## 5. Diagram Siklus Hidup Spesifikasi

```mermaid
flowchart LR
    A["DRAFT (npx sporepo req)"] --> B["REVIEW_PENDING (npx sporepo check)"]
    B --> C["Simultaneous Decision Round (User Sign-Off)"]
    C --> D["APPROVED (Siap Koding)"]
    D --> E["IN_PROGRESS (npx sporepo sdd)"]
    E --> F["VERIFIED (npx sporepo archive)"]
    F --> G["ARCHIVED"]
```
