#!/usr/bin/env pwsh
# FinanceApp - Production Build Script
# Builds complete distribution with Electron installer
# Usage: .\build-dist.ps1

$ErrorActionPreference = "Stop"

# Get paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$installerRoot = if ($scriptDir -like "*\installer\scripts") {
    Split-Path -Parent $scriptDir
} else {
    Get-Location
}
$projectRoot = Split-Path -Parent $installerRoot
$webRoot = Join-Path $projectRoot "web"
$backendRoot = Join-Path $projectRoot "backend"
$installerDist = Join-Path $installerRoot "dist"
$distResourcesBackend = Join-Path (Join-Path $installerDist "resources") "backend"
$installerPackage = Get-Content -Path (Join-Path $installerRoot "package.json") -Raw | ConvertFrom-Json
$appVersion = $installerPackage.version
$productName = $installerPackage.build.productName
$installerName = "$productName Setup $appVersion.exe"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  $productName - Build $appVersion" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Web Root:      $webRoot" -ForegroundColor Gray
Write-Host "Backend Root:  $backendRoot" -ForegroundColor Gray
Write-Host ""

try {
    # Step 1: Web Build
    Write-Host "[1/4] Compiling web app..." -ForegroundColor Green
    Push-Location $webRoot
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Web build failed" }
    Pop-Location
    if (Test-Path $installerDist) {
        Remove-Item -Recurse -Force $installerDist
    }
    robocopy (Join-Path $webRoot "dist") $installerDist /E /NJH /NJS /NC /NS /NP /R:3 /W:1 | Out-Null
    if ($LASTEXITCODE -ge 8) { throw "Copying web dist failed" }
    Write-Host "[1/4] Web app compiled and copied to installer/dist`n" -ForegroundColor Green

    # Step 2: Backend Dependencies
    Write-Host "[2/4] Installing backend production dependencies..." -ForegroundColor Green
    Push-Location $backendRoot
    npm install --omit=dev --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { throw "Backend dependencies install failed" }
    Write-Host "[2/4] Backend dependencies installed`n" -ForegroundColor Green
    
    # Step 3: Copy Backend to Resources
    Write-Host "[3/4] Copying backend to resources..." -ForegroundColor Green
    
    # Create directory structure
    if (-not (Test-Path $distResourcesBackend)) {
        New-Item -ItemType Directory -Path $distResourcesBackend -Force | Out-Null
    }
    
    # Copy source files
    Write-Host "   Copying source files..." -ForegroundColor Yellow
    $srcDir = Join-Path $backendRoot "src"
    $destSrcDir = Join-Path $distResourcesBackend "src"
    if (Test-Path $srcDir) {
        Copy-Item -Path $srcDir -Destination $destSrcDir -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    # Copy root files
    Write-Host "   Copying root files..." -ForegroundColor Yellow
    Copy-Item -Path (Join-Path $backendRoot "server.js") -Destination $distResourcesBackend -Force
    Copy-Item -Path (Join-Path $backendRoot "package.json") -Destination $distResourcesBackend -Force
    Copy-Item -Path (Join-Path $backendRoot ".env") -Destination $distResourcesBackend -Force -ErrorAction SilentlyContinue
    Copy-Item -Path (Join-Path $backendRoot ".env.example") -Destination $distResourcesBackend -Force -ErrorAction SilentlyContinue
    
    # Copy node_modules
    Write-Host "   Copying node_modules (this may take a while)..." -ForegroundColor Yellow
    $srcNodeModules = Join-Path $backendRoot "node_modules"
    $destNodeModules = Join-Path $distResourcesBackend "node_modules"
    
    # Use robocopy for faster/more reliable copy on Windows
    if (Get-Command robocopy -ErrorAction SilentlyContinue) {
        robocopy $srcNodeModules $destNodeModules /E /NJH /NJS /NC /NS /NP /R:3 /W:1 | Out-Null
    } else {
        Copy-Item -Path $srcNodeModules -Destination $destNodeModules -Recurse -Force
    }
    
    Write-Host "[3/4] Backend copied to dist/resources/backend`n" -ForegroundColor Green
    
    # Step 4: Build Installer
    Write-Host "[4/4] Building Windows installer..." -ForegroundColor Green
    Push-Location $installerRoot
    $env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
    $env:WIN_CSC_LINK = ""
    npx electron-builder --win
    if ($LASTEXITCODE -ne 0) { throw "Electron-builder failed" }
    Write-Host "[4/4] Installer generated`n" -ForegroundColor Green
    
    # Success
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Build Completed Successfully!       " -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Installer Location:" -ForegroundColor Yellow
    Write-Host "   $(Join-Path (Join-Path $installerRoot 'release') $installerName)" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Find the .exe in the 'release' folder" -ForegroundColor Gray
    Write-Host "   2. Test installation on a clean Windows system" -ForegroundColor Gray
    Write-Host "   3. Distribute the .exe to end users" -ForegroundColor Gray
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "Build failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
} finally {
    Pop-Location -ErrorAction SilentlyContinue
}
