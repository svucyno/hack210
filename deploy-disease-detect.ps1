# Disease Detection Edge Function Deployment Script
# This script deploys the disease-detect Edge Function to Supabase

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Disease Detection Edge Function Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
Write-Host "Checking Supabase CLI installation..." -ForegroundColor Yellow
$supabaseVersion = supabase --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Supabase CLI is not installed!" -ForegroundColor Red
    Write-Host "Install it from: https://supabase.com/docs/guides/cli" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
Write-Host ""

# Check authentication
Write-Host "Checking Supabase authentication..." -ForegroundColor Yellow
$authCheck = supabase projects list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Not authenticated with Supabase!" -ForegroundColor Red
    Write-Host "Run: supabase login" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Authenticated with Supabase" -ForegroundColor Green
Write-Host ""

# Project reference
$PROJECT_REF = "tmcvlyvpqweadheqssrq"

# Check if project is linked
Write-Host "Verifying project link..." -ForegroundColor Yellow
$linkCheck = supabase status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Project not linked. Linking now..." -ForegroundColor Yellow
    supabase link --project-ref $PROJECT_REF
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to link project!" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ Project linked: $PROJECT_REF" -ForegroundColor Green
Write-Host ""

# Check HUGGINGFACE_API_KEY secret
Write-Host "Checking HUGGINGFACE_API_KEY secret..." -ForegroundColor Yellow
$secretsList = supabase secrets list --project-ref $PROJECT_REF 2>&1
if ($secretsList -match "HUGGINGFACE_API_KEY") {
    Write-Host "✓ HUGGINGFACE_API_KEY is configured" -ForegroundColor Green
} else {
    Write-Host "WARNING: HUGGINGFACE_API_KEY not found!" -ForegroundColor Red
    Write-Host "Set it with: supabase secrets set HUGGINGFACE_API_KEY=<your-key> --project-ref $PROJECT_REF" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue deployment anyway? (y/n)"
    if ($continue -ne "y") {
        Write-Host "Deployment cancelled." -ForegroundColor Yellow
        exit 0
    }
}
Write-Host ""

# Deploy the Edge Function
Write-Host "Deploying disease-detect Edge Function..." -ForegroundColor Yellow
Write-Host "This may take a minute..." -ForegroundColor Gray
Write-Host ""

supabase functions deploy disease-detect --project-ref $PROJECT_REF

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Deployment failed!" -ForegroundColor Red
    Write-Host "Check the error messages above for details." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ Deployment Successful!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Verify deployment
Write-Host "Verifying deployment..." -ForegroundColor Yellow
$functionsList = supabase functions list --project-ref $PROJECT_REF 2>&1
if ($functionsList -match "disease-detect") {
    Write-Host "✓ disease-detect function is deployed" -ForegroundColor Green
} else {
    Write-Host "WARNING: Could not verify deployment" -ForegroundColor Yellow
}
Write-Host ""

# Display endpoint information
Write-Host "Edge Function Endpoint:" -ForegroundColor Cyan
Write-Host "https://$PROJECT_REF.supabase.co/functions/v1/disease-detect" -ForegroundColor White
Write-Host ""

# Testing instructions
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Instructions" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Test from your app:" -ForegroundColor Yellow
Write-Host "   - Upload a plant image in the Disease Detection page" -ForegroundColor Gray
Write-Host "   - Click 'Detect Disease' button" -ForegroundColor Gray
Write-Host "   - Check for successful detection results" -ForegroundColor Gray
Write-Host ""
Write-Host "2. View function logs:" -ForegroundColor Yellow
Write-Host "   supabase functions logs disease-detect --project-ref $PROJECT_REF" -ForegroundColor Gray
Write-Host ""
Write-Host "3. View real-time logs:" -ForegroundColor Yellow
Write-Host "   supabase functions logs disease-detect --project-ref $PROJECT_REF --follow" -ForegroundColor Gray
Write-Host ""

Write-Host "Deployment complete! 🎉" -ForegroundColor Green
