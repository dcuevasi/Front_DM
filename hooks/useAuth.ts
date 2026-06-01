import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { secureStore } from '@/hooks/secureStore';
import { authApi } from '@/services/api';

const TOKEN_KEY = 'jwt_token';

interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    return JSON.parse(atob(token.split('.')[1])) as JwtPayload;
  } catch {
    return null;
  }
}

export function useAuthContext() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    secureStore.getItemAsync(TOKEN_KEY).then((saved) => {
      if (saved) {
        setToken(saved);
        setEmail(decodeJwt(saved)?.email ?? null);
      }
    }).finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (loginEmail: string, password: string) => {
    const result = await authApi.login(loginEmail, password);
    await secureStore.setItemAsync(TOKEN_KEY, result.token);
    setToken(result.token);
    setEmail(decodeJwt(result.token)?.email ?? null);
    router.replace('/(tabs)');
  }, [router]);

  const register = useCallback(async (registerEmail: string, password: string) => {
    const result = await authApi.register(registerEmail, password);
    await secureStore.setItemAsync(TOKEN_KEY, result.token);
    setToken(result.token);
    setEmail(decodeJwt(result.token)?.email ?? null);
    router.replace('/(tabs)');
  }, [router]);

  const logout = useCallback(async () => {
    await secureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setEmail(null);
    router.replace('/login');
  }, [router]);

  const value = useMemo(
    () => ({ token, email, loading, login, register, logout }),
    [token, email, loading, login, register, logout],
  );

  return value;
}
