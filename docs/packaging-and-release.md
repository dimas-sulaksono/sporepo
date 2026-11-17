# Panduan Packaging, CI, & Rilis sporepo

Dokumen ini menjelaskan proses pengemasan paket NPM, konfigurasi Continuous Integration (CI), pengujian otomatis, dan tahapan rilis open-source untuk **sporepo**.

---

## 1. Spesifikasi Distribusi & Packaging NPM

Untuk menjaga ukuran paket seringan mungkin dan mencegah file pengujian atau dokumentasi internal terdistribusi ke konsumen library, sporepo menggunakan kebijakan **Lean NPM Packaging Whitelist**.

### A. Whitelist Berkas (`package.json`)
```json
"files": [
  "bin",
  "dist/src",
  "templates",
  "rules",
  "skills",
  "README.md",
  "LICENSE"
]
```

### B. Hasil Audit Isolasi Paket (`npm pack --dry-run`)
Uji kompresi tarball memastikan isolasi ketat terhadap berkas yang tidak dibutuhkan:
- Direktori `src/` (kode sumber mentah TS) **tidak disertakan**.
- Direktori `tests/` dan artefak kompilasi test `dist/tests/` **tidak disertakan**.
- Direktori `docs/` (dokumentasi internal/spesifikasi) **tidak disertakan**.

**Metrik Ukuran Paket v1.0.0:**
- Unpacked Size: `~44.8 kB`
- Tarball Compressed Size: `~12.8 kB` (jauh di bawah batas target `25 kB`)
- Total Berkas Terdistribusi: `21 file`

---

## 2. GitHub Actions CI Matrix

Sistem pengujian otomatis berjalan di GitHub Actions pada setiap event `push` ke branch `main` dan pembuatan `pull_request`.

**Lokasi Workflow:** `.github/workflows/ci.yml`

### A. Matriks Lingkungan
- **Operating System:** `ubuntu-latest`
- **Node.js Versions:** `18.x`, `20.x`, `22.x`

### B. Urutan Langkah CI (*Pipeline Steps*)
1. **Checkout Repository:** `actions/checkout@v4`
2. **Setup Node.js & NPM Cache:** `actions/setup-node@v4` dengan opsi `cache: 'npm'`
3. **Instalasi Bersih (*Clean Install*):** `npm ci`
4. **Kompilasi TypeScript:** `npm run build`
5. **Eksekusi Test Suite:** `npm test`
6. **Verifikasi Binary CLI:**
   ```bash
   node bin/sporepo.js --version
   node bin/sporepo.js --help
   ```

---

## 3. Prosedur Rilis & Tagging Versi

### A. Verifikasi Pra-Rilis Lokal
Sebelum melakukan rilis atau pembuatan git tag baru, jalankan siklus pengujian penuh:

```bash
# 1. Bersihkan build dan compile ulang
rm -rf dist/
npm run build

# 2. Jalankan seluruh test suite (unit, integration, edge-cases)
npm test

# 3. Verifikasi ukuran paket npm
npm pack --dry-run
```

### B. Git Tagging & Push ke Remote
Setiap rilis versi stabil ditandai dengan Git annotated tag:

```bash
# Tandai tag versi
git tag -a v1.0.0 -m "Release sporepo v1.0.0"

# Push branch main beserta tags ke GitHub
git push -u origin main --tags
```

### C. Publikasi ke NPM Registry
*(Dijalankan oleh maintainer setelah rilis GitHub dikonfirmasi)*:

```bash
# Login ke NPM jika belum terautentikasi
npm login

# Publikasikan paket publik
npm publish --access public
```
