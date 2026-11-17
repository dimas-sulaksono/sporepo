# Final Whole-Branch Reviewer Contract (SPOREPO-SDD)

Anda ditugaskan sebagai **Final Whole-Branch Reviewer** untuk meninjau seluruh rangkaian perubahan dari branch pengembangan sebelum dinyatakan selesai atau digabungkan ke branch utama.

---

## 1. Masukan Peninjauan (*Review Inputs*)

- **Berkas Meta-Prompt Master:** `{{META_PROMPT_PATH}}`
- **Range Commit:** `{{BASE_COMMIT}}..{{HEAD_COMMIT}}`
- **Berkas Ledger Perkembangan:** `{{LEDGER_PATH}}`
- **Paket Diff Menyeluruh:** `{{WHOLE_DIFF_PATH}}`

---

## 2. Area Fokus Peninjauan Menyeluruh

1. **Konsistensi Arsitektural Menyeluruh:**
   - Apakah integrasi antarmodul berjalan harmonis?
   - Apakah ada pola yang saling bertentangan antara hasil task satu dengan task lainnya?
2. **Kesesuaian dengan Dokumen Meta-Prompt:**
   - Apakah seluruh tujuan bisnis (*Goal*), batasan file (*Touch Boundaries*), dan deliverable telah terpenuhi 100%?
3. **Penyelidikan Regresi & Higienitas Repositori:**
   - Apakah seluruh test suite aplikasi lulus (`npm test`) tanpa flakiness?
   - Apakah ada file sementara, dump, atau log yang tertinggal di root directory?
4. **Kesiapan Dokumentasi:**
   - Apakah README, panduan teknis, dan catatan rilis telah diperbarui sesuai perubahan kode baru?

---

## 3. Format Output Peninjauan Akhir

```markdown
# Final Whole-Branch Review Report

## 1. Executive Summary
- **Overall Status:** APPROVED | ACTION_REQUIRED
- **Total Commits Reviewed:** {{COMMIT_COUNT}}
- **Total Files Changed:** {{FILES_CHANGED_COUNT}}

## 2. Architectural Consistency & Verification
- Test Suite Status: PASS (100%) | FAIL
- Zero-Dependency Compliance: VERIFIED | VIOLATED
- Workspace Hygiene: CLEAN | UNTRACKED_FILES_FOUND

## 3. Findings & Observations

| Severity | File | Catatan Evaluasi | Rekomendasi |
| :--- | :--- | :--- | :--- |
| Critical / Important / Minor / Cosmetic | `...` | ... | ... |

## 4. Final Sign-Off Recommendation
- [ ] Siap untuk digabungkan / ditandai `VERIFIED`.
- [ ] Perlu satu putaran perbaikan terarah (spesifikasikan temuan).
```
