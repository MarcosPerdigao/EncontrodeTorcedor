import { useState } from 'react';
import {
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { SessionDTO } from '@social/contracts';
import { completeAccount, enter, leave, recover, refreshSession, verifyEmail } from './auth';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [session, setSession] = useState<SessionDTO | undefined>();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function run(work: () => Promise<void>) {
    setBusy(true);
    setMessage('');
    try {
      await work();
    } catch {
      setMessage('Não foi possível concluir. Confira os dados, sua sessão ou tente mais tarde.');
    } finally {
      setBusy(false);
      setPassword('');
      setBirthDate('');
    }
  }
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Encontro de Torcedor</Text>
        <Text style={styles.subtitle}>Paixão em comum. Respeito sempre.</Text>
        <Text>Ambiente de desenvolvimento local. Use somente dados fictícios.</Text>
        {!session ? (
          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.heading}>
              Acesse sua conta
            </Text>
            <TextInput
              style={styles.input}
              accessibilityLabel="E-mail"
              placeholder="E-mail"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!busy}
            />
            <TextInput
              style={styles.input}
              accessibilityLabel="Senha"
              placeholder="Senha"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!busy}
              autoCapitalize="none"
            />
            <Button
              title="Entrar"
              disabled={busy || !email || !password}
              onPress={() =>
                void run(async () => {
                  setSession(await enter(email, password, false));
                  setEmail('');
                })
              }
            />
            <Button
              title="Criar conta"
              disabled={busy || !email || password.length < 12}
              onPress={() =>
                void run(async () => {
                  setSession(await enter(email, password, true));
                  setEmail('');
                })
              }
            />
            <Text>Para criar uma conta, use uma senha com pelo menos 12 caracteres.</Text>
            <Button
              title="Recuperar acesso"
              disabled={busy || !email}
              onPress={() =>
                void run(async () => {
                  await recover(email);
                  setMessage(
                    'Se for possível enviar orientações, elas chegarão ao e-mail informado.',
                  );
                })
              }
            />
          </View>
        ) : (
          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.heading}>
              Sua conta
            </Text>
            {!session.emailVerified ? (
              <>
                <Text>Confirme seu e-mail para continuar.</Text>
                <Button
                  title="Enviar confirmação"
                  disabled={busy}
                  onPress={() =>
                    void run(async () => {
                      await verifyEmail();
                      setMessage('Confira as orientações de confirmação.');
                    })
                  }
                />
              </>
            ) : session.onboardingState === 'birth_date_required' ? (
              <>
                <Text>
                  Informe sua data de nascimento. Ela é privada e não será exibida a outras pessoas.
                </Text>
                <TextInput
                  style={styles.input}
                  accessibilityLabel="Nascimento no formato ano-mês-dia"
                  placeholder="AAAA-MM-DD"
                  value={birthDate}
                  onChangeText={setBirthDate}
                  editable={!busy}
                  maxLength={10}
                />
                <Button
                  title="Registrar nascimento"
                  disabled={busy || birthDate.length !== 10}
                  onPress={() =>
                    void run(async () => {
                      setSession(await completeAccount(birthDate));
                    })
                  }
                />
              </>
            ) : (
              <Text>
                {session.eligibilityStatus === 'ineligible'
                  ? 'O acesso não está disponível para esta conta.'
                  : 'Dados iniciais registrados. A verificação de elegibilidade ainda está pendente.'}
              </Text>
            )}
            <Button
              title="Atualizar estado"
              disabled={busy}
              onPress={() =>
                void run(async () => {
                  setSession(await refreshSession());
                })
              }
            />
            <Button
              title="Sair"
              disabled={busy}
              onPress={() =>
                void run(async () => {
                  const revoked = await leave();
                  setSession(undefined);
                  setEmail('');
                  setMessage(
                    revoked
                      ? 'Sessões revogadas. Você saiu.'
                      : 'Você saiu deste dispositivo. Não foi possível confirmar a revogação no servidor.',
                  );
                })
              }
            />
          </View>
        )}
        <Text accessibilityLiveRegion="polite">{busy ? 'Aguarde…' : message}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f1' },
  content: {
    padding: 28,
    paddingTop: 64,
    gap: 18,
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
  },
  title: { fontSize: 30, fontWeight: '700', color: '#181818' },
  subtitle: { fontSize: 18, color: '#444' },
  heading: { fontSize: 22, fontWeight: '600' },
  section: { gap: 16, paddingVertical: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#777',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#fff',
    color: '#181818',
  },
});
