# ==============================================================================
# SISA 2.0 — Sincronización Oficial con el Servidor Central SEA (UNITEPC)
# Universidad Técnica Privada Cosmos (UNITEPC)
# Arquitectura: SISA consume directamente del Gateway Central (SSOT)
# ==============================================================================

param(
    [string]$BranchOffice = "CBA",
    [string]$Term = "2-2026"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " SISA 2.0: Sincronización en Vivo desde Gateway SEA UNITEPC" -ForegroundColor Cyan
Write-Host " Gateway Central: https://gw-dev.unitepc.solutions" -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Comprobar si el backend de SISA está respondiendo en el puerto 8080
$backendUrl = "http://localhost:8080/api/v1/catalogo-academico/status"
$backendRunning = $false

try {
    $statusCheck = Invoke-RestMethod -Uri $backendUrl -Method Get -TimeoutSec 3 -ErrorAction Stop
    if ($statusCheck) {
        $backendRunning = $true
        Write-Host "[*] Backend SISA en línea (Estado Gateway: $($statusCheck.status))" -ForegroundColor Green
    }
} catch {
    $backendRunning = $false
}

if (-not $backendRunning) {
    Write-Host "[!] El backend SISA no está respondiendo en http://localhost:8080" -ForegroundColor Yellow
    Write-Host "[*] Verificando contenedores con Docker Compose..." -ForegroundColor Yellow
    
    $container = docker ps --filter "name=sisa-backend" --filter "status=running" --format "{{.Names}}"
    if (-not $container) {
        Write-Host "[*] Iniciando servicios con docker compose up -d..." -ForegroundColor Yellow
        docker compose up -d
        Write-Host "[*] Esperando 10 segundos a que Spring Boot inicialice..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    }
}

# 2. Ejecutar Sincronización Activa desde el SEA
$syncUrl = "http://localhost:8080/api/v1/catalogo-academico/sync?branchOfficeCode=$BranchOffice&term=$Term"
Write-Host ""
Write-Host "[*] Conectando con el Gateway SEA (Sede: $BranchOffice, Gestión: $Term)..." -ForegroundColor Yellow
Write-Host "    Descargando Sedes, Carreras, Materias del Pensum, Grupos, Aulas, Horarios y Docentes..." -ForegroundColor DarkGray

try {
    $syncResponse = Invoke-RestMethod -Uri $syncUrl -Method Post -TimeoutSec 30 -ErrorAction Stop
    
    if ($syncResponse.status -eq "success") {
        Write-Host ""
        Write-Host "==========================================================" -ForegroundColor Green
        Write-Host " ¡SINCRONIZACIÓN EXITOSA DESDE EL SERVIDOR CENTRAL SEA!" -ForegroundColor Green
        Write-Host "==========================================================" -ForegroundColor Green
        Write-Host "  • Fuente:                $($syncResponse.source)" -ForegroundColor White
        Write-Host "  • Sede Sincronizada:     $($syncResponse.branchOfficeCode)" -ForegroundColor White
        Write-Host "  • Periodo Académico:     $($syncResponse.term)" -ForegroundColor White
        Write-Host "  • Sedes en Espejo:       $($syncResponse.sedesSynced)" -ForegroundColor Green
        Write-Host "  • Carreras Actualizadas: $($syncResponse.carrerasSynced)" -ForegroundColor Green
        Write-Host "  • Materias del Pensum:   $($syncResponse.materiasSynced)" -ForegroundColor Green
        Write-Host "  • Grupos y Horarios:     $($syncResponse.gruposSynced)" -ForegroundColor Green
        Write-Host "  • Docentes Aprovisionados: $($syncResponse.docentesProvisioned)" -ForegroundColor Green
        Write-Host "==========================================================" -ForegroundColor Green
    } else {
        Write-Host "[!] Respuesta de sincronización: $($syncResponse.message)" -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "[X] ERROR AL CONTACTAR EL BACKEND O GATEWAY: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Guía de Diagnóstico:" -ForegroundColor Yellow
    Write-Host " 1. Verifica si tienes conexión a internet para alcanzar https://gw-dev.unitepc.solutions" -ForegroundColor White
    Write-Host " 2. Si el servidor central de UNITEPC está en mantenimiento o estás en un entorno aislado (offline):" -ForegroundColor White
    Write-Host "    Puedes utilizar el espejo local de respaldo ejecutando:" -ForegroundColor Cyan
    Write-Host "    powershell -ExecutionPolicy Bypass -File .\seed-db.ps1" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Acceso al Sistema Web: http://localhost:4200" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
