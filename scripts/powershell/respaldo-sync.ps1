param(
    [string]$RutaBase = "C:\BancoAula",
    [string]$Bucket = "entregas-aula"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $RutaBase)) {
    Write-Error "No existe el banco local en $RutaBase. Ejecuta init-banco.ps1 primero."
    exit 1
}

$marcaTiempo = Get-Date -Format "yyyyMMdd-HHmmss"
$carpetaRespaldos = Join-Path $RutaBase "respaldos"
if (-not (Test-Path $carpetaRespaldos)) {
    New-Item -ItemType Directory -Path $carpetaRespaldos -Force | Out-Null
}

$zipDestino = Join-Path $carpetaRespaldos "respaldo-$marcaTiempo.zip"
$elementos = @("usuarios", "trabajos", "entregas", "catalogo.json") |
    ForEach-Object { Join-Path $RutaBase $_ } |
    Where-Object { Test-Path $_ }

if ($elementos.Count -eq 0) {
    Write-Warning "No hay datos para respaldar en $RutaBase."
    exit 0
}

Compress-Archive -Path $elementos -DestinationPath $zipDestino -CompressionLevel Optimal -Force
Write-Host "Respaldo comprimido creado en: $zipDestino"

# Sincronización incremental opcional hacia Supabase Storage cuando las variables están presentes
if ($env:SUPABASE_URL -and $env:SUPABASE_KEY) {
    $urlDestino = "$($env:SUPABASE_URL.TrimEnd('/'))/storage/v1/object/$Bucket/respaldos/respaldo-$marcaTiempo.zip"
    $headers = @{
        "Authorization" = "Bearer $($env:SUPABASE_KEY)"
        "apikey"        = $env:SUPABASE_KEY
        "Content-Type"  = "application/zip"
    }
    Invoke-RestMethod -Uri $urlDestino -Method Post -Headers $headers -InFile $zipDestino | Out-Null
    Write-Host "Respaldo sincronizado hacia Supabase Storage ($Bucket)."
} else {
    Write-Host "Variables SUPABASE_URL / SUPABASE_KEY no definidas: respaldo guardado únicamente en local."
}
