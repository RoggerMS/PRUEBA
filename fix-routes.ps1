# Script to fix Next.js 15 dynamic route parameters
# This script updates all route files to use async params pattern

$files = @(
    "app\api\workspace\blocks\[id]\route.ts",
    "app\api\workspace\kanban\cards\[id]\route.ts",
    "app\api\gamification\user\[userId]\progress\route.ts",
    "app\api\workspace\frases\items\[id]\route.ts",
    "app\api\notifications\[notificationId]\read\route.ts",
    "app\api\gamification\user\[userId]\badges\route.ts",
    "app\api\workspace\docs\pages\[id]\route.ts"
)

foreach ($file in $files) {
    $fullPath = Join-Path $PWD $file
    if (Test-Path $fullPath) {
        Write-Host "Processing: $file"
        $content = Get-Content $fullPath -Raw
        
        # Replace the old pattern with new async pattern
        $content = $content -replace '\{ params \}: \{ params: \{ (\w+): string \} \}', '{ params }: { params: Promise<{ $1: string }> }'
        
        # Add await params destructuring after function signature
        $content = $content -replace '(export async function \w+\([^)]+\) \{)', '$1`n  const { $1 } = await params;'
        
        # Replace params.paramName with paramName
        $content = $content -replace 'params\.(\w+)', '$1'
        
        Set-Content $fullPath $content
        Write-Host "Updated: $file"
    } else {
        Write-Host "File not found: $file"
    }
}

Write-Host "Route fixing completed!"