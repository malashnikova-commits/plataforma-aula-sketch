# Skill: Dual Auth & Zero-Start Individual Progress

## Autenticación híbrida
- **Modo Nube**: usa `supabase.auth.signUp`, `signInWithPassword` y `signOut` cuando `supabaseConfigurado()` es `true`.
- **Modo Local seguro**: hashea contraseñas con `window.crypto.subtle.digest("SHA-256", ...)` antes de persistir en `localStorage` (`plataforma-usuarios-v1`); nunca almacenar contraseñas en texto plano.

## Roles y arranque desde 0
- **Alumnado (`alumnado`)**: rol por defecto en registro.
- **Administrador / Tutor (`tutor`)**: requiere código de invitación `process.env.NEXT_PUBLIC_TUTOR_CODE || "TUTOR2026"`.
- Todo usuario recién registrado inicia estrictamente con `xp: 0`, `anguloGrados: 0`, `nodosCompletados: []` y `entregas: []`, aislado por `userId`.
