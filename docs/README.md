# Dokumentasi Teknis sporepo

Selamat datang di direktori dokumentasi teknis resmi proyek **sporepo**. Direktori ini memuat spesifikasi arsitektur, panduan CLI, prosedur rilis, dan catatan spesifikasi awal.

---

## Indeks Dokumentasi

| Dokumen | Deskripsi |
| :--- | :--- |
| **[architecture.md](architecture.md)** | Arsitektur teknis framework, pembagian modul, zero-dependency design, dan sistem template. |
| **[cli-reference.md](cli-reference.md)** | Spesifikasi lengkap antarmuka baris perintah (`init`, `req`, `bug`, `sdd`, `audit`), argumen, opsi, dan exit code. |
| **[sdd-orchestration.md](sdd-orchestration.md)** | Panduan orkestrasi Subagent-Driven Development (SDD), Conductor protocol, brief extraction, dan review pack. |
| **[packaging-and-release.md](packaging-and-release.md)** | Panduan pengemasan paket NPM, matriks CI GitHub Actions, verifikasi tarball, dan prosedur tagging rilis. |

---

## Verifikasi Cepat

Untuk memverifikasi fungsionalitas seluruh sistem secara lokal:

```bash
# 1. Jalankan test suite
npm test

# 2. Verifikasi CLI lokal
node bin/sporepo.js --help
node bin/sporepo.js --version

# 3. Uji simulasi paket
npm pack --dry-run
```
