import {
  affinityContextSchema,
  affinityEngineInputSchema,
  affinityExplanationSchema,
  affinitySharedTextSchema,
  type AffinityContext,
  type AffinityEngineInput,
  type AffinityExplanation,
  type AffinitySignal,
  type PublicProfileDTO,
} from '@social/contracts';

const intensityLabels = {
  when_possible: 'acompanhar o clube quando possível',
  frequent_follower: 'acompanhar o clube com frequência',
  part_of_routine: 'ter o clube como parte da rotina',
  central_to_life: 'ter o clube como parte central da vida',
} as const;
const lifestyleLabels = {
  homebody: 'um estilo de vida mais caseiro',
  balanced: 'um estilo de vida equilibrado',
  outgoing: 'um estilo de vida mais sociável',
} as const;
const petsLabels = {
  has_pets: 'conviver com pets',
  likes_pets: 'gostar de pets',
} as const;
const intentLabels = {
  relationship: 'buscar relacionamento',
  dating: 'conhecer alguém para encontros',
  friendship: 'buscar amizade',
  matchday_companion: 'buscar companhia para jogos',
  events_companion: 'buscar companhia para eventos',
} as const;

function normalize(value: string): string {
  return value.normalize('NFKC').trim().toLocaleLowerCase('pt-BR');
}

function safePublicTexts(values: readonly string[]): string[] {
  const unique = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const parsed = affinitySharedTextSchema.safeParse(value);
    if (!parsed.success) continue;
    const key = normalize(parsed.data);
    if (!unique.has(key)) {
      unique.add(key);
      result.push(parsed.data);
    }
  }
  return result;
}

function sharedValues(left: readonly string[], right: readonly string[]): string[] {
  const rightValues = new Set(right.map(normalize));
  return safePublicTexts(left).filter((value) => rightValues.has(normalize(value)));
}

export function createAffinityContext(input: PublicProfileDTO): AffinityContext {
  const profile = affinityEngineInputSchema.shape.left.parse(input);
  return affinityContextSchema.parse({
    football: {
      primaryClub: profile.fanIdentity.club.name,
      idols: profile.fanIdentity.idols,
      fanIntensity: profile.fanIdentity.intensity,
      stadiumInterest: profile.fanIdentity.stadium !== undefined,
    },
    personality: {
      hobbies: safePublicTexts(profile.lifestyle?.hobbies ?? []),
      musicPreferences: safePublicTexts(profile.lifestyle?.musicPreferences ?? []),
      ...(profile.lifestyle?.lifestyleStyle
        ? { lifestyleStyle: profile.lifestyle.lifestyleStyle }
        : {}),
      ...(profile.lifestyle?.pets ? { pets: profile.lifestyle.pets } : {}),
    },
    connectionIntents: profile.connectionIntents ?? [],
  });
}

export function explainAffinity(input: AffinityEngineInput): AffinityExplanation {
  const source = affinityEngineInputSchema.parse(input);
  if (!source.eligibility.canView || source.eligibility.reason !== 'eligible') {
    throw new Error('affinity_not_available');
  }

  const left = createAffinityContext(source.left);
  const right = createAffinityContext(source.right);
  const signals: AffinitySignal[] = [];

  if (normalize(left.football.primaryClub) === normalize(right.football.primaryClub)) {
    signals.push({
      kind: 'same_club',
      sharedValue: left.football.primaryClub,
      explanation: `Vocês torcem para ${left.football.primaryClub}.`,
    });
  }

  for (const idol of sharedValues(left.football.idols, right.football.idols)) {
    signals.push({
      kind: 'same_idol',
      sharedValue: idol,
      explanation: `Vocês gostam do ídolo ${idol}.`,
    });
  }

  if (left.football.fanIntensity === right.football.fanIntensity) {
    const sharedValue = intensityLabels[left.football.fanIntensity];
    signals.push({
      kind: 'same_fan_intensity',
      sharedValue,
      explanation: `Vocês compartilham ${sharedValue}.`,
    });
  }

  if (left.football.stadiumInterest && right.football.stadiumInterest) {
    signals.push({
      kind: 'shared_stadium_interest',
      sharedValue: 'interesse em estádio',
      explanation: 'Vocês demonstram interesse em experiências de estádio.',
    });
  }

  for (const hobby of sharedValues(left.personality.hobbies, right.personality.hobbies)) {
    signals.push({
      kind: 'shared_hobby',
      sharedValue: hobby,
      explanation: `Vocês compartilham o hobby ${hobby}.`,
    });
  }

  for (const music of sharedValues(
    left.personality.musicPreferences,
    right.personality.musicPreferences,
  )) {
    signals.push({
      kind: 'shared_music',
      sharedValue: music,
      explanation: `Vocês gostam de ${music}.`,
    });
  }

  if (
    left.personality.lifestyleStyle &&
    left.personality.lifestyleStyle === right.personality.lifestyleStyle
  ) {
    const sharedValue = lifestyleLabels[left.personality.lifestyleStyle];
    signals.push({
      kind: 'same_lifestyle_style',
      sharedValue,
      explanation: `Vocês compartilham ${sharedValue}.`,
    });
  }

  if (
    left.personality.pets &&
    left.personality.pets !== 'no_preference' &&
    left.personality.pets === right.personality.pets
  ) {
    const sharedValue = petsLabels[left.personality.pets];
    signals.push({
      kind: 'same_pets_preference',
      sharedValue,
      explanation: `Vocês compartilham o interesse em ${sharedValue}.`,
    });
  }

  for (const intent of left.connectionIntents.filter((candidate) =>
    right.connectionIntents.includes(candidate),
  )) {
    const sharedValue = intentLabels[intent];
    signals.push({
      kind: 'shared_connection_intent',
      sharedValue,
      explanation: `Vocês têm em comum o objetivo de ${sharedValue}.`,
    });
  }

  return affinityExplanationSchema.parse(
    signals.length > 0 ? { hasAffinity: true, signals } : { hasAffinity: false, signals: [] },
  );
}
