import { opentelemetry } from '@elysiajs/opentelemetry'
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'

/**
 * @elysiajs/opentelemetry plugin — handles SDK lifecycle and per-request
 * spans automatically. Uses OTLP/HTTP protobuf format (port 4318).
 *
 * SimpleSpanProcessor / SimpleLogRecordProcessor flush immediately in dev
 * so data isn't lost when bun --watch restarts before Batch* flushes.
 *
 * ClickStack auth: the API key is passed via OTLP headers (no "Bearer" prefix).
 *
 * NOTE: Sentry.init() must set skipOpenTelemetrySetup: true (see instrumentation.ts).
 * Without it, Sentry registers its own TracerProvider first and the
 * shouldStartNodeSDK guard in @elysiajs/opentelemetry bails out silently.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProcessor = any

const otlpHeaders: Record<string, string> = process.env.CLICKSTACK_API_KEY
  ? { Authorization: process.env.CLICKSTACK_API_KEY }
  : {}

const otlpBase = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318'

export const otelPlugin = opentelemetry({
  serviceName: process.env.OTEL_SERVICE_NAME ?? 'pb138-server',
  // Cast required: @elysiajs/opentelemetry vendors its own @opentelemetry/sdk-node
  // (v0.200.0) whose internal types differ from our top-level sdk-trace-base/sdk-logs.
  // The runtime objects are structurally identical — the cast is safe.
  spanProcessors: [
    new SimpleSpanProcessor(
      new OTLPTraceExporter({ url: `${otlpBase}/v1/traces`, headers: otlpHeaders }) as AnyProcessor,
    ) as AnyProcessor,
  ],
  logRecordProcessors: [
    new SimpleLogRecordProcessor(
      new OTLPLogExporter({ url: `${otlpBase}/v1/logs`, headers: otlpHeaders }) as AnyProcessor,
    ) as AnyProcessor,
  ],
})

// Bridge console.log/warn/error to OTEL logs so all server output
// is searchable and correlated with traces in ClickStack.
const _log = console.log.bind(console)
const _warn = console.warn.bind(console)
const _error = console.error.bind(console)

function toBody(args: unknown[]): string {
  return args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')
}

const logger = () => logs.getLogger('console')

console.log = (...args) => {
  _log(...args)
  logger().emit({ severityNumber: SeverityNumber.INFO, severityText: 'INFO', body: toBody(args) })
}
console.warn = (...args) => {
  _warn(...args)
  logger().emit({ severityNumber: SeverityNumber.WARN, severityText: 'WARN', body: toBody(args) })
}
console.error = (...args) => {
  _error(...args)
  logger().emit({ severityNumber: SeverityNumber.ERROR, severityText: 'ERROR', body: toBody(args) })
}
