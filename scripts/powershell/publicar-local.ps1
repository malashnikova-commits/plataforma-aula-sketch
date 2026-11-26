param(
    [int]$Puerto = 3000
)

$ErrorActionPreference = "Stop"

$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))
$nodeDir = "C:\Program Files\nodejs"
if ((Test-Path $nodeDir) -and -not ($env:PATH -split ";" | Where-Object { $_ -eq $nodeDir })) {
    $env:PATH = "$nodeDir;" + $env:PATH
}

$cloudflaredCmd = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cloudflaredCmd) {
    Write-Host "cloudflared no esta instalado o no se encuentra en PATH." -ForegroundColor Yellow
    Write-Host "Instalalo con el siguiente comando y vuelve a intentarlo:" -ForegroundColor Cyan
    Write-Host "  winget install --id Cloudflare.cloudflared" -ForegroundColor White
    exit 1
}

Write-Host "[SEGURIDAD] El puerto 4780 (banco-local.ps1) permanece privado en 127.0.0.1." -ForegroundColor Yellow
Write-Host "[SEGURIDAD] El tunel publico expondra exclusivamente http://localhost:$Puerto." -ForegroundColor Yellow

Push-Location $repoRoot
$nextProc = $null

try {
    Write-Host "[1/3] Compilando aplicacion de produccion (npm.cmd run build)..." -ForegroundColor Cyan
    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "La compilacion fallo con codigo $LASTEXITCODE. Publicacion abortada."
        exit $LASTEXITCODE
    }

    Write-Host "[2/3] Iniciando servidor Next.js en http://localhost:$Puerto..." -ForegroundColor Cyan
    $nextProc = Start-Process -FilePath "npm.cmd" `
        -ArgumentList @("run", "start", "--", "-p", "$Puerto") `
        -WorkingDirectory $repoRoot `
        -PassThru `
        -WindowStyle Hidden

    $listo = $false
    for ($i = 0; $i -lt 30; $i++) {
        if ($nextProc.HasExited) {
            throw "El servidor Next.js termino inesperadamente (codigo $($nextProc.ExitCode))."
        }
        try {
            $resp = Invoke-WebRequest -Uri "http://localhost:$Puerto" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            if ($resp.StatusCode -eq 200) {
                $listo = $true
                break
            }
        } catch {
            Start-Sleep -Milliseconds 500
        }
    }

    if (-not $listo) {
        throw "El servidor Next.js no respondio HTTP 200 en http://localhost:$Puerto dentro del tiempo esperado."
    }

    Write-Host "[3/3] Abriendo tunel cifrado Cloudflare hacia http://localhost:$Puerto..." -ForegroundColor Green
    Write-Host "Presiona Ctrl+C para cerrar el tunel y detener el servidor limpiamente." -ForegroundColor DarkGray
    & $cloudflaredCmd.Source tunnel --url "http://localhost:$Puerto"
}
finally {
    if ($nextProc -and -not $nextProc.HasExited) {
        Write-Host "`nDeteniendo servidor Next.js (PID $($nextProc.Id))..." -ForegroundColor Yellow
        & taskkill.exe /PID $nextProc.Id /T /F 2>$null | Out-Null
        Stop-Process -Id $nextProc.Id -Force -ErrorAction SilentlyContinue
    }
    Pop-Location
}
