/**
 * OpenTelemetry + Sentry instrumentation.
 *
 * Uses @elysiajs/opentelemetry which is built specifically for Bun/Elysia
 * and handles the SDK lifecycle, span creation, and context propagation
 * automatically for every HTTP request.
 *
 * The plugin is registered in app.ts via .use(otelPlugin).
 *
 * For Sentry, we initialise it here so it captures exceptions as early
 * as possible — before any route handlers run.
 */

import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'development',
  // @elysiajs/opentelemetry manages the OTEL SDK lifecycle.
  // Without this flag Sentry registers its own TracerProvider first, causing
  // @elysiajs/opentelemetry's shouldStartNodeSDK guard to bail out.
  skipOpenTelemetrySetup: true,
})

export { } // ensure this is a module, not a script
