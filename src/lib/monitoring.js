/**
 * Error reporting.
 *
 * Deliberately not a Sentry dependency. Adding one would mean a package, an
 * account, and a third-party script loading for every visitor — for an app
 * whose Privacy Policy says "no third-party trackers". So this is the seam:
 * it captures uncaught errors and rejections, and forwards them only if a
 * reporting endpoint has been configured.
 *
 * With no VITE_ERROR_REPORT_URL set it logs to the console and stops there,
 * which is exactly what it does today. To adopt Sentry later, replace the body
 * of `report` — every call site already exists.
 */

const endpoint = import.meta.env.VITE_ERROR_REPORT_URL ?? null

export const isReportingEnabled = Boolean(endpoint)

export function report(error, context = {}) {
  const detail = {
    message: error?.message ?? String(error),
    stack: error?.stack ?? null,
    url: typeof window === 'undefined' ? null : window.location.href,
    at: new Date().toISOString(),
    ...context,
  }

  console.error('[recipe-box]', detail.message, context)

  if (!endpoint) return

  // keepalive so a report still goes out if the error happened during unload.
  try {
    void fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(detail),
      keepalive: true,
    })
  } catch {
    /* reporting must never itself throw */
  }
}

/** Call once at startup. Catches what React error boundaries cannot. */
export function installGlobalHandlers() {
  if (typeof window === 'undefined') return

  window.addEventListener('error', (event) => {
    report(event.error ?? new Error(event.message), { kind: 'window.error' })
  })

  window.addEventListener('unhandledrejection', (event) => {
    report(event.reason ?? new Error('Unhandled promise rejection'), {
      kind: 'unhandledrejection',
    })
  })
}
