# BUG REPORT: {{TITLE}}

> **Report ID:** `{{DATE}}-{{SLUG}}`  
> **Date:** {{DATE}}  
> **Status:** `OPEN` <!-- Options: OPEN | INVESTIGATING | TEST_WRITTEN | FIXED | VERIFIED -->  
> **Severity:** `Major` <!-- Options: Critical | Major | Minor | Cosmetic -->  
> **Environment:** `Staging` <!-- Options: Local | Development | Staging | Production -->  

---

## 1. Metadata Lingkungan Pengujian (*Test Environment Metadata*)

| Parameter | Nilai / Detail |
| :--- | :--- |
| **Reporter / Role** | QA / User / Developer |
| **Target Service / Endpoint** | `GET/POST https://...` |
| **Client / Device / OS** | macOS / Chrome v... / Mobile Android |
| **App Version / Git Commit** | `v...` / `sha:...` |

---

## 2. Bukti Nyata Pemanggilan (*Ground-Truth cURL Command*)

*Perintah cURL riil yang mereproduksi bug secara deterministik di terminal:*

```bash
curl -i -X POST 'https://api.example.com/v1/resource' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -d '{
    "field": "invalid_or_trigger_value"
  }'
```

---

## 3. Bukti Respons & Muatan Error (*Actual Error Payload*)

*Respons error aktual yang diterima dari server / sistem:*

- **HTTP Status Code:** `500 Internal Server Error` / `400 Bad Request`
- **Trace ID / Request ID:** `req-abc-123`
- **Response Body:**
```json
{
  "status": "error",
  "code": 500,
  "message": "Actual error message here",
  "stack": "Stack trace snippet if available"
}
```

---

## 4. Perilaku yang Diharapkan (*Expected Behavior*)

*Deskripsikan secara presisi apa yang seharusnya terjadi jika sistem berfungsi normal:*
- **Expected Status Code:** `200 OK` / `422 Unprocessable Entity` (dengan pesan validasi ramah pengguna)
- **Expected Response Body:**
```json
{
  "status": "success",
  "data": {}
}
```

---

## 5. Investigasi Sistematis (*Systematic Debugging Protocol*)

> [!IMPORTANT]
> **THE IRON LAW: NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST**
> Agen DILARANG KERAS langsung mengubah kode (symptom patching) sebelum menemukan akar penyebab masalah (*root cause*).

### Phase 1: Investigasi Akar Masalah (*Root Cause Discovery*)
- [ ] Analisis log server dan muatan cURL di atas.
- [ ] Lacak alur data dari controller $\rightarrow$ service $\rightarrow$ database/external call.
- [ ] Temukan baris kode spesifik dan kondisi pemicu bug.
- **Hasil Temuan Akar Masalah:**
  > *(Tuliskan temuan analisis akar masalah secara teknis di sini)*

### Phase 2: Isolasi Cacat Logika (*Defect Isolation*)
- Berkas yang bermasalah: `src/...` (baris: ...)
- Mengapa bug ini terjadi: ...

### Phase 3: Test-Driven Development (Tulis Failing Automated Test Dulu)
- [ ] Buat skenario pengujian baru yang mereproduksi input bug secara deterministik.
- Berkas test: `tests/...test.ts`
- Jalankan test dan buktikan test tersebut **GAGAL** karena bug ini (*RED* phase):
```text
<!-- Tempelkan output terminal saat test GAGAL di sini -->
```

### Phase 4: Perbaikan Minimal & Terarah (*Green Phase*)
- Terapkan perbaikan kode seminimal dan sebersih mungkin HANYA untuk menyelesaikan akar masalah tersebut.
- Jalankan kembali automated test hingga **LULUS** (*GREEN* phase):
```text
<!-- Tempelkan output terminal saat test LULUS di sini -->
```

---

## 6. Rencana & Bukti Uji Regresi (*Full Regression Pass & Terminal Proof*)

Sebelum menandai bug ini `VERIFIED`:

### A. Full Test Suite Command
```bash
npm test
```

### B. Bukti Output Terminal (*Zero Regression Proof*)
```text
<!-- Tempelkan bukti output seluruh test suite 100% lulus di sini -->
```

### C. Check-off Selesai
- [ ] Root cause telah didokumentasikan dengan jelas.
- [ ] Automated regression test telah ditambahkan ke test suite repositori.
- [ ] Perbaikan tidak menimbulkan breaking changes pada modul lain.
- [ ] Seluruh test suite aplikasi lulus 100%.
