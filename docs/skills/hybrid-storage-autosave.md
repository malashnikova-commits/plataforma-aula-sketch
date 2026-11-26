# Skill: Hybrid Storage & Debounced AutoSave

## Capas de persistencia
1. **Autoguardado (`useAutoSave.ts`)**: debounce de `600 ms` tras cambios de avance, apuntes o entregas; emite estados `Guardando…` / `Guardado ✓`.
2. **IndexedDB (`localDB.ts`)**: almacena progresos, trabajos, entregas y adjuntos binarios (`Blob`) sin saturar `localStorage`.
3. **File System Access API + JSON**: permite guardar respaldos en una carpeta local elegida (`window.showDirectoryPicker()`) y exportar/importar archivos `.json`.
4. **Nube opcional (`cloudSync.ts`)**: sincroniza con `progreso_usuarios` y bucket `entregas-aula` en Supabase resolviendo conflictos por `updated_at`.
