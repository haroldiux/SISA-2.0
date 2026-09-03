# Technical Design: Official Documentation Verification & Purge

## 1. ProgramaAnaliticoDocxParser.java Algorithm Changes
To capture bulleted paragraphs as themes (`temas`):
1. **Define a new Regex Pattern**:
   Add `private static final java.util.regex.Pattern BULLET_TEMA_PATTERN = java.util.regex.Pattern.compile("^\\s*(?:[•*.-]|\\d+\\.)\\s+(.+)$");`
2. **Modify `extractDynamicUnidades`**:
   In the `else if` chain evaluating paragraphs:
   - Keep the existing `TEMA` explicit match logic.
   - Add a fallback condition: `else if (BULLET_TEMA_PATTERN.matcher(text).matches() && currentUnit != null)`.
   - If the fallback matches, extract the text group as `tituloTema`. Auto-increment `numTema` based on `currentUnit.getTemas().size() + 1`.
   - Instantiate and add `ScuTemaAnaliticoDto` just like explicit themes.

## 2. PlanesClaseExcelParser.java Algorithm Changes
To prevent empty header rows from becoming 0-duration moments:
1. **Modify `extractMomentos`**:
   Before adding the `ScuMomentoPedagogicoDto` to the `list`:
   - Inspect the extracted `actividad` string and `durStr`.
   - If `actividad.isEmpty()` and `durStr.isEmpty()`, consider the row a structural header and `continue` to skip it.
   - Additionally, check if `actividad` is a generic header like "Actividades del docente" or "Actividades del estudiante" and skip.
   - The fallback default duration assignment (e.g., 25, 100, 55 mins) should only apply if the row is deemed a valid moment row (e.g., `!actividad.isEmpty()`).

## 3. Purge Verification & Test Script
Create a shell or SQL script to reset the database tables involved in the import process. 
- **SQL Script (`purge_official_docs.sql`)**:
  ```sql
  DELETE FROM scu_tema_analitico;
  DELETE FROM scu_unidad_aprendizaje;
  DELETE FROM scu_bibliografia;
  DELETE FROM scu_programa_analitico;
  DELETE FROM scu_momento_pedagogico;
  DELETE FROM scu_plan_clase;
  ```
- **Test Script (`verify_and_purge.sh`)**:
  ```bash
  #!/bin/bash
  echo "Purging old data..."
  # psql -U sisa -d sisa_db -f purge_official_docs.sql
  
  echo "Running Ingestion Verification..."
  curl -X POST -F "file=@ProgramaAnalitico.docx" http://localhost:8080/api/v1/office/import/programa-analitico
  curl -X POST -F "file=@PlanClase.xlsx" http://localhost:8080/api/v1/office/import/plan-clase
  echo "Verification complete."
  ```

## 4. Integrity Validation (API Response)
Update the endpoints in `OfficeImportController` or the service layer to inspect the resulting `ScuProgramaAnaliticoRequest`.
- If `unidades` is empty or any unit has an empty `temas` array, append a warning message to a new `warnings` field in the API response or log a `WARN` level message in the backend console.
