# Supabase: kontuak, aurrerapena hodeian eta bisitak

> **Prompt para quien conecte Supabase.** Puedes dárselo tal cual a una persona o a un agente (Claude Code, etc.).
> Todo lo del lado del cliente ya está hecho y probado con un backend de mentira; falta el lado Supabase.

> **Cuentas: no activar todavía.** La sincronización actual lee, mezcla y sobrescribe el documento sin
> control de concurrencia. Dos dispositivos pueden sobrescribirse. Además, la mezcla actual elige una
> copia de algunos historiales de respuestas y tarjetas, de modo que un control de concurrencia por sí
> solo no evitaría perder datos divergentes. El progreso local tampoco está aislado por cuenta: al
> cambiar de usuario podría fusionarse con otra cuenta. Antes de activar `NEXT_PUBLIC_ACCOUNTS`, hay que
> rediseñar y probar la reconciliación y el aislamiento, incluida la transición del progreso anónimo.

---

## Contexto

EnbrioAtlas (Next.js 16, App Router; lee `AGENTS.md`: esta versión de Next tiene cambios, consulta
`node_modules/next/dist/docs/` antes de escribir código) es un simulador de embriología en euskera. Ya existe:

- **Progreso local** en `localStorage` (etapas vistas y cuántas veces, tiempo de estudio, preguntas, flashcards de
  Belortzioak, repaso de esquemas). Página `/aurrerapena`.
- **Cuentas opcionales** para guardar ese progreso en la nube: solo con **nombre + PIN de 4 cifras** (sin Google: decidido el 2026-11-11, no lo configures).
  La UI (`components/account/*`) solo habla con la interfaz `AccountBackend` de `lib/account/types.ts`.
  Hoy no hay backend real, así que las cuentas están ocultas y no se envía nada.
- **Sincronización** ya escrita (`components/account/account.ts` + `lib/account/snapshot.ts`): al entrar, cada 3 min
  y al ocultar la pestaña hace *pull → merge → escribe local → push* de un único documento JSON (`ProgressBlob`).
  El merge es idempotente; el servidor solo guarda y devuelve el documento.
- **Recolector de visitas** ya escrito: `components/visits/VisitBeacon.tsx` (cliente, 1 vez por sesión del navegador,
  respeta Do Not Track / GPC) → `app/api/bisita/route.ts` (servidor: navegador, SO, dispositivo, idioma, zona
  horaria, hora, pantalla, página, sitio de referencia, país/ciudad de las cabeceras de Vercel e **IP truncada**:
  IPv4 `a.b.c.0`, IPv6 /48) → `lib/visits/store.ts` → tabla `visits` por PostgREST con la *service role key*.
  Sin variables de entorno es un no-op.
- Para probar las cuentas sin Supabase en desarrollo: `localStorage['enbrioatlas:dev-kontuak']='mock'` y recargar
  (`lib/account/mock.ts`; nunca se activa en producción). Úsalo como referencia del comportamiento esperado.

## Lo que tienes que hacer

### 1. Proyecto y tablas

1. Crea un proyecto Supabase (región UE, p. ej. Frankfurt/Irlanda).
2. Ejecuta `supabase/migrations/0002_kontuak_bisitak.sql` (SQL Editor o `supabase db push`). Crea:
   - `user_progress (user_id, data jsonb, updated_at)`: RLS, cada usuario solo su fila.
   - `pin_accounts (name_key, user_id, name)` y `pin_attempts (name_key, fails, locked_until)`: RLS sin
     políticas → solo el servidor (service role).
   - `visits` + vistas `visits_daily` y `visits_by_device`: RLS sin políticas → solo el servidor.
3. Activa `pg_cron` y descomenta las dos líneas `cron.schedule` del final (borra visitas de más de 13 meses y
   contadores de intentos viejos).

### 2. Nombre + PIN (ruta de servidor nueva, `app/api/kontua/pin/route.ts`)

Supabase Auth no tiene «usuario + PIN», así que cada cuenta PIN es un usuario de Supabase con email y contraseña
**sintéticos que el cliente nunca ve**. Contrato:

```
POST /api/kontua/pin   { action: 'signup' | 'signin', name: string, pin: string }
200 → { ok: true, user: AccountUser, session: { access_token, refresh_token } }
4xx → { ok: false, error: 'taken' | 'wrong' | 'locked' | 'invalid', retryAfterSec?: number }
```

Reglas (obligatorias, son la seguridad del sistema; un PIN de 4 cifras solo tiene 10 000 combinaciones):

- `export const runtime = 'nodejs'`. Valida con `checkName` / `checkPin` de `lib/account/types.ts` (`invalid`).
- `key = nameKey(name)` (minúsculas, sin acentos, espacios → `-`): «Ane», «ane» y «Ané» son la misma cuenta.
- **Contraseña** = `HMAC-SHA256(PIN_PEPPER, key + ':' + pin)` en base64url. `PIN_PEPPER`: secreto de ≥32 bytes
  aleatorios, solo en el servidor. Así, aunque alguien llame directamente a la API de Supabase Auth, no puede probar
  PINs sin pasar por esta ruta.
