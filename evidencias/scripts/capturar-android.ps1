[CmdletBinding()]
param(
    [string]$OutputPath
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
if (-not $OutputPath) {
    $OutputPath = Join-Path $ProjectRoot 'evidencias\capturas-presentacion\android-emulador.png'
}
elseif (-not [IO.Path]::IsPathRooted($OutputPath)) {
    $OutputPath = Join-Path $ProjectRoot $OutputPath
}

function Find-Adb {
    $command = Get-Command 'adb.exe' -ErrorAction SilentlyContinue
    if ($command) { return $command.Source }

    $candidates = @()
    if ($env:ANDROID_HOME) { $candidates += Join-Path $env:ANDROID_HOME 'platform-tools\adb.exe' }
    if ($env:ANDROID_SDK_ROOT) { $candidates += Join-Path $env:ANDROID_SDK_ROOT 'platform-tools\adb.exe' }
    if ($env:LOCALAPPDATA) { $candidates += Join-Path $env:LOCALAPPDATA 'Android\Sdk\platform-tools\adb.exe' }
    foreach ($candidate in $candidates) {
        if (Test-Path -LiteralPath $candidate -PathType Leaf) { return $candidate }
    }
    return $null
}

function Test-PngSignature {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $false }
    $stream = [IO.File]::OpenRead($Path)
    try {
        $signature = New-Object byte[] 8
        if ($stream.Read($signature, 0, 8) -ne 8) { return $false }
        return ([BitConverter]::ToString($signature).Replace('-', '').ToLowerInvariant() -eq '89504e470d0a1a0a')
    }
    finally {
        $stream.Dispose()
    }
}

$adb = Find-Adb
if (-not $adb) {
    throw 'No se encontro adb.exe. Instale Android SDK Platform-Tools o configure ANDROID_HOME.'
}

$deviceLines = @(& $adb devices 2>&1 | Select-Object -Skip 1 | Where-Object { $_.ToString().Trim() })
if ($LASTEXITCODE -ne 0) {
    throw 'ADB no pudo consultar los dispositivos conectados.'
}
$authorized = @($deviceLines | Where-Object { $_.ToString() -match '^\S+\s+device$' })
$unauthorized = @($deviceLines | Where-Object { $_.ToString() -match '^\S+\s+unauthorized$' })
$offline = @($deviceLines | Where-Object { $_.ToString() -match '^\S+\s+offline$' })

if ($authorized.Count -ne 1) {
    throw "Se requiere exactamente un emulador o dispositivo autorizado. Autorizados: $($authorized.Count); no autorizados: $($unauthorized.Count); offline: $($offline.Count). Abra el emulador y vuelva a ejecutar."
}

$directory = Split-Path -Parent $OutputPath
New-Item -ItemType Directory -Force -Path $directory | Out-Null

$startInfo = New-Object System.Diagnostics.ProcessStartInfo
$startInfo.FileName = $adb
$startInfo.Arguments = 'exec-out screencap -p'
$startInfo.UseShellExecute = $false
$startInfo.CreateNoWindow = $true
$startInfo.RedirectStandardOutput = $true
$startInfo.RedirectStandardError = $true

$process = New-Object System.Diagnostics.Process
$process.StartInfo = $startInfo
if (-not $process.Start()) { throw 'No se pudo iniciar adb screencap.' }

$file = [IO.File]::Create($OutputPath)
try {
    $process.StandardOutput.BaseStream.CopyTo($file)
}
finally {
    $file.Dispose()
}
$errorText = $process.StandardError.ReadToEnd()
$process.WaitForExit()
if ($process.ExitCode -ne 0) {
    Remove-Item -LiteralPath $OutputPath -Force -ErrorAction SilentlyContinue
    throw "ADB no pudo capturar la pantalla: $errorText"
}
if (-not (Test-PngSignature -Path $OutputPath)) {
    Remove-Item -LiteralPath $OutputPath -Force -ErrorAction SilentlyContinue
    throw 'ADB produjo un archivo que no tiene una firma PNG valida.'
}

Write-Host "Captura Android guardada en: $OutputPath" -ForegroundColor Green
Write-Host 'La navegacion y la preparacion del registro se realizan manualmente antes de ejecutar este script.'
