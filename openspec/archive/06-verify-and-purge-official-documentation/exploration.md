# Exploration Report: Official Documentation Verification & Purge

## 1. Overview
The goal of this exploration was to perform end-to-end ingestion validation of 3 official base documents:
- **Programa Analítico** (.docx)
- **PAC** (.xlsx)
- **Plan de Clases** (.xlsx)

The tests involved multipart POST requests against the following backend API endpoints:
- `http://localhost:8080/api/v1/office/import/programa-analitico`
- `http://localhost:8080/api/v1/office/import/pac`
- `http://localhost:8080/api/v1/office/import/plan-clase`

---

## 2. Findings

### 2.1. Ingestion Status
All three endpoints returned an `HTTP 200 OK` status. There were no hard errors, server crashes, or API validation rejections during the file parsing processes.

### 2.2. Programa Analítico (Word)
- **General Fields:** Extracted correctly (codigoAsignatura, nombreAsignatura, creditos, horasTeoricas, etc.).
- **Bibliography:** Extracted correctly (found 2 basic references and 4 complementary references).
- **Units & Temas (Issue):** The backend successfully identified the two learning units (e.g., "INTRODUCCION A LINGÜÍSTICA ORIGINARIA"), but it **failed to extract the internal topics/themes (`temas: []`)** and `saberesConceptuales` was returned as `null`.
  - *Cause:* The original Word document formats these themes as plain text paragraphs (e.g., `. CONCEPTOS DE LINGÜÍSTICA GENERAL.`) rather than utilizing structured tables or specific Word heading styles that the parser expects.

### 2.3. PAC (Excel)
- **General Fields:** Correctly captured `carrera`, `tipoCurso`, `modalidad`, etc.
- **Matriz 7 (Sessions):** Correctly extracted 39 sessions matching the structure of the Excel file. Details such as `semana`, `nroSesion`, `contenidoEspecifico`, `instrumentoEvaluacion`, and `saberConceptual` mapped appropriately without truncation.

### 2.4. Plan de Clases (Excel)
- **General Data:** Parsed correctly across the 6 sheets (`UA-1 Tema 1` to `UA-2 Tema 6`). 
- **Moments Extraction (Issue):** The `momentos` array (e.g., INTRODUCCION, RESULTADOS_LOGROS, CONTENIDOS) successfully extracted the long multiline content. However, the parser duplicates certain logical groupings. For instance, "2. RESULTADOS DE APRENDIZAJE / LOGROS ESPERADOS" is mapped to multiple entries in the array—some with actual duration and content, and others seemingly mapping to static header cells resulting in `duracionMin: 0`.

---

## 3. Affected Areas
- **Backend Office Importer:**
  - **Programa Analítico Parser:** The fallback for plain-text (non-table) paragraphs mapping to `temas` and `saberesConceptuales`.
  - **Plan de Clases Parser:** The logic reading the pedagogical phases (momentos) seems to be iterating over column headers or intermediate rows as actual moment activities.

---

## 4. Recommendations
1. **Enhance Word Parser Logic (Programa Analítico):** Update the parser to identify plain-text bullet points or paragraphs starting with `. ` as valid themes (`temas`) when a standard table format is absent. Alternatively, standardize the Word template to always use tables.
2. **Clean up Moments Extraction (Plan de Clases):** Refine the start/end bounds for parsing moments in the Plan de Clases script. Ignore rows that function strictly as headers within the pedagogical phase sections to prevent `duracionMin: 0` records.
3. **Data Integrity Checks:** Consider adding business validation checks that warn the user if a unit has an empty `temas` array, rather than failing silently, allowing them to fix the document before confirming import.
