param(
    [string]$RutaBase = "C:\BancoAula",
    [int]$Puerto = 4780
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path (Join-Path $RutaBase "token.txt"))) {
    Write-Error "No se encontró token.txt en $RutaBase. Ejecuta primero init-banco.ps1."
    exit 1
}

$rutaBaseFull = [System.IO.Path]::GetFullPath($RutaBase)
$tokenEsperado = (Get-Content -Path (Join-Path $rutaBaseFull "token.txt") -Raw).Trim()

function Get-SafeId {
    param([string]$Valor)
    if ([string]::IsNullOrWhiteSpace($Valor)) { return "anonimo" }
    return [Regex]::Replace($Valor, "[^a-zA-Z0-9._-]", "_")
}

function Resolve-SafeChildPath {
    param(
        [string]$Subcarpeta,
        [string]$NombreArchivo
    )
    $carpeta = Join-Path $rutaBaseFull $Subcarpeta
    $candidato = [System.IO.Path]::GetFullPath((Join-Path $carpeta $NombreArchivo))
    if (-not $candidato.StartsWith($rutaBaseFull, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Ruta fuera del banco local"
    }
    return $candidato
}

function Send-JsonResponse {
    param(
        [System.Net.HttpListenerResponse]$Response,
        [int]$StatusCode,
        [object]$Payload
    )
    $Response.StatusCode = $StatusCode
    $Response.Headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
    $Response.Headers["Access-Control-Allow-Headers"] = "Content-Type, X-Local-Token"
    $Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    $Response.ContentType = "application/json; charset=utf-8"

    $json = $Payload | ConvertTo-Json -Depth 10 -Compress
    $buffer = [System.Text.Encoding]::UTF8.GetBytes($json)
    $Response.ContentLength64 = $buffer.Length
    $Response.OutputStream.Write($buffer, 0, $buffer.Length)
    $Response.OutputStream.Close()
}

$listener = New-Object System.Net.HttpListener
$prefijo = "http://127.0.0.1:$Puerto/"
$listener.Prefixes.Add($prefijo)
$listener.Start()

Write-Host "Banco local escuchando exclusivamente en $prefijo"
Write-Host "Presiona Ctrl+C para detener el servidor."

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response

        try {
            if ($req.HttpMethod -eq "OPTIONS") {
                Send-JsonResponse -Response $res -StatusCode 200 -Payload @{ ok = $true }
                continue
            }

            $tokenRecibido = $req.Headers["X-Local-Token"]
            if ($tokenRecibido -ne $tokenEsperado) {
                Send-JsonResponse -Response $res -StatusCode 401 -Payload @{ ok = $false; error = "Token invalido" }
                continue
            }

            $ruta = $req.Url.AbsolutePath

            if ($req.HttpMethod -eq "GET" -and $ruta -eq "/api/estado") {
                Send-JsonResponse -Response $res -StatusCode 200 -Payload @{
                    ok       = $true
                    rutaBase = $rutaBaseFull
                    puerto   = $Puerto
                    hora     = (Get-Date).ToString("o")
                }
                continue
            }

            if ($req.HttpMethod -eq "GET" -and $ruta -eq "/api/listar") {
                $usuarios = @(Get-ChildItem -Path (Join-Path $rutaBaseFull "usuarios") -File -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name)
                $entregas = @(Get-ChildItem -Path (Join-Path $rutaBaseFull "entregas") -File -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name)
                Send-JsonResponse -Response $res -StatusCode 200 -Payload @{
                    ok       = $true
                    usuarios = $usuarios
                    entregas = $entregas
                }
                continue
            }

            if ($req.HttpMethod -eq "POST" -and $ruta -eq "/api/guardar-progreso") {
                $reader = New-Object System.IO.StreamReader($req.InputStream, [System.Text.Encoding]::UTF8)
                $body = $reader.ReadToEnd()
                $reader.Close()

                $obj = $body | ConvertFrom-Json
                $userId = Get-SafeId -Valor ([string]$obj.userId)
                $destino = Resolve-SafeChildPath -Subcarpeta "usuarios" -NombreArchivo "$userId.json"
                Set-Content -Path $destino -Value $body -Encoding UTF8

                Send-JsonResponse -Response $res -StatusCode 200 -Payload @{ ok = $true; archivo = "$userId.json" }
                continue
            }

            if ($req.HttpMethod -eq "POST" -and $ruta -eq "/api/subir-archivo") {
                $reader = New-Object System.IO.StreamReader($req.InputStream, [System.Text.Encoding]::UTF8)
                $body = $reader.ReadToEnd()
                $reader.Close()

                $obj = $body | ConvertFrom-Json
                $userId = Get-SafeId -Valor ([string]$obj.userId)
                $nombre = Get-SafeId -Valor ([string]$obj.nombre)
                $bytes = [System.Convert]::FromBase64String([string]$obj.contenidoBase64)
                $archivoFinal = "${userId}_$(Get-Date -Format 'yyyyMMddHHmmss')_${nombre}"
                $destino = Resolve-SafeChildPath -Subcarpeta "entregas" -NombreArchivo $archivoFinal
                [System.IO.File]::WriteAllBytes($destino, $bytes)

                Send-JsonResponse -Response $res -StatusCode 200 -Payload @{ ok = $true; archivo = $archivoFinal }
                continue
            }

            Send-JsonResponse -Response $res -StatusCode 404 -Payload @{ ok = $false; error = "Ruta no encontrada" }
        } catch {
            Send-JsonResponse -Response $res -StatusCode 500 -Payload @{ ok = $false; error = $_.Exception.Message }
        }
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
