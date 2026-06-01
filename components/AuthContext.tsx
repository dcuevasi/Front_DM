import { createContext, useContext, useEffect } from 'react';
import type { useAuthContext } from '@/hooks/useAuth';
import { setTokenGetter } from '@/services/api';

type AuthContextValue = ReturnType<typeof useAuthContext>;

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export { AuthContext };

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }

  return context;
}

export function useSyncTokenGetter(token: string | null) {
  useEffect(() => {
    setTokenGetter(() => token);
    return () => { setTokenGetter(() => null); };
  }, [token]);
}
