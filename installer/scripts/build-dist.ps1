#!/usr/bin/env pwsh
# FinanceApp - construccion del cliente Electron para produccion.

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$installerRoot = Split-Path -Parent $scriptDir
$projectRoot = Split-Path -Parent $installerRoot
$webRoot = Join-Path $projectRoot "web"
$installerDist = Join-Path $installerRoot "dist"
$installerPackage = Get-Content -Path (Join-Path $installerRoot "package.json") -Raw | ConvertFrom-Json
$appVersion = $installerPackage.version
$productName = $installerPackage.build.productName
$installerName = "$productName Setup $appVersion.exe"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  $productName - Build $appVersion" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    Write-Host "[1/2] Compilando cliente web para escritorio..." -ForegroundColor Green
    Push-Location $webRoot
    try {
        npm run build -- --mode desktop-prod
        if ($LASTEXITCODE -ne 0) { throw "Web build failed" }
    } finally {
        Pop-Location
    }

    if (Test-Path $installerDist) {
        Remove-Item -Recurse -Force $installerDist
    }
    robocopy (Join-Path $webRoot "dist") $installerDist /E /NJH /NJS /NC /NS /NP /R:3 /W:1 | Out-Null
    if ($LASTEXITCODE -ge 8) { throw "Copying web dist failed" }
    Write-Host "[1/2] Cliente compilado y copiado a installer/dist`n" -ForegroundColor Green

    Write-Host "[2/2] Construyendo instalador de Windows..." -ForegroundColor Green
    Push-Location $installerRoot
    try {
        $env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
        $env:WIN_CSC_LINK = ""
        npx electron-builder --win
        if ($LASTEXITCODE -ne 0) { throw "Electron-builder failed" }
    } finally {
        Pop-Location
    }
    Write-Host "[2/2] Instalador generado`n" -ForegroundColor Green

    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Build completado correctamente" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Instalador: $(Join-Path (Join-Path $installerRoot 'release') $installerName)" -ForegroundColor White
} catch {
    Write-Host "Build failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
