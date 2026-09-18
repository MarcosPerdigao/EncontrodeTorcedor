import { z } from 'zod';

const eventSchema = z.strictObject({
  requestId: z.string().uuid(),
  operation: z.enum(['bootstrap', 'state', 'complete', 'profileCreate', 'revoke', 'unknown']),
  result: z.enum([
    'ok',
    'invalid_request',
    'unauthenticated',
    'forbidden',
    'conflict',
    'rate_limited',
    'internal_error',
  ]),
  latencyMs: z.number().int().min(0).max(86_400_000),
});
export type SafeEvent = z.infer<typeof eventSchema>;
export function safeLog(input: unknown, sink: (event: SafeEvent) => void): void {
  const result = eventSchema.safeParse(input);
  if (result.success) sink(result.data);
}
