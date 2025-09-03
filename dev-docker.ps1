# Script de PowerShell para ejecutar CRUNEVO en modo desarrollo con Docker
# Uso: .\dev-docker.ps1 [comando]
# Comandos disponibles: up, down, logs, restart, build, clean

param(
    [Parameter(Position=0)]
    [string]$Command = "up"
)

$ComposeFile = "docker-compose.dev.yml"
$ProjectName = "crunevo-dev"

function Show-Help {
    Write-Host "CRUNEVO - Modo Desarrollo con Docker" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Comandos disponibles:" -ForegroundColor Yellow
    Write-Host "  up       - Iniciar todos los servicios en modo desarrollo" -ForegroundColor White
    Write-Host "  down     - Detener todos los servicios" -ForegroundColor White
    Write-Host "  logs     - Ver logs de la aplicación" -ForegroundColor White
    Write-Host "  restart  - Reiniciar la aplicación" -ForegroundColor White
    Write-Host "  build    - Reconstruir la imagen de la aplicación" -ForegroundColor White
    Write-Host "  clean    - Limpiar volúmenes y contenedores" -ForegroundColor White
    Write-Host "  help     - Mostrar esta ayuda" -ForegroundColor White
    Write-Host ""
    Write-Host "Ejemplos:" -ForegroundColor Yellow
    Write-Host "  .\dev-docker.ps1 up" -ForegroundColor Cyan
    Write-Host "  .\dev-docker.ps1 logs" -ForegroundColor Cyan
    Write-Host "  .\dev-docker.ps1 down" -ForegroundColor Cyan
}

function Start-DevEnvironment {
    Write-Host "Iniciando CRUNEVO en modo desarrollo..." -ForegroundColor Green
    Write-Host "Archivo de configuracion: $ComposeFile" -ForegroundColor Yellow
    Write-Host ""
    
    # Verificar si el archivo .env existe
    if (-not (Test-Path ".env")) {
        Write-Host "Archivo .env no encontrado. Creando desde .env.example..." -ForegroundColor Yellow
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Host "Archivo .env creado desde .env.example" -ForegroundColor Green
        } else {
            Write-Host "No se encontro .env.example. Por favor, crea un archivo .env manualmente." -ForegroundColor Red
            return
        }
    }
    
    docker-compose -f $ComposeFile -p $ProjectName up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Servicios iniciados correctamente!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Aplicacion: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "pgAdmin: http://localhost:8080" -ForegroundColor Cyan
        Write-Host "PostgreSQL: localhost:5432" -ForegroundColor Cyan
        Write-Host "Redis: localhost:6379" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Para ver los logs: .\dev-docker.ps1 logs" -ForegroundColor Yellow
        Write-Host "Para detener: .\dev-docker.ps1 down" -ForegroundColor Yellow
    }
}

function Stop-DevEnvironment {
    Write-Host "Deteniendo servicios de desarrollo..." -ForegroundColor Yellow
    docker-compose -f $ComposeFile -p $ProjectName down
    Write-Host "Servicios detenidos" -ForegroundColor Green
}

function Show-Logs {
    Write-Host "Mostrando logs de la aplicacion..." -ForegroundColor Yellow
    Write-Host "Presiona Ctrl+C para salir" -ForegroundColor Gray
    Write-Host ""
    docker-compose -f $ComposeFile -p $ProjectName logs -f app
}

function Restart-App {
    Write-Host "Reiniciando aplicacion..." -ForegroundColor Yellow
    docker-compose -f $ComposeFile -p $ProjectName restart app
    Write-Host "Aplicacion reiniciada" -ForegroundColor Green
}

function Build-App {
    Write-Host "Reconstruyendo imagen de la aplicacion..." -ForegroundColor Yellow
    docker-compose -f $ComposeFile -p $ProjectName build app
    Write-Host "Imagen reconstruida" -ForegroundColor Green
}

function Clean-Environment {
    Write-Host "Limpiando entorno de desarrollo..." -ForegroundColor Yellow
    docker-compose -f $ComposeFile -p $ProjectName down -v --remove-orphans
    docker system prune -f
    Write-Host "Entorno limpiado" -ForegroundColor Green
}

# Ejecutar comando
switch ($Command.ToLower()) {
    "up" { Start-DevEnvironment }
    "down" { Stop-DevEnvironment }
    "logs" { Show-Logs }
    "restart" { Restart-App }
    "build" { Build-App }
    "clean" { Clean-Environment }
    "help" { Show-Help }
    default {
        Write-Host "Comando no reconocido: $Command" -ForegroundColor Red
        Write-Host ""
        Show-Help
    }
}