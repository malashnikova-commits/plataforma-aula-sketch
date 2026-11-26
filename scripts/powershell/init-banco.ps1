param(
    [string]$RutaBase = "C:\BancoAula"
)

$ErrorActionPreference = "Stop"

$subcarpetas = @("usuarios", "trabajos", "entregas", "respaldos")
if (-not (Test-Path $RutaBase)) {
    New-Item -ItemType Directory -Path $RutaBase -Force | Out-Null
}

foreach ($sub in $subcarpetas) {
    $destino = Join-Path $RutaBase $sub
    if (-not (Test-Path $destino)) {
        New-Item -ItemType Directory -Path $destino -Force | Out-Null
    }
}

$rutaCatalogo = Join-Path $RutaBase "catalogo.json"
if (-not (Test-Path $rutaCatalogo)) {
    $catalogoInicial = @{
        version   = 1
        creadoEn  = (Get-Date).ToString("o")
        trabajos  = @()
        respaldos = @()
    } | ConvertTo-Json -Depth 5
    Set-Content -Path $rutaCatalogo -Value $catalogoInicial -Encoding UTF8
}

$rutaToken = Join-Path $RutaBase "token.txt"
if (-not (Test-Path $rutaToken)) {
    $bytes = New-Object byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $token = -join ($bytes | ForEach-Object { $_.ToString("x2") })
    Set-Content -Path $rutaToken -Value $token -NoNewline -Encoding ASCII
} else {
    $token = (Get-Content -Path $rutaToken -Raw).Trim()
}

Write-Host "Banco local inicializado en: $RutaBase"
Write-Host "Token X-Local-Token: $token"
Write-Host "Copia este token en el panel Ajustes de http://localhost:3000 antes de activar el puente."
