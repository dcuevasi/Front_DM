import { createContext, useContext, useMemo, useState } from 'react';

type User = {
  name: string;
  email: string;
  lastConnection: string;
};

type AuthContextValue = {
  user: User | null;
  signIn: (email: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const signIn = (email: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const nameFromEmail = trimmedEmail.split('@')[0] || 'Usuario';
    const normalizedName =
      nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1).replace(/[._-]/g, ' ');

    setUser({
      name: normalizedName,
      email: trimmedEmail,
      lastConnection: new Date().toLocaleString('es-CL'),
    });
  };

  const signOut = () => {
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      signIn,
      signOut,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }

  return context;
}
