# Referensi CLI sporepo

Panduan lengkap antarmuka baris perintah (**Command Line Interface / CLI**) **sporepo v1.1.0**.

---

## 1. Cara Eksekusi

```bash
# 1. Tanpa instalasi via NPX (Rekomendasi)
npx sporepo <command> [arguments] [options]

# 2. Instalasi global via NPM
npm install -g sporepo
sporepo <command> [arguments] [options]

# 3. Dari repositori lokal
node bin/sporepo.js <command> [arguments] [options]
```

---

## 2. Perintah CLI

### A. `sporepo init`
Menginisialisasi struktur repositori rekayasa sporepo pada direktori target.

```bash
npx sporepo init [target-dir] [-f]
```

| Opsi | Keterangan |
| :--- | :--- |
| `[target-dir]` | Direktori target inisialisasi (default: direktori aktif saat ini). |
| `-f`, `--force` | Timpa paksa berkas panduan dan `.sporepo/rule.md` jika sudah ada. |

**Struktur yang Dihasilkan:**
```text
target-dir/
├── docs/sporepo/
│   ├── reqs/          # Folder penampung Meta-Prompt fitur (XXX-nama-fitur.md)
│   ├── bugs/          # Folder penampung laporan temuan bug (YYYY-MM-DD-slug.md)
│   └── archive/       # Folder penampung item terverifikasi [VERIFIED]
└── .sporepo/
    └── rule.md        # Aturan kerja agen AI lokal repositori
```

---

### B. `sporepo req`
Membuat berkas Meta-Prompt fitur baru dengan penomoran urut otomatis 3-digit.

```bash
npx sporepo req "<Judul Fitur>" [-d <target-dir>]
```

| Opsi | Keterangan |
| :--- | :--- |
| `<"Judul Fitur">` | **Wajib.** Judul fitur yang akan di-slugify. |
| `-d`, `--dir <path>` | Direktori target repositori (default: direktori aktif). |

- **Output:** `docs/sporepo/reqs/XXX-slug-judul.md` (misal: `001-autentikasi-jwt.md`).
- **Penomoran:** Memindai nomor tertinggi di `reqs/` dan `archive/` lalu menambah 1 (`001`, `002`, `010`).

---

### C. `sporepo bug`
Membuat berkas laporan investigasi bug dengan tanggal ISO dan pencegahan tabrakan nama.

```bash
npx sporepo bug "<Judul Temuan Bug>" [-d <target-dir>]
```

| Opsi | Keterangan |
| :--- | :--- |
| `<"Judul Temuan">` | **Wajib.** Judul temuan bug yang akan di-slugify. |
| `-d`, `--dir <path>` | Direktori target repositori (default: direktori aktif). |

- **Output:** `docs/sporepo/bugs/YYYY-MM-DD-slug.md` (misal: `2026-11-17-login-401.md`).
- **Anti-Collision:** Menambahkan suffix counter otomatis jika nama bentrok (`-2.md`, `-3.md`).

---

### D. `sporepo check` (alias: `gatekeeper`)
Audit kematangan spesifikasi Meta-Prompt, deteksi celah logika, dan validasi barrier *User Sign-Off*.

```bash
npx sporepo check [file] [--all] [--json]
```

| Opsi | Keterangan |
| :--- | :--- |
| `[file]` | Path berkas Meta-Prompt spesifik (default: otomatis mencari `REVIEW_PENDING` terbaru). |
| `--all` | Pindai seluruh berkas Meta-Prompt aktif di dalam direktori `docs/sporepo/reqs/`. |
| `--json` | Cetak hasil evaluasi dan rekomendasi dalam format JSON (cocok untuk integrasi CI). |

- **Exit Code:** `0` jika spesifikasi matang (skor >= 95) dan disetujui (`APPROVED`), `1` jika belum disetujui atau memiliki celah kritis.

---

### E. `sporepo sdd`
Orkestrasi Subagent-Driven Development (SDD) dengan ledger pelacak commit dan brief terisolasi.

```bash
npx sporepo sdd <subcommand> [arguments]
```

| Sub-perintah | Sintaks | Keterangan |
| :--- | :--- | :--- |
| `init` | `npx sporepo sdd init <file.md>` | Inisiasi sesi SDD, catat base commit, dan buat buku besar `.scratch/sdd/XXX/ledger.md`. |
| `brief` | `npx sporepo sdd brief <file.md> <task-no>` | Ekstrak task brief terisolasi untuk implementer subagent ke `.scratch/sdd/XXX/task-N-brief.md`. |
| `pack` | `npx sporepo sdd pack <base-sha> [head-sha]` | Susun paket diff commit dan file changed untuk reviewer subagent. |
| `parse` | `npx sporepo sdd parse <file.md>` | Tampilkan ringkasan persona, touch boundaries, dan daftar task atomik. |

---

### F. `sporepo archive`
Memindahkan dokumen fitur atau bug yang telah selesai dan bertatus `VERIFIED` ke folder arsip.

```bash
npx sporepo archive <id | -a> [-d <target-dir>]
```

| Opsi | Keterangan |
| :--- | :--- |
| `<id>` | ID fitur 3-digit (misal: `001`) atau nama berkas spesifik yang akan diarsipkan. |
| `-a`, `--all-verified` | Pindai dan arsipkan seluruh dokumen di `reqs/` dan `bugs/` yang bertanda `[VERIFIED]`. |
| `-d`, `--dir <path>` | Direktori target repositori (default: direktori aktif). |

- **Output:** Berkas dipindahkan secara atomik ke `docs/sporepo/archive/` tanpa mengubah nama file.

---

### G. `sporepo migrate`
Memigrasikan struktur repositori lama (`prompts/request/` dan `tests/bugs/`) ke format `docs/sporepo/`.

```bash
npx sporepo migrate [target-dir]
```

| Opsi | Keterangan |
| :--- | :--- |
| `[target-dir]` | Direktori target migrasi (default: direktori aktif). |

- **Tindakan:** Memindahkan file fitur ke `docs/sporepo/reqs/`, file bug ke `docs/sporepo/bugs/`, dan memperbarui file konfigurasi secara aman tanpa kehilangan riwayat.

---

### H. `sporepo audit`
Memindai status kesehatan rekayasa, kelengkapan struktur, dan menghitung skor kepatuhan proyek.

```bash
npx sporepo audit [target-dir]
```

| Komponen Penilaian | Poin |
| :--- | :--- |
| Struktur folder `docs/sporepo/` lengkap (`reqs/`, `bugs/`, `archive/`) | 20 |
| Aturan lokal `.sporepo/rule.md` terpasang | 20 |
| Seluruh fitur aktif berstatus valid (`APPROVED` / `IN_PROGRESS` / `VERIFIED`) | 20 |
| Seluruh laporan bug memuat bukti cURL ground-truth | 20 |
| Tidak ada file `VERIFIED` yang tertunda diarsip | 20 |
| **Total Skor Kepatuhan Maksimal** | **100** |

---

## 3. Opsi Global & Exit Code

| Opsi Global | Keterangan |
| :--- | :--- |
| `-h`, `--help` | Menampilkan layar bantuan CLI dan daftar perintah. |
| `-v`, `--version` | Menampilkan versi pustaka `sporepo`. |

| Exit Code | Makna |
| :--- | :--- |
| `0` | Perintah sukses dieksekusi / Gatekeeper audit lolos. |
| `1` | Parameter tidak valid / Error I/O / Gatekeeper audit gagal (barrier aktif). |
