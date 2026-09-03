# Proposal: Official Documentation Verification & Purge (06-verify-and-purge-official-documentation)

## Intent
Improve the reliability of official document ingestion (Programa Analítico, PAC, and Plan de Clases) by enhancing the parsers to handle non-standard text structures and eliminating duplicate or empty header extractions.

## Scope
### In Scope
- Update Word parser for *Programa Analítico* to extract plain-text themes (`temas`) and conceptual knowledge (`saberesConceptuales`).
- Refine Excel parser for *Plan de Clases* to accurately detect moment boundaries and ignore structural header rows.
- Implement business validation warnings for incomplete extractions (e.g., empty `temas` arrays).

### Out of Scope
- Complete redesign of the official document templates.
- Modifications to the PAC parser (currently functioning as expected).

## Approach
1. **Programa Analítico Parser Enhancements:** Modify the Word document parsing logic to recognize regex patterns (like bullet points or specific paragraph start characters) as themes when standard tables are missing.
2. **Plan de Clases Parser Refinement:** Adjust the bounding logic when traversing Excel cells. Add conditions to ignore rows serving as pedagogical phase headers (which currently produce 0-duration moments).
3. **Integrity Validation:** Add a warning mechanism on the backend API response to flag when expected data fields (e.g., `temas`) are null or empty, rather than returning a silent success.

## Affected Areas
- Backend Office Importer for Programa Analítico (`api/v1/office/import/programa-analitico`)
- Backend Office Importer for Plan de Clases (`api/v1/office/import/plan-clase`)

## Risks
- Relaxed parsing rules or new regex patterns might break ingestion for documents that previously worked perfectly, especially if text formats vary widely.

## Rollback Plan
- Revert backend parser changes via Git to the previous stable state if ingestion regressions are detected.

## Success Criteria
- Ingestion of *Programa Analítico* correctly populates `temas` and `saberesConceptuales` without requiring manual document structure modification.
- Ingestion of *Plan de Clases* extracts distinct moments without duplicating sections or including 0-duration header rows.
- Incomplete extractions (e.g., empty `temas`) return an appropriate validation warning.
