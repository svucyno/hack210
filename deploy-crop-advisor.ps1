#!/usr/bin/env pwsh
# Deploy Crop Advisor Edge Function to Supabase

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploying Crop Advisor Edge Function" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
Write-Host "Checking Supabase CLI..." -ForegroundColor Yellow
$supabaseVersion = npx supabase --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Supabase CLI not found!" -ForegroundColor Red
    Write-Host "Install it with: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}
Write-Host "Supabase CLI found: $supabaseVersion" -ForegroundColor Green
Write-Host ""

# Check if logged in
Write-Host "Checking Supabase login status..." -ForegroundColor Yellow
$loginStatus = npx supabase projects list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in to Supabase!" -ForegroundColor Red
    Write-Host "Logging in..." -ForegroundColor Yellow
    npx supabase login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Login failed!" -ForegroundColor Red
        exit 1
    }
}
Write-Host "Logged in successfully!" -ForegroundColor Green
Write-Host ""

# Link to project
Write-Host "Linking to Supabase project..." -ForegroundColor Yellow
$projectRef = "tmcvlyvpqweadheqssrq"
npx supabase link --project-ref $projectRef
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to link project!" -ForegroundColor Red
    exit 1
}
Write-Host "Project linked successfully!" -ForegroundColor Green
Write-Host ""

# Deploy function
Write-Host "Deploying crop-advisor function..." -ForegroundColor Yellow
npx supabase functions deploy crop-advisor --no-verify-jwt
if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Successful!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Function URL:" -ForegroundColor Cyan
Write-Host "https://tmcvlyvpqweadheqssrq.supabase.co/functions/v1/crop-advisor" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update your .env file:" -ForegroundColor White
Write-Host "   VITE_N8N_CROP_ADVISOR_URL=https://tmcvlyvpqweadheqssrq.supabase.co/functions/v1/crop-advisor" -ForegroundColor Gray
Write-Host "2. Restart your dev server" -ForegroundColor White
Write-Host "3. Test the crop advisor feature" -ForegroundColor White
Write-Host ""
