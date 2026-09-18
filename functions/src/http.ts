import { randomUUID } from 'node:crypto';
import type { Request } from 'firebase-functions/v2/https';
import type { Response } from 'express';
import { ApiError } from './domain/account.js';
import type { Authenticator } from './platform/auth.js';
import type { AppAttestation } from './platform/local.js';
import { safeLog, type SafeEvent } from './platform/logger.js';
import type { createAccountService, Operation } from './service.js';

const routes: Record<string, Operation> = {
  '/session/bootstrap': 'bootstrap',
  '/session/state': 'state',
  '/account/complete': 'complete',
  '/fan-profile/create': 'profileCreate',
  '/session/revoke': 'revoke',
};
export function createHandler(
  auth: Authenticator,
  attestation: AppAttestation,
  service: ReturnType<typeof createAccountService>,
  sink: (event: SafeEvent) => void,
) {
  return async (request: Request, response: Response): Promise<void> => {
    const start = Date.now();
    const requestId = randomUUID();
    const operation = Object.hasOwn(routes, request.path) ? routes[request.path] : undefined;
    let result: SafeEvent['result'] = 'ok';
    response.set('Cache-Control', 'no-store');
    response.set('X-Content-Type-Options', 'nosniff');
    try {
      if (
        !operation ||
        request.method !== 'POST' ||
        Object.keys(request.query).length ||
        !request.is('application/json') ||
        request.rawBody.length > 2048
      ) {
        throw new ApiError(400, 'invalid_request');
      }
      const header = request.get('Authorization') ?? '';
      if (header.length > 8192 || !/^Bearer \S+$/.test(header))
        throw new ApiError(401, 'unauthenticated');
      await attestation.verify(request.get('X-Firebase-AppCheck'));
      const actor = await auth.verify(header.slice(7));
      const value = await service(
        operation,
        actor,
        request.body as unknown,
        request.get('X-App-Session'),
      );
      response.status(200).json(value);
    } catch (error: unknown) {
      result = error instanceof ApiError ? error.code : 'internal_error';
      response
        .status(error instanceof ApiError ? error.status : 500)
        .json({ error: result, requestId });
    } finally {
      safeLog(
        { requestId, operation: operation ?? 'unknown', result, latencyMs: Date.now() - start },
        sink,
      );
    }
  };
}
