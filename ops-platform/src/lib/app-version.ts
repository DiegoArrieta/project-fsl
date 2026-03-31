/**
 * Versión de la app (desde package.json), inyectada en build en `next.config.ts`.
 */
export function getAppVersion(): string {
  const v = process.env.NEXT_PUBLIC_APP_VERSION?.trim()
  if (v) return v
  return 'dev'
}
