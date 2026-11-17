# Panduan Packaging, CI, & Rilis sporepo

Spesifikasi pengemasan paket NPM, Continuous Integration (CI), dan prosedur rilis **sporepo v1.1.0**.

---

## 1. Spesifikasi Distribusi NPM

Paket menggunakan whitelist ketat pada `package.json` untuk menjamin hanya artefak runtime yang didistribusikan:

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

### Isolasi Berkas (Zero Artifact Leak)
- **Dikecualikan:** `src/` (kode sumber TypeScript mentah), `tests/` dan `dist/tests/`, `docs/`, `.github/`, dan `.scratch/`.
- **Target Ukuran Tarball:** `< 25 kB` (aktual: `~13.4 kB` terkompresi).
- **Runtime Dependencies:** 0 dependensi eksternal (`dependencies: {}`).

---

## 2. GitHub Actions CI Pipeline

Setiap event `push` dan `pull_request` pada branch `main` dievaluasi melalui `.github/workflows/ci.yml`.

| Parameter | Konfigurasi |
| :--- | :--- |
| **Runner OS** | `ubuntu-latest` |
| **Matriks Node.js** | `18.x`, `20.x`, `22.x` |
| **Urutan Langkah** | 1. `actions/checkout@v4`<br>2. `actions/setup-node@v4` (cache npm)<br>3. `npm ci`<br>4. `npm run build`<br>5. `npm test`<br>6. Verifikasi biner CLI: `node bin/sporepo.js --version` |

---

## 3. Checklist Eksekusi Rilis Produksi

Langkah konkret pra-rilis dan publikasi versi baru:

```bash
# 1. Bersihkan build & kompilasi ulang TypeScript
rm -rf dist/
npm run build

# 2. Jalankan seluruh unit & integration tests (48 tests)
npm test

# 3. Verifikasi integritas tarball distribusi
npm pack --dry-run

# 4. Buat Git tag rilis teranotasi
git tag -a v1.1.0 -m "Release sporepo v1.1.0"
git push origin main --tags

# 5. Publikasikan ke NPM Registry (hanya maintainer)
npm publish --access public
```
