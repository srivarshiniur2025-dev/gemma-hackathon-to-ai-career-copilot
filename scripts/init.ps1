# AI Career Copilot — Project Initialization (Windows PowerShell)
# Run from project root: .\scripts\init.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host "==> Installing Python dependencies..." -ForegroundColor Cyan
Set-Location $Root
py -m pip install -r requirements.txt

Write-Host "==> Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location "$Root\frontend"
npm install

Write-Host "==> Installing root dev tools..." -ForegroundColor Cyan
Set-Location $Root
npm install

if (-not (Test-Path "$Root\.env")) {
  Copy-Item "$Root\.env.example" "$Root\.env"
  Write-Host "Created .env from .env.example — add your GOOGLE_API_KEY and MongoDB URI" -ForegroundColor Yellow
}

if (-not (Test-Path "$Root\frontend\.env.local")) {
  Copy-Item "$Root\frontend\.env.local.example" "$Root\frontend\.env.local"
  Write-Host "Created frontend/.env.local from .env.local.example (BACKEND_URL only — no API keys)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Setup complete! Next steps:" -ForegroundColor Green
Write-Host "  1. Start MongoDB locally (or set MONGODB_URI in .env)"
Write-Host "  2. Add Firebase keys to frontend/.env.local"
Write-Host "  3. Add firebase-service-account.json and FIREBASE_CREDENTIALS_PATH in .env"
Write-Host "  4. Run: npm run dev"
Write-Host ""
