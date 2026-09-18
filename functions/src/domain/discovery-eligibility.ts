import { z } from 'zod';
import {
  accountStatusSchema,
  audienceRuleSchema,
  discoveryEligibilitySchema,
  eligibilityStatusSchema,
  identityStatusSchema,
  interactionPermissionSchema,
  trustContextSchema,
  type AudienceRule,
  type DiscoveryEligibility,
  type InteractionPermission,
  type TrustContext,
  type TrustLevel,
} from '@social/contracts';

export const discoveryParticipantSourceSchema = z.strictObject({
  accountStatus: accountStatusSchema,
  eligibilityStatus: eligibilityStatusSchema,
  identityVerificationStatus: identityStatusSchema,
  safetyRestriction: z.enum(['none', 'restricted']),
  hasPublicProfile: z.boolean(),
});
export type DiscoveryParticipantSource = z.infer<typeof discoveryParticipantSourceSchema>;

const audienceEvaluationSourceSchema = z.strictObject({
  viewer: discoveryParticipantSourceSchema,
  subject: discoveryParticipantSourceSchema,
  rule: audienceRuleSchema,
});
export type AudienceEvaluationSource = z.infer<typeof audienceEvaluationSourceSchema>;

export interface AudienceDecision {
  readonly eligibility: DiscoveryEligibility;
  readonly interaction: InteractionPermission;
}

export function deriveTrustLevel(input: DiscoveryParticipantSource): TrustLevel {
  const participant = discoveryParticipantSourceSchema.parse(input);
  if (participant.accountStatus === 'banned') return 'banned';
  if (
    participant.accountStatus === 'suspended' ||
    participant.accountStatus === 'deletion_pending' ||
    participant.accountStatus === 'deleted'
  ) {
    return 'suspended';
  }
  if (
    participant.eligibilityStatus === 'ineligible' ||
    participant.safetyRestriction === 'restricted'
  ) {
    return 'restricted';
  }
  return participant.identityVerificationStatus === 'verified' ? 'verified' : 'basic';
}

function canParticipate(participant: DiscoveryParticipantSource, trustLevel: TrustLevel): boolean {
  return (
    (participant.accountStatus === 'pending' || participant.accountStatus === 'active') &&
    (participant.eligibilityStatus === 'review_required' ||
      participant.eligibilityStatus === 'eligible') &&
    participant.hasPublicProfile &&
    (trustLevel === 'basic' || trustLevel === 'verified')
  );
}

function deniedInteraction(
  reason: Exclude<InteractionPermission['reason'], 'allowed'>,
  remainingInWindow: number,
  requiresVerification = false,
): InteractionPermission {
  return interactionPermissionSchema.parse({
    canInitiate: false,
    requiresVerification,
    remainingInWindow,
    reason,
  });
}

export function evaluateAudience(input: AudienceEvaluationSource): AudienceDecision {
  const source = audienceEvaluationSourceSchema.parse(input);
  const context: TrustContext = trustContextSchema.parse({
    viewer: deriveTrustLevel(source.viewer),
    subject: deriveTrustLevel(source.subject),
  });
  const rule: AudienceRule = source.rule;
  const remainingInWindow = Math.max(0, rule.interactionLimit.maximum - rule.interactionLimit.used);

  if (
    !canParticipate(source.viewer, context.viewer) ||
    !canParticipate(source.subject, context.subject)
  ) {
    return {
      eligibility: discoveryEligibilitySchema.parse({
        canView: false,
        reason: 'participant_unavailable',
      }),
      interaction: deniedInteraction('participant_unavailable', remainingInWindow),
    };
  }

  if (rule.blockedByViewer || rule.blockedBySubject) {
    return {
      eligibility: discoveryEligibilitySchema.parse({ canView: false, reason: 'blocked' }),
      interaction: deniedInteraction('blocked', remainingInWindow),
    };
  }

  if (
    context.viewer === 'basic' &&
    context.subject === 'basic' &&
    rule.basicToBasicPolicy === 'pending'
  ) {
    return {
      eligibility: discoveryEligibilitySchema.parse({
        canView: false,
        reason: 'policy_pending',
      }),
      interaction: deniedInteraction('policy_pending', remainingInWindow),
    };
  }

  const eligibility = discoveryEligibilitySchema.parse({ canView: true, reason: 'eligible' });

  if (rule.subjectRequiresVerifiedInteraction && context.viewer !== 'verified') {
    return {
      eligibility,
      interaction: deniedInteraction('verification_required', remainingInWindow, true),
    };
  }

  if (remainingInWindow === 0) {
    return {
      eligibility,
      interaction: deniedInteraction('rate_limited', 0),
    };
  }

  return {
    eligibility,
    interaction: interactionPermissionSchema.parse({
      canInitiate: true,
      requiresVerification: false,
      remainingInWindow,
      reason: 'allowed',
    }),
  };
}
