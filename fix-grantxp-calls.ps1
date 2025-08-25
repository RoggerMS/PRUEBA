# Script para corregir todas las llamadas a grantXP

# Buscar todos los archivos .tsx y .ts que contienen llamadas a grantXP
$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx", "*.ts" | Where-Object { $_.Name -ne "gamificationService.ts" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Patrón para encontrar llamadas a grantXP con 2 parámetros
    $pattern = 'gamificationService\.grantXP\(\s*(\d+)\s*,\s*([^)]+)\s*\)'
    
    if ($content -match $pattern) {
        Write-Host "Fixing grantXP calls in: $($file.FullName)"
        
        # Reemplazar las llamadas con los 5 parámetros requeridos
        $content = $content -replace $pattern, 'gamificationService.grantXP("user-id", $1, "manual", "settings", $2)'
        
        # Guardar el archivo si hubo cambios
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            Write-Host "Fixed: $($file.FullName)"
        }
    }
}

Write-Host "Completed fixing grantXP calls"