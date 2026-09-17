import type { Auth } from 'firebase-admin/auth';
import { ApiError, type Principal } from '../domain/account.js';

export interface Authenticator {
  verify(token: string): Promise<Principal>;
}
export function firebaseAuthenticator(auth: Auth): Authenticator {
  return {
    verify: async (token) => {
      try {
        const claims = await auth.verifyIdToken(token, true);
        const current = await auth.getUser(claims.uid);
        if (
          current.disabled ||
          claims.firebase.sign_in_provider !== 'password' ||
          !Number.isInteger(claims.auth_time) ||
          claims.auth_time <= 0
        ) {
          throw new Error('invalid_authentication');
        }
        // Administrative claims and email_verified in a stale token are never authoritative.
        return {
          uid: current.uid,
          authTime: claims.auth_time,
          emailVerified: current.emailVerified,
        };
      } catch {
        throw new ApiError(401, 'unauthenticated');
      }
    },
  };
}
