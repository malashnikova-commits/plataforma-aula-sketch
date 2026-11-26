param(
    [string]$UrlLocal = "http://localhost:3000",
    [switch]$PermitirCodigoDemo
)

$ErrorActionPreference = "Stop"

$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))
$alertas = 0

Write-Host "=== Verificacion previa a publicacion ===" -ForegroundColor Cyan

# 1. Verificar respuesta HTTP 200 OK en servidor local
try {
    $resp = Invoke-WebRequest -Uri $UrlLocal -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    if ($resp.StatusCode -eq 200) {
        Write-Host "[OK] $UrlLocal responde 200 OK" -ForegroundColor Green
    } else {
        Write-Host "[FALLO] $UrlLocal respondio HTTP $($resp.StatusCode)" -ForegroundColor Red
        $alertas++
    }
} catch {
    Write-Host "[FALLO] $UrlLocal no responde 200 OK ($($_.Exception.Message))" -ForegroundColor Red
    $alertas++
}

# 2. Verificar que .env.local no este rastreado por Git
$rastreado = & git -C $repoRoot ls-files ".env.local"
if ([string]::IsNullOrWhiteSpace($rastreado)) {
    Write-Host "[OK] .env.local no esta rastreado por Git" -ForegroundColor Green
} else {
    Write-Host "[FALLO] .env.local esta rastreado por Git; retiralo del indice antes de compartir" -ForegroundColor Red
    $alertas++
}

# 3. Verificar NEXT_PUBLIC_TUTOR_CODE distinto al valor generico
$codigoTutor = $env:NEXT_PUBLIC_TUTOR_CODE
$envLocalPath = Join-Path $repoRoot ".env.local"
if ([string]::IsNullOrWhiteSpace($codigoTutor) -and (Test-Path $envLocalPath)) {
    $linea = Get-Content -Path $envLocalPath | Where-Object { $_ -match '^\s*NEXT_PUBLIC_TUTOR_CODE\s*=' } | Select-Object -First 1
    if ($linea) {
        $codigoTutor = ($linea -split "=", 2)[1].Trim().Trim('"').Trim("'")
    }
}

$codigosGenericos = @("", "TUTOR2026", "demo", "test", "1234", "123456")
if ($codigosGenericos -contains ([string]$codigoTutor).Trim()) {
    if ($PermitirCodigoDemo) {
        Write-Host "[AVISO] NEXT_PUBLIC_TUTOR_CODE vacio o usa el valor generico 'TUTOR2026'; cambialo en .env.local antes de compartir el enlace" -ForegroundColor Yellow
    } else {
        Write-Host "[AVISO] NEXT_PUBLIC_TUTOR_CODE vacio o usa el valor generico 'TUTOR2026'; cambialo en .env.local antes de compartir el enlace" -ForegroundColor Yellow
        $alertas++
    }
} else {
    Write-Host "[OK] NEXT_PUBLIC_TUTOR_CODE personalizado configurado" -ForegroundColor Green
}

if ($alertas -eq 0) {
    Write-Host "Resultado: Listo para publicar." -ForegroundColor Green
    exit 0
} else {
    Write-Host "Resultado: $alertas alerta(s) detectada(s)." -ForegroundColor Yellow
    exit 1
}
