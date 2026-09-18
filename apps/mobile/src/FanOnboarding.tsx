import { useMemo, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import type { CreateFanProfileCommand } from '@social/contracts';

type Draft = Omit<CreateFanProfileCommand, 'requestKey'>;
type Props = {
  busy: boolean;
  onSubmit: (draft: Draft) => Promise<void>;
};

const clubs = [
  { id: 'club_aaaaaaaaaaaaaaaaaaaaaaaa', label: 'Clube Horizonte' },
  { id: 'club_bbbbbbbbbbbbbbbbbbbbbbbb', label: 'União das Estrelas' },
] as const;
const activeIdol = 'idol_cccccccccccccccccccccccc';
const intensities = [
  ['when_possible', 'Acompanho quando posso'],
  ['frequent_follower', 'Acompanho bastante'],
  ['part_of_routine', 'Futebol faz parte da minha rotina'],
  ['central_to_life', 'Meu clube é parte muito importante da minha vida'],
] as const;
const intentions = [
  ['relationship', 'Relacionamento'],
  ['dating', 'Conhecer alguém'],
  ['friendship', 'Amizade'],
  ['matchday_companion', 'Companhia para jogos'],
  ['events_companion', 'Companhia para eventos'],
] as const;
const scopes = [
  ['same_club', 'Mesma torcida'],
  ['other_clubs', 'Outras torcidas'],
  ['self_declared_rivals', 'Rivais também'],
] as const;

function Choice({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      title={(selected ? '✓ ' : '') + label}
      disabled={disabled}
      onPress={onPress}
      color={selected ? '#176B3A' : undefined}
    />
  );
}

export function FanOnboarding({ busy, onSubmit }: Props) {
  const [step, setStep] = useState(0);
  const [clubId, setClubId] = useState<string>(clubs[0].id);
  const [intensity, setIntensity] = useState<Draft['fanProfile']['intensity']>('when_possible');
  const [idolSelected, setIdolSelected] = useState(false);
  const [attendsStadium, setAttendsStadium] = useState(false);
  const [sector, setSector] = useState('');
  const [selectedIntentions, setSelectedIntentions] = useState<
    Draft['connectionIntents'][number][]
  >(['friendship']);
  const [selectedScopes, setSelectedScopes] = useState<
    Draft['connectionPreference']['scopes'][number][]
  >(['same_club']);
  const [specificClub, setSpecificClub] = useState(false);
  const [music, setMusic] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [lifestyle, setLifestyle] =
    useState<NonNullable<Draft['lifestyleProfile']>['lifestyleStyle']>();

  const draft = useMemo<Draft>(() => {
    const otherClub = clubs.find((club) => club.id !== clubId)?.id;
    const musicPreferences = music
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .slice(0, 3);
    const hobbyValues = hobbies
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .slice(0, 5);
    const lifestyleProfile =
      musicPreferences.length || hobbyValues.length || lifestyle
        ? {
            ...(musicPreferences.length ? { musicPreferences } : {}),
            ...(hobbyValues.length ? { hobbies: hobbyValues } : {}),
            ...(lifestyle ? { lifestyleStyle: lifestyle } : {}),
          }
        : undefined;
    return {
      fanProfile: {
        primaryClubId: clubId,
        intensity,
        favoriteIdolIds: idolSelected && clubId === clubs[0].id ? [activeIdol] : [],
        stadiumExperience: {
          attendsStadium,
          ...(attendsStadium && sector.trim() ? { preferredSector: sector.trim() } : {}),
        },
        clubPreferences: [
          { clubId, relationshipType: 'supporter' },
          ...(otherClub ? [{ clubId: otherClub, relationshipType: 'sympathizer' as const }] : []),
        ],
      },
      connectionIntents: selectedIntentions,
      connectionPreference: {
        scopes: [...selectedScopes, ...(specificClub ? (['specific_clubs'] as const) : [])],
        specificClubIds: specificClub && otherClub ? [otherClub] : [],
      },
      ...(lifestyleProfile ? { lifestyleProfile } : {}),
    };
  }, [
    attendsStadium,
    clubId,
    hobbies,
    idolSelected,
    intensity,
    lifestyle,
    music,
    sector,
    selectedIntentions,
    selectedScopes,
    specificClub,
  ]);

  const toggle = <T,>(values: T[], value: T, minimumOne = false): T[] =>
    values.includes(value)
      ? minimumOne && values.length === 1
        ? values
        : values.filter((item) => item !== value)
      : [...values, value];

  return (
    <View style={styles.section}>
      {step === 0 && (
        <>
          <Text accessibilityRole="header" style={styles.heading}>
            Bem-vindo
          </Text>
          <Text>
            O lugar onde pessoas que compartilham uma paixão encontram conexões com significado.
          </Text>
          <Text>Respeito, bloqueio e denúncia fazem parte da cultura da comunidade.</Text>
        </>
      )}
      {step === 1 && (
        <>
          <Text accessibilityRole="header" style={styles.heading}>
            Sua identidade de torcedor
          </Text>
          <Text>Escolha um clube do catálogo fictício local.</Text>
          {clubs.map((club) => (
            <Choice
              key={club.id}
              label={club.label}
              selected={clubId === club.id}
              disabled={busy}
              onPress={() => {
                setClubId(club.id);
                if (club.id !== clubs[0].id) setIdolSelected(false);
              }}
            />
          ))}
          <Text>Como você vive essa paixão?</Text>
          {intensities.map(([value, label]) => (
            <Choice
              key={value}
              label={label}
              selected={intensity === value}
              disabled={busy}
              onPress={() => setIntensity(value)}
            />
          ))}
          {clubId === clubs[0].id && (
            <Choice
              label="Alex da Serra — ídolo fictício"
              selected={idolSelected}
              disabled={busy}
              onPress={() => setIdolSelected((value) => !value)}
            />
          )}
          <Choice
            label="Frequento estádio"
            selected={attendsStadium}
            disabled={busy}
            onPress={() => setAttendsStadium((value) => !value)}
          />
          {attendsStadium && (
            <TextInput
              style={styles.input}
              accessibilityLabel="Setor preferido opcional"
              placeholder="Setor preferido, opcional"
              value={sector}
              onChangeText={setSector}
              maxLength={60}
            />
          )}
        </>
      )}
      {step === 2 && (
        <>
          <Text accessibilityRole="header" style={styles.heading}>
            O que você procura?
          </Text>
          {intentions.map(([value, label]) => (
            <Choice
              key={value}
              label={label}
              selected={selectedIntentions.includes(value)}
              disabled={busy}
              onPress={() => setSelectedIntentions((current) => toggle(current, value, true))}
            />
          ))}
        </>
      )}
      {step === 3 && (
        <>
          <Text accessibilityRole="header" style={styles.heading}>
            Preferências de conexão
          </Text>
          <Text>Você declara sua abertura. A plataforma não classifica rivalidades.</Text>
          {scopes.map(([value, label]) => (
            <Choice
              key={value}
              label={label}
              selected={selectedScopes.includes(value)}
              disabled={busy}
              onPress={() => setSelectedScopes((current) => toggle(current, value, true))}
            />
          ))}
          <Choice
            label="Também escolher clube específico"
            selected={specificClub}
            disabled={busy}
            onPress={() => setSpecificClub((value) => !value)}
          />
        </>
      )}
      {step === 4 && (
        <>
          <Text accessibilityRole="header" style={styles.heading}>
            Além dos 90 minutos
          </Text>
          <Text>Opcional. Informe até 3 estilos musicais e 5 hobbies, separados por vírgula.</Text>
          <TextInput
            style={styles.input}
            accessibilityLabel="Estilos musicais opcionais"
            placeholder="Música"
            value={music}
            onChangeText={setMusic}
            maxLength={120}
          />
          <TextInput
            style={styles.input}
            accessibilityLabel="Hobbies opcionais"
            placeholder="Hobbies"
            value={hobbies}
            onChangeText={setHobbies}
            maxLength={200}
          />
          {(['homebody', 'balanced', 'outgoing'] as const).map((value) => (
            <Choice
              key={value}
              label={
                value === 'homebody'
                  ? 'Caseiro'
                  : value === 'balanced'
                    ? 'Equilibrado'
                    : 'Rolezeiro'
              }
              selected={lifestyle === value}
              disabled={busy}
              onPress={() => setLifestyle(lifestyle === value ? undefined : value)}
            />
          ))}
        </>
      )}
      {step === 5 && (
        <>
          <Text accessibilityRole="header" style={styles.heading}>
            Como as pessoas verão você
          </Text>
          <Text>Clube: {clubs.find((club) => club.id === clubId)?.label}</Text>
          <Text>Intenções selecionadas: {selectedIntentions.length}</Text>
          <Text>Interesses opcionais: {music || hobbies || 'não informados'}</Text>
          <Text>
            Sobrenome, telefone, CPF, nascimento e localização precisa não fazem parte deste perfil.
          </Text>
          <Text>A verificação ajuda a manter a comunidade segura e poderá ser feita depois.</Text>
          <Button
            title="Criar perfil de torcedor"
            disabled={busy}
            onPress={() => void onSubmit(draft)}
          />
        </>
      )}
      <View style={styles.navigation}>
        {step > 0 && <Button title="Voltar" disabled={busy} onPress={() => setStep(step - 1)} />}
        {step < 5 && <Button title="Continuar" disabled={busy} onPress={() => setStep(step + 1)} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  heading: { fontSize: 22, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: '#8A8A8A',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  navigation: { gap: 8, marginTop: 8 },
});
