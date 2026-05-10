/**
 * Base del API Express (sin barra final).
 *
 * - Desarrollo sin `REACT_APP_API_URL`: rutas relativas (`/positions/...`) y el **proxy** de CRA
 *   en `package.json` reenvía a `http://localhost:3010` (evita CORS y errores de URL).
 * - Si defines `REACT_APP_API_URL`, se usa tal cual (petición directa al backend).
 * - Producción: define `REACT_APP_API_URL` con la URL real del API.
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.REACT_APP_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (process.env.NODE_ENV === 'development') return '';
  return 'http://localhost:3010';
}
