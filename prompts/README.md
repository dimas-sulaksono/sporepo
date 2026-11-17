# prompts/request: Direktori Meta-Prompt Fitur

Direktori ini menyimpan seluruh spesifikasi teknis fitur baru (*Feature Requests*) menggunakan metodologi **sporepo**.

## Struktur Berkas
Setiap file menggunakan penomoran otomatis 3 digit:
`prompts/request/XXX-nama-fitur.md` (contoh: `001-autentikasi-jwt.md`, `002-payment-gateway.md`).

## Alur Kerja Rekayasa (*Lifecycle*)
```
[DRAFT] -> [REVIEW_PENDING (Audit Gatekeeper)] -> [APPROVED] -> [IN_PROGRESS (SDD)] -> [VERIFIED]
```

1. **Buat Permintaan Baru:**
   ```bash
   npx sporepo req "Nama Fitur Anda"
   ```
2. **Reviewer Gatekeeper Audit:**
   - Agen atau reviewer memeriksa kelengkapan persona, celah edge cases, dan meminta persetujuan pengguna.
   - Dilarang menulis kode sebelum status disetujui (`APPROVED`).
3. **Subagent-Driven Development (SDD):**
   - Implementasikan tugas secara atomik task-by-task.
4. **Verifikasi Terminal:**
   - Jalankan automated test dan lampirkan bukti log terminal sebelum menandai `VERIFIED`.
