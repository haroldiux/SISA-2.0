# Implementation Tasks: Official Documentation Verification & Purge

## Phase 1: Enhance ProgramaAnaliticoDocxParser.java (bullet/paragraph theme extraction)
- [x] Add `BULLET_TEMA_PATTERN` regex to `ProgramaAnaliticoDocxParser.java`.
- [x] Update `extractDynamicUnidades` logic to check `BULLET_TEMA_PATTERN.matcher(text).matches()` as a fallback when identifying themes.
- [x] Extract matched text as `tituloTema` and append as `ScuTemaAnaliticoDto`.
- [x] Implement validation in the service layer or `OfficeImportController` to issue a warning/log when `temas` array is empty.

## Phase 2: Refine PlanesClaseExcelParser.java (moment header filtering)
- [x] Modify `extractMomentos` in `PlanesClaseExcelParser.java` to skip rows where both `actividad` and `durStr` are empty.
- [x] Add checks to skip generic headers like "Actividades del docente" or "Actividades del estudiante".
- [x] Ensure default duration assignment only applies to valid moment rows.

## Phase 3: Round-trip verification test of the 3 official documents
- [x] Create test script `verify_and_purge.sh`.
- [x] Add `curl` POST requests to the verification script to ingest Programa Analítico, PAC, and Plan de Clases test documents.

## Phase 4: Clean-slate purge implementation & verification
- [x] Create SQL purge script `purge_official_docs.sql` to truncate/delete records from `scu_tema_analitico`, `scu_unidad_aprendizaje`, `scu_bibliografia`, `scu_programa_analitico`, `scu_momento_pedagogico`, and `scu_plan_clase`.
- [x] Integrate the execution of `purge_official_docs.sql` into the beginning of `verify_and_purge.sh` to ensure a clean slate before ingestion tests.

## Phase 5: Rebuild & deploy backend and frontend containers
- [x] Rebuild backend container to include the updated parsers and validation logic.
- [x] Redeploy backend container.
- [x] Ensure frontend and backend integration works properly in the containerized environment.
