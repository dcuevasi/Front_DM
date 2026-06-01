import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/components/AuthContext';

export default function LoginScreen() {
  const { token, login, register, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  if (loading) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#36D9B7" />
      </View>
    );
  }

  if (token) {
    return <Redirect href="/(tabs)" />;
  }

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setErrorMessage('Ingrese correo y contraseña.');
      return;
    }

    setErrorMessage('');

    try {
      if (isRegistering) {
        if (password.length < 8) {
          setErrorMessage('La contraseña debe tener al menos 8 caracteres.');
          return;
        }
        await register(trimmedEmail, password);
      } else {
        await login(trimmedEmail, password);
      }
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Error inesperado');
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.bgAuroraTop} />
      <View style={styles.bgAuroraBottom} />

      <View style={styles.card}>
        <Text style={styles.title}>{isRegistering ? 'Crear cuenta' : 'Inicia sesión'}</Text>
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

          <Pressable style={styles.primaryButton} onPress={handleSubmit}>
            <Text style={styles.primaryButtonText}>
              {isRegistering ? 'Registrarse' : 'Entrar'}
            </Text>
          </Pressable>

          <Pressable onPress={() => { setIsRegistering(!isRegistering); setErrorMessage(''); }}>
            <Text style={styles.helperText}>
              {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </Text>
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
  title: {
    color: '#F2F7FF',
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
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
