# Restart Development Server Script
# This script clears caches and restarts the dev server

Write-Host "🔄 Restarting Development Server..." -ForegroundColor Cyan
Write-Host ""

# Stop any running dev servers
Write-Host "1. Stopping any running dev servers..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*agridash*" } | Stop-Process -Force
Start-Sleep -Seconds 2

# Clear build cache
Write-Host "2. Clearing build cache..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
    Write-Host "   ✓ Removed dist folder" -ForegroundColor Green
}
if (Test-Path "node_modules/.vite") {
    Remove-Item -Path "node_modules/.vite" -Recurse -Force
    Write-Host "   ✓ Removed Vite cache" -ForegroundColor Green
}

Write-Host ""
Write-Host "3. Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANT: After the server starts:" -ForegroundColor Red
Write-Host "   1. Open your browser" -ForegroundColor White
Write-Host "   2. Press Ctrl+Shift+Delete" -ForegroundColor White
Write-Host "   3. Clear 'Cached images and files'" -ForegroundColor White
Write-Host "   4. OR press Ctrl+F5 to hard refresh" -ForegroundColor White
Write-Host ""

# Start dev server
npm run dev
