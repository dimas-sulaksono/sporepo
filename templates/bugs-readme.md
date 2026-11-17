# tests/bugs: Direktori Laporan Bukti Bug & Regresi

Direktori ini menyimpan seluruh catatan investigasi bug riil menggunakan metodologi **sporepo**.

## Struktur Berkas
Setiap berkas dinamai dengan format tanggal ISO dan slug:
`tests/bugs/YYYY-MM-DD-nama-bug.md` (contoh: `2026-11-17-auth-401-unauthorized.md`).

## Alur Kerja Investigasi (*The Iron Law*)
```
[OPEN] -> [INVESTIGATING] -> [TEST_WRITTEN (Failing Test / RED)] -> [FIXED (GREEN)] -> [VERIFIED]
```

1. **Catat Laporan Bug Baru:**
   ```bash
   npx sporepo bug "Nama Bug Anda"
   ```
2. **Lengkapi Bukti Konkret (*Ground-Truth*):**
   - Masukkan perintah cURL yang dapat dijalankan langsung di terminal.
   - Masukkan muatan error aktual dan perilaku yang diharapkan.
3. **Systematic Debugging & TDD:**
   - Telusuri akar masalah (*root cause*) sebelum mengubah kode perbaikan.
   - Tulis failing automated test yang membuktikan bug.
   - Perbaiki kode hingga test lulus.
4. **Full Regression Pass:**
   - Jalankan seluruh rangkaian test suite repositori (`npm test`).
   - Lampirkan bukti log terminal sebelum menutup laporan.
