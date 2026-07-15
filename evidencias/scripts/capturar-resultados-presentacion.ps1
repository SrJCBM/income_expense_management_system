[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$LogDir = Join-Path $ProjectRoot 'evidencias\capturas-presentacion\logs'
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function Invoke-EvidenceCommand {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$WorkingDirectory,
        [Parameter(Mandatory = $true)][string]$FilePath,
        [Parameter(Mandatory = $true)][string[]]$Arguments
    )

    $startedAt = Get-Date
    $lines = New-Object 'System.Collections.Generic.List[string]'
    $displayCommand = "$FilePath $($Arguments -join ' ')"
    $resolvedFilePath = $FilePath
    if ($env:OS -eq 'Windows_NT' -and $FilePath -in @('npm', 'npx')) {
        $resolvedFilePath = (Get-Command "$FilePath.cmd" -ErrorAction Stop).Source
    }
    Write-Host "`n=== $Name ===" -ForegroundColor Cyan
    Write-Host $displayCommand

    Push-Location $WorkingDirectory
    try {
        & $resolvedFilePath @Arguments 2>&1 | ForEach-Object {
            $line = $_.ToString()
            $lines.Add($line)
            Write-Host $line
        }
        $exitCode = $LASTEXITCODE
    }
    finally {
        Pop-Location
    }

    $finishedAt = Get-Date
    $logPath = Join-Path $LogDir "$Name.txt"
    $header = @(
        "Nombre: $Name"
        "Comando: $displayCommand"
        "Directorio: $WorkingDirectory"
        "Inicio: $($startedAt.ToString('o'))"
        "Fin: $($finishedAt.ToString('o'))"
        "Codigo de salida: $exitCode"
        ''
    )
    @($header + $lines) | Set-Content -LiteralPath $logPath -Encoding UTF8

    if ($exitCode -ne 0) {
        throw "$Name termino con codigo $exitCode. Revise $logPath"
    }
}

$qaTests = Get-ChildItem -LiteralPath (Join-Path $ProjectRoot 'qa\tests') -Filter '*.test.mjs' |
    Sort-Object Name |
    ForEach-Object { $_.FullName }
if ($qaTests.Count -eq 0) {
    throw 'No se encontraron pruebas qa/tests/*.test.mjs.'
}

Invoke-EvidenceCommand `
    -Name '01-framework-qa' `
    -WorkingDirectory $ProjectRoot `
    -FilePath 'node' `
    -Arguments (@('--test') + $qaTests)

Invoke-EvidenceCommand `
    -Name '02-electron-smoke' `
    -WorkingDirectory $ProjectRoot `
    -FilePath 'npm' `
    -Arguments @('--prefix', 'installer', 'run', 'test:smoke')

Invoke-EvidenceCommand `
    -Name '03-rubrica-playwright' `
    -WorkingDirectory (Join-Path $ProjectRoot 'installer') `
    -FilePath 'npx' `
    -Arguments @('playwright', 'test', 'tests/rubric-evidence.spec.mjs')

Invoke-EvidenceCommand `
    -Name '04-qa-full-dry-run' `
    -WorkingDirectory $ProjectRoot `
    -FilePath 'node' `
    -Arguments @('qa/run-tests.mjs', 'all', '--profile', 'full', '--dry-run')

Invoke-EvidenceCommand `
    -Name '05-capturas-presentacion' `
    -WorkingDirectory (Join-Path $ProjectRoot 'installer') `
    -FilePath 'npx' `
    -Arguments @('playwright', 'test', 'tests/presentation-evidence.spec.mjs')

Write-Host "`nEvidencia actualizada en: $LogDir" -ForegroundColor Green
