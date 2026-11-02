#!/usr/bin/env bash
# ==============================================================================
# SISA 2.0 — Script de Inicialización y Re-Siembra de Base de Datos (Seeder)
# Universidad Técnica Privada Cosmos (UNITEPC)
# ==============================================================================

set -e

echo -e "\033[1;36m==========================================================\033[0m"
echo -e "\033[1;36m SISA 2.0: Inicializando Seeder Universal Portátil (V9/V10)\033[0m"
echo -e "\033[1;36m==========================================================\033[0m"

# 1. Verificar si sisa-postgres esta activo
if ! docker ps --filter "name=sisa-postgres" --filter "status=running" --format "{{.Names}}" | grep -q "sisa-postgres"; then
    echo -e "\033[1;33m[!] El contenedor sisa-postgres no está corriendo.\033[0m"
    echo -e "\033[1;33m[*] Levantando contenedor postgres con docker compose...\033[0m"
    docker compose up -d postgres
    sleep 4
fi

echo -e "\033[1;32m[*] Contenedor PostgreSQL detectado.\033[0m"

# 2. Ejecutar Seeder V9
V9_FILE="sisa-backend/src/main/resources/db/migration/V9__portable_demo_seeder.sql"
if [ -f "$V9_FILE" ]; then
    echo -e "\033[1;33m[*] Sembrando datos maestros, usuarios y materias (V9)...\033[0m"
    docker exec -i sisa-postgres psql -U sisa_admin -d sisa_db < "$V9_FILE"
    echo -e "\033[1;32m[✓] Seeder V9 ejecutado con éxito.\033[0m"
fi

# 3. Ejecutar Migracion V10
V10_FILE="sisa-backend/src/main/resources/db/migration/V10__secuencia_didactica_cinco_momentos.sql"
if [ -f "$V10_FILE" ]; then
    echo -e "\033[1;33m[*] Verificando columnas de los 5 momentos didácticos (V10)...\033[0m"
    docker exec -i sisa-postgres psql -U sisa_admin -d sisa_db < "$V10_FILE"
    echo -e "\033[1;32m[✓] Migración V10 verificada.\033[0m"
fi

echo ""
echo -e "\033[1;32m==========================================================\033[0m"
echo -e "\033[1;32m ¡BASE DE DATOS SEMBRADA Y LISTA PARA EVALUACIÓN DIRECTIVA!\033[0m"
echo -e "\033[1;32m==========================================================\033[0m"
echo -e "\033[1;37mCredenciales disponibles:\033[0m"
echo -e "  \033[1;33m1. Director de Carrera (Evaluador):\033[0m dir.carrera.sis / Unitepc2026!"
echo -e "  \033[1;33m2. Docente Oficial (Programación):\033[0m  3065087 / 3065087"
echo -e "  \033[1;33m3. Administrador Nacional:\033[0m          admin / Unitepc2026!"
echo ""
echo -e "\033[1;36mAcceso Web: http://localhost:4200\033[0m"
echo -e "\033[1;36m==========================================================\033[0m"
