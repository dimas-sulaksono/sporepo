# Panduan Referensi CLI sporepo

Dokumen ini berisi spesifikasi lengkap antarmuka baris perintah (**Command Line Interface / CLI**) dari tool `sporepo`.

---

## 1. Instalasi & Eksekusi

### A. Eksekusi Langsung via NPX (Tanpa Instalasi Global)
```bash
npx sporepo <command> [arguments] [options]
```

### B. Instalasi Global via NPM
```bash
npm install -g sporepo
sporepo <command> [arguments] [options]
```

### C. Eksekusi dari Source Code Lokal
```bash
git clone git+https://github.com/dimas-sulaksono/sporepo.git
cd sporepo
npm install
npm run build
node bin/sporepo.js <command> [arguments] [options]
```

---

## 2. Perintah CLI

### A. `sporepo init`
Menginisialisasi struktur direktori rekayasa sporepo pada repositori target.

```bash
# Inisialisasi pada direktori aktif (current working directory)
npx sporepo init

# Inisialisasi pada direktori spesifik
npx sporepo init /path/to/target-project

# Inisialisasi paksa (menimpa README dan konfigurasi yang sudah ada)
npx sporepo init --force
```

**Struktur yang Dihasilkan:**
```text
target-project/
├── prompts/
│   ├── README.md               # Panduan siklus hidup feature request
│   └── request/                # Folder penampung berkas XXX-nama-fitur.md
├── tests/
│   └── bugs/
│       ├── README.md           # Panduan investigasi bug ground-truth
│       └── .gitkeep (jika kosong)
└── .sporepo/
    └── rule.md                 # Aturan baku agent AI lokal
```

**Opsi:**
- `-f`, `--force`: Menimpa file panduan `prompts/README.md`, `tests/bugs/README.md`, dan `.sporepo/rule.md` jika sudah ada.
- Exit code: `0` jika berhasil, `1` jika terjadi error I/O.

---

### B. `sporepo req`
Membuat dokumen Meta-Prompt fitur baru dengan penomoran urut otomatis 3-digit.

```bash
# Format dasar
npx sporepo req "<Judul Fitur>"

# Contoh nyata
npx sporepo req "Autentikasi JWT dan Refresh Token"

# Menentukan target repositori yang berbeda
npx sporepo req "Integrasi Payment Gateway" --dir /path/to/target-project
```

**Perilaku Auto-Increment:**
1. Memindai folder `prompts/request/` pada repositori target.
2. Mengekstrak angka prefix pada file yang ada (`001-*.md`, `002-*.md`, ...).
3. Mengambil angka tertinggi, menambahkan 1, dan memformat dengan padding 3 digit (`001`, `002`, `010`, `100`).
4. Jika folder kosong, penomoran dimulai dari `001`.
5. Judul dikonversi menjadi URL-safe kebab-case slug (misal: "Payment Gateway OVO & GoPay" menjadi `001-payment-gateway-ovo-gopay.md`).

**Output yang Terbentuk:**
- File: `prompts/request/XXX-slug-judul.md`.
- Memuat template spesifikasi dengan batasan persona dan Reviewer Gatekeeper checklist.

---

### C. `sporepo bug`
Membuat dokumen laporan investigasi bug dengan tanggal ISO dan slug judul.

```bash
# Format dasar
npx sporepo bug "<Judul Temuan Bug>"

# Contoh nyata
npx sporepo bug "Login 401 Gagal pada Endpoint Checkout"

# Menentukan target direktori spesifik
npx sporepo bug "Null Pointer Exception pada Token Parser" -d /path/to/project
```

**Perilaku & Pencegahan Tabrakan:**
1. Mengambil tanggal hari ini format `YYYY-MM-DD` (waktu lokal mesin).
2. Mengonversi judul bug menjadi kebab-case slug.
3. Menghasilkan nama berkas: `tests/bugs/YYYY-MM-DD-slug.md`.
4. Jika berkas dengan nama persis sama sudah ada pada hari yang sama, sistem menambahkan penomoran urut otomatis:
   - `tests/bugs/2026-11-17-slug.md` (pertama)
   - `tests/bugs/2026-11-17-slug-2.md` (kedua)
   - `tests/bugs/2026-11-17-slug-3.md` (ketiga)
5. Tidak ada risiko overwrite atau kehilangan catatan historis.

---

### D. `sporepo audit`
Memindai status kepatuhan rekayasa perangkat lunak pada repositori target.

```bash
# Audit pada repositori aktif
npx sporepo audit

# Audit pada repositori target lain
npx sporepo audit /path/to/project
```

**Kriteria Penilaian Skor Kepatuhan (0 - 100):**
- `+20 poin`: Direktori `prompts/request/` ditemukan.
- `+20 poin`: Direktori `tests/bugs/` ditemukan.
- `+20 poin`: Berkas aturan `.sporepo/rule.md` atau `.gemini/rules/sporepo.md` ditemukan.
- `+20 poin`: Seluruh fitur di `prompts/request/` telah disetujui (`APPROVED`) atau diverifikasi (`VERIFIED`).
- `+20 poin`: Seluruh laporan bug di `tests/bugs/` telah dilengkapi perintah cURL riil (Ground-Truth).

---

## 3. Opsi Global

| Opsi | Alias | Deskripsi |
| :--- | :--- | :--- |
| `--help` | `-h`, `help` | Menampilkan panduan bantuan CLI. |
| `--version` | `-v`, `version` | Menampilkan nomor versi sporepo aktif. |
| `--dir <path>` | `-d <path>` | Menentukan direktori repositori target secara eksplisit. |
| `--force` | `-f` | Memaksa penulisan ulang berkas saat inisialisasi. |
