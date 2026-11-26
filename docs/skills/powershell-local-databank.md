# Skill: PowerShell Local Databank Bridge

## Arquitectura segura en Windows (`127.0.0.1:4780`)
- `init-banco.ps1`: inicializa `C:\BancoAula\{usuarios, trabajos, entregas, respaldos}`, `catalogo.json` y genera un token aleatorio de 32 bytes hex en `token.txt`.
- `banco-local.ps1`: `System.Net.HttpListener` exclusivo en `http://127.0.0.1:4780/` con CORS restringido a `http://localhost:3000`, validación estricta de `X-Local-Token` (`401` si falta o no coincide) y sanitización contra *path traversal* (`[System.IO.Path]::GetFullPath`).
- `respaldo-sync.ps1`: empaqueta respaldos fechados con `Compress-Archive` y deja lista la sincronización incremental hacia Supabase Storage.
