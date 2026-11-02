# ==============================================================================
# SISA 2.0 — Script de Inicialización y Re-Siembra de Base de Datos (Seeder)
# Universidad Técnica Privada Cosmos (UNITEPC)
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " SISA 2.0: Inicializando Seeder Universal Portatil (V9/V10)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Verificar si el contenedor postgres esta activo
$pgContainer = docker ps --filter "name=sisa-postgres" --filter "status=running" --format "{{.Names}}"
if (-not $pgContainer) {
    Write-Host "[!] El contenedor sisa-postgres no esta corriendo." -ForegroundColor Yellow
    Write-Host "[*] Intentando levantar los servicios con Docker Compose..." -ForegroundColor Yellow
    docker compose up -d postgres
    Start-Sleep -Seconds 4
}

# 2. Re-verificar estado
$pgContainer = docker ps --filter "name=sisa-postgres" --filter "status=running" --format "{{.Names}}"
if (-not $pgContainer) {
    Write-Host "[X] ERROR: No se pudo conectar con el contenedor sisa-postgres." -ForegroundColor Red
    Write-Host "    Asegurate de que Docker Desktop este abierto y ejecutandose." -ForegroundColor Red
    exit 1
}

Write-Host "[*] Contenedor PostgreSQL detectado: $pgContainer" -ForegroundColor Green

# 3. Ejecutar migracion / seeder V9
$v9Path = "sisa-backend/src/main/resources/db/migration/V9__portable_demo_seeder.sql"
if (Test-Path $v9Path) {
    Write-Host "[*] Sembrando datos maestros, usuarios y materias (V9)..." -ForegroundColor Yellow
    Get-Content $v9Path -Raw | docker exec -i sisa-postgres psql -U sisa_admin -d sisa_db
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[✓] Seeder V9 ejecutado con exito." -ForegroundColor Green
    } else {
        Write-Host "[!] Advertencia durante ejecucion de V9 (posibles duplicados normales en upsert)." -ForegroundColor Yellow
    }
} else {
    Write-Host "[X] Archivo $v9Path no encontrado." -ForegroundColor Red
}

# 4. Ejecutar migracion V10 (5 momentos pedagogicos)
$v10Path = "sisa-backend/src/main/resources/db/migration/V10__secuencia_didactica_cinco_momentos.sql"
if (Test-Path $v10Path) {
    Write-Host "[*] Verificando columnas de los 5 momentos didacticos (V10)..." -ForegroundColor Yellow
    Get-Content $v10Path -Raw | docker exec -i sisa-postgres psql -U sisa_admin -d sisa_db
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[✓] Migracion V10 verificada." -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " ¡BASE DE DATOS SEMBRADA Y LISTA PARA EVALUACION DIRECTIVA!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Credenciales disponibles:" -ForegroundColor Cyan
Write-Host "  1. Director de Carrera (Evaluador):" -ForegroundColor White
Write-Host "     Usuario: dir.carrera.sis" -ForegroundColor Yellow
Write-Host "     Clave:   Unitepc2026!" -ForegroundColor Yellow
Write-Host "  2. Docente Oficial (Programacion I / III):" -ForegroundColor White
Write-Host "     Usuario: 3065087" -ForegroundColor Yellow
Write-Host "     Clave:   3065087" -ForegroundColor Yellow
Write-Host "  3. Administrador Nacional:" -ForegroundColor White
Write-Host "     Usuario: admin" -ForegroundColor Yellow
Write-Host "     Clave:   Unitepc2026!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Acceso Web: http://localhost:4200" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
