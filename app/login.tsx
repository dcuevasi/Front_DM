import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { useAuth } from '@/components/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setErrorMessage('Ingrese correo y contraseña para continuar.');
      return;
    }

    signIn(trimmedEmail);
    setErrorMessage('');
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.bgAuroraTop} />
      <View style={styles.bgAuroraBottom} />

      <View style={styles.card}>
        <Text style={styles.title}>Inicia sesión</Text>
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="correo@dominio.com"
            placeholderTextColor="#8C8C8C"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            placeholder="********"
            placeholderTextColor="#8C8C8C"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Pressable style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>Entrar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#070C18',
    justifyContent: 'center',
    padding: 20,
  },
  bgAuroraTop: {
    position: 'absolute',
    width: 330,
    height: 330,
    borderRadius: 165,
    backgroundColor: '#5788d13a',
    top: -120,
    left: -100,
  },
  bgAuroraBottom: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#0BC3A14A',
    bottom: -150,
    right: -130,
  },
  bgOrb: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#68E3FF33',
    top: 130,
    right: 28,
  },
  card: {
    backgroundColor: '#10192F',
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: '#2A3D69',
    shadowColor: '#05070C',
    shadowOpacity: 0.45,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  eyebrow: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E2D4C',
    color: '#A6C2F8',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  title: {
    color: '#F2F7FF',
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    color: '#9BB1D8',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 18,
  },
  form: {
    gap: 9,
  },
  label: {
    color: '#C4D3EE',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  input: {
    backgroundColor: '#0C1430',
    borderWidth: 1,
    borderColor: '#2E467B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#EAF2FF',
  },
  errorText: {
    color: '#FF9E9E',
    fontSize: 13,
    marginTop: 6,
  },
  primaryButton: {
    marginTop: 14,
    backgroundColor: '#36D9B7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#06221C',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  helperText: {
    color: '#7D91B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
});