- **Email** = `'p-' + HMAC-SHA256(PIN_PEPPER, 'email:' + key).slice(0, 32) + '@pin.<tu-dominio>'` (un subdominio
  tuyo; no se envía ningún correo).
- **signup**: si `pin_accounts` ya tiene `key` → `taken`. Si no, `auth.admin.createUser({ email, password,
  email_confirm: true, user_metadata: { name: cleanName(name), provider: 'pin' } })`, inserta en `pin_accounts`
  y luego inicia sesión como en *signin*.
- **signin**: lee `pin_attempts`; si `locked_until > now()` → `locked` + `retryAfterSec`. Intenta
  `auth.signInWithPassword({ email, password })` con un cliente **anon** en el servidor. Si falla: `fails + 1`; al
  llegar a `MAX_FAILS` (5) pon `locked_until = now() + LOCK_SECONDS` (15 min) y `fails = 0`; responde `wrong` (nunca
  digas si el nombre existe). Si acierta: borra la fila de intentos y devuelve la sesión.
- Límite por IP además del de por nombre: reutiliza `allow()` de `lib/kimu/guard.ts` (p. ej. 20 intentos / 10 min).
  Es en memoria; en Vercel con varias instancias es orientativo, el bloqueo por nombre en la tabla es el que cuenta.
- La actualización de `pin_attempts` debe ser atómica (una función SQL `security definer` o un `update ... returning`),
  para que peticiones en paralelo no se salten el bloqueo.
- No registres nombres ni PINs en logs.

### 3. `lib/account/supabase.ts`

Sustituye el `null` por una implementación de `AccountBackend` (`lib/account/types.ts`; el comportamiento de
referencia es `lib/account/mock.ts`). Puedes añadir `@supabase/supabase-js`.

- Cliente con `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`, sesión persistida en `localStorage`
  (por defecto) y `detectSessionInUrl: false` (no hay redirecciones OAuth). Créalo de forma perezosa: el módulo se importa
  también en el servidor.
- `currentUser()`: `auth.getSession()` → `AccountUser`: `id` = id de Supabase; `name` = `user_metadata.name`;
  `provider` = `'pin'`.
- `signInWithPin` / `signUpWithPin`: `fetch('/api/kontua/pin')` → si `ok`, `auth.setSession(session)` y devuelve
  `{ ok: true, user }`; errores de red → `network`.
- `signOut()`: `auth.signOut()`.
- `loadProgress()`: `select data from user_progress where user_id = <uid>` → el `data` es el `ProgressBlob`
  (`null` si no hay fila o si falla).
- `saveProgress(blob)`: `upsert({ user_id, data: blob })` → `true/false`.
- `lib/account/backend.ts` ya elige este backend cuando `NEXT_PUBLIC_ACCOUNTS=supabase`.

### 4. Variables de entorno (Vercel → Settings → Environment Variables, y `.env.local`)

```
NEXT_PUBLIC_ACCOUNTS=supabase                 # enciende las cuentas en la UI
NEXT_PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_URL=https://<proyecto>.supabase.co   # servidor: visitas y ruta PIN
SUPABASE_SERVICE_ROLE_KEY=<service role key>  # ¡solo servidor! nunca NEXT_PUBLIC_
PIN_PEPPER=<32+ bytes aleatorios, base64>     # no lo cambies después: invalidaría todas las cuentas PIN
```

Las visitas funcionan solo con `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`, aunque las cuentas sigan apagadas.

### 5. Comprobaciones antes de dar por terminado

1. `npx tsc --noEmit`, `npx eslint .`, `npx vitest run tests/study-progress.test.ts tests/visits.test.ts`.
2. Visitas: abre la web en una ventana privada, espera 5 s → aparece 1 fila en `visits` con `ip_trunc` acabada en
   `.0` (o `::`), navegador y dispositivo correctos; recargar no crea otra fila (1 por sesión). Con Do Not Track
   activado no se crea ninguna.
3. PIN: crea «Ane Proba» / 4321 en `/aurrerapena` → «Gorde hodeian». Aparece en `auth.users`, `pin_accounts` y,
   tras unos segundos, en `user_progress`. En otro navegador: «ane proba» + PIN erróneo → «Izena edo PINa ez dira
   zuzenak.»; 5 errores → mensaje de bloqueo con minutos; PIN correcto (pasados 15 min) → vuelve el progreso.
   Crear otra vez «Ané Proba» → «Izen hori hartuta dago…».
4. RLS: con la anon key y la sesión de un usuario, `select * from user_progress` devuelve solo su fila;
   `select * from visits` y `pin_accounts` no devuelven nada.
5. Privacidad: añade una línea a la política de privacidad del sitio (se guardan visitas sin identificador, con IP
   truncada, 13 meses; el progreso solo si el usuario crea una cuenta, y se borra al borrar la cuenta).

`migrations/0001_progress.sql` (el diseño antiguo, nunca aplicado) se ha eliminado: no lo busques.
