export type VerificationStatus =
  'not_started' | 'pending' | 'verified' | 'rejected' | 'manual_review';
/** Provider reference is internal. No civil document is accepted by this boundary. */
export interface IdentityVerificationProvider {
  startVerification(
    accountReference: string,
  ): Promise<{ providerReference: string; status: VerificationStatus }>;
  verify(providerReference: string, proof: string): Promise<VerificationStatus>;
  getVerificationStatus(providerReference: string): Promise<VerificationStatus>;
}
/** No fake approval or client-controlled verification path in runtime. */
export class UnconfiguredIdentityProvider implements IdentityVerificationProvider {
  async startVerification(): Promise<never> {
    throw new Error('identity_provider_not_configured');
  }
  async verify(): Promise<never> {
    throw new Error('identity_provider_not_configured');
  }
  async getVerificationStatus(): Promise<never> {
    throw new Error('identity_provider_not_configured');
  }
}
