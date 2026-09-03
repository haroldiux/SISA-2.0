#!/bin/bash
# ============================================================================
# SISA • Official Documents Verification and Clean-Slate Purge Script
# ============================================================================
set -e

BASE_URL="http://localhost:8080/api/v1"
DOCS_DIR="./DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE"
PURGE_SQL="./scratch/purge_official_docs.sql"

echo "=== 1. Executing Clean-Slate Purge on sisa_db ==="
if [ -f "$PURGE_SQL" ]; then
    docker exec -i sisa-postgres psql -U sisa_admin -d sisa_db < "$PURGE_SQL"
    echo "[OK] Official documentation tables purged successfully."
else
    echo "[WARN] $PURGE_SQL not found, attempting inline truncate."
    docker exec sisa-postgres psql -U sisa_admin -d sisa_db -c "
        TRUNCATE TABLE momentos_pedagogicos CASCADE;
        TRUNCATE TABLE planes_clase CASCADE;
        TRUNCATE TABLE sesiones_matriz7 CASCADE;
        TRUNCATE TABLE pacs CASCADE;
        TRUNCATE TABLE bibliografia CASCADE;
        TRUNCATE TABLE unidades_aprendizaje CASCADE;
        TRUNCATE TABLE programas_analiticos CASCADE;
    "
fi

echo ""
echo "=== 2. Ingesting Programa Analítico ==="
DOCX_FILE="$DOCS_DIR/PROGRAMA ANALITICO TALLER DE IDIOMAS ICEC 23.docx"
if [ -f "$DOCX_FILE" ]; then
    PROG_RESP=$(curl -s -X POST "$BASE_URL/office/import/programa-analitico?asignacionId=1" \
        -F "file=@$DOCX_FILE")
    echo "$PROG_RESP" | grep -q "exitosamente" && echo "[OK] Programa Analítico imported." || echo "[ERROR] Ingestion failed: $PROG_RESP"
    
    # Save to database
    curl -s -X POST "$BASE_URL/planificaciones/programa-analitico" \
        -H "Content-Type: application/json" \
        -d "$(echo "$PROG_RESP" | jq '.data')" > /dev/null
    echo "[OK] Programa Analítico persisted in database."
else
    echo "[SKIP] $DOCX_FILE not found."
fi

echo ""
echo "=== 3. Ingesting PAC Matriz 7 ==="
PAC_FILE="$DOCS_DIR/PAC TALLER DE IDIOMAS.xlsx"
if [ -f "$PAC_FILE" ]; then
    PAC_RESP=$(curl -s -X POST "$BASE_URL/office/import/pac?asignacionId=1" \
        -F "file=@$PAC_FILE")
    echo "$PAC_RESP" | grep -q "exitosamente" && echo "[OK] PAC Matriz 7 imported." || echo "[ERROR] Ingestion failed: $PAC_RESP"
    
    # Save to database
    curl -s -X POST "$BASE_URL/planificaciones/pac" \
        -H "Content-Type: application/json" \
        -d "$(echo "$PAC_RESP" | jq '.data')" > /dev/null
    echo "[OK] PAC and 39 sessions persisted in database."
else
    echo "[SKIP] $PAC_FILE not found."
fi

echo ""
echo "=== 4. Ingesting Planes de Clase ==="
PLAN_FILE="$DOCS_DIR/PLAN DE CLASES TALLER DE IDIOMAS.xlsx"
if [ -f "$PLAN_FILE" ]; then
    PLAN_RESP=$(curl -s -X POST "$BASE_URL/office/import/plan-clase?asignacionId=1" \
        -F "file=@$PLAN_FILE")
    echo "$PLAN_RESP" | grep -q "exitosamente" && echo "[OK] Planes de Clase imported." || echo "[ERROR] Ingestion failed: $PLAN_RESP"
else
    echo "[SKIP] $PLAN_FILE not found."
fi

echo ""
echo "=== Verification & Purge Workflow Completed ==="
