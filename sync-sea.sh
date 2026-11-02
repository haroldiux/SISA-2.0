#!/usr/bin/env bash
# ==============================================================================
# SISA 2.0 — Sincronización Oficial con el Servidor Central SEA (UNITEPC)
# Universidad Técnica Privada Cosmos (UNITEPC)
# Arquitectura: SISA consume directamente del Gateway Central (SSOT)
# ==============================================================================

set -e

BRANCH_OFFICE="${1:-CBA}"
TERM="${2:-2-2026}"

echo -e "\033[1;36m==========================================================\033[0m"
echo -e "\033[1;36m SISA 2.0: Sincronización en Vivo desde Gateway SEA UNITEPC\033[0m"
echo -e "\033[0;37m Gateway Central: https://gw-dev.unitepc.solutions\033[0m"
echo -e "\033[1;36m==========================================================\033[0m"

# 1. Comprobar si el backend responde
BACKEND_STATUS_URL="http://localhost:8080/api/v1/catalogo-academico/status"
if ! curl -s -f "$BACKEND_STATUS_URL" > /dev/null 2>&1; then
    echo -e "\033[1;33m[!] Backend SISA no responde en http://localhost:8080\033[0m"
    echo -e "\033[1;33m[*] Iniciando servicios con docker compose up -d...\033[0m"
    docker compose up -d
    echo -e "\033[1;33m[*] Esperando 10 segundos a que Spring Boot inicialice...\033[0m"
    sleep 10
fi

# 2. Ejecutar Sincronización Activa
SYNC_URL="http://localhost:8080/api/v1/catalogo-academico/sync?branchOfficeCode=${BRANCH_OFFICE}&term=${TERM}"
echo -e "\033[1;33m[*] Conectando con el Gateway SEA (Sede: ${BRANCH_OFFICE}, Gestión: ${TERM})...\033[0m"
echo -e "\033[0;37m    Descargando Sedes, Carreras, Materias, Grupos, Aulas, Horarios y Docentes...\033[0m"

RESPONSE=$(curl -s -X POST "$SYNC_URL" || true)

if echo "$RESPONSE" | grep -q '"status":"success"'; then
    echo ""
    echo -e "\033[1;32m==========================================================\033[0m"
    echo -e "\033[1;32m ¡SINCRONIZACIÓN EXITOSA DESDE EL SERVIDOR CENTRAL SEA!\033[0m"
    echo -e "\033[1;32m==========================================================\033[0m"
    echo -e "\033[1;37mDetalle de la sincronización:\033[0m"
    echo "$RESPONSE"
    echo ""
else
    echo -e "\033[1;31m[X] No se pudo completar la sincronización automática:\033[0m"
    echo "$RESPONSE"
    echo ""
    echo -e "\033[1;33mSi estás trabajando sin conexión a internet o el servidor central está en mantenimiento,\033[0m"
    echo -e "\033[1;33mpuedes recurrir al espejo local de respaldo ejecutando: ./seed-db.sh\033[0m"
fi

echo -e "\033[1;36mAcceso al Sistema Web: http://localhost:4200\033[0m"
echo -e "\033[1;36m==========================================================\033[0m"
