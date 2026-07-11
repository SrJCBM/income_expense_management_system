@echo off
REM Build script para crear instalador Windows
REM Uso: build-dist.bat

setlocal enabledelayedexpansion

echo.
echo ========================================
echo  Income Expense Manager - Build Script
echo ========================================
echo.

set INSTALLERROOT=%~dp0
set PROJECTROOT=%INSTALLERROOT%..
set WEBROOT=%PROJECTROOT%\web
set BACKENDROOT=%PROJECTROOT%\backend

echo [1/4] Compilando web app...
pushd %WEBROOT%
call npm run build
popd
if errorlevel 1 (
    echo Error: Build de web fallo
    exit /b 1
)
xcopy "%WEBROOT%\dist" "%INSTALLERROOT%dist" /E /I /Y >nul
echo OK: Web app compilada
echo.

echo [2/4] Instalando dependencias del backend (production)...
pushd %BACKENDROOT%
call npm ci --omit=dev
popd
if errorlevel 1 (
    echo Error: npm ci fallo
    exit /b 1
)
echo OK: Dependencias instaladas
echo.

echo [3/4] Copiando backend a dist\resources\backend...
if not exist "%INSTALLERROOT%dist\resources\backend" mkdir "%INSTALLERROOT%dist\resources\backend"

REM Copiar archivos del backend
xcopy "%BACKENDROOT%\src" "%INSTALLERROOT%dist\resources\backend\src" /E /I /Y >nul
xcopy "%BACKENDROOT%\server.js" "%INSTALLERROOT%dist\resources\backend\" /Y >nul
xcopy "%BACKENDROOT%\package.json" "%INSTALLERROOT%dist\resources\backend\" /Y >nul
xcopy "%BACKENDROOT%\.env.example" "%INSTALLERROOT%dist\resources\backend\" /Y >nul

REM Copiar node_modules (esto es lo lento)
echo    Copiando node_modules (esto puede tardar...)
xcopy "%BACKENDROOT%\node_modules" "%INSTALLERROOT%dist\resources\backend\node_modules" /E /I /Y >nul

echo OK: Backend copiado
echo.

echo [4/4] Construyendo con electron-builder...
call electron-builder --win
if errorlevel 1 (
    echo Error: electron-builder fallo
    exit /b 1
)
echo OK: Instalador generado
echo.

echo ========================================
echo  Build Completado!
echo ========================================
echo.
echo Instalador: %INSTALLERROOT%release\FinanceApp Setup 1.2.0.exe
echo.

endlocal
