import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from './authApi';
import { getAccessToken, setAccessToken } from '@/api/http';
import { getMyProfile, type UserProfile } from '@/api/userApi';

type AuthContextValue = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  initializing: boolean;
  login: (email: string, password: string, keepLogin: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearSession: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [authVersion, setAuthVersion] = useState(0);

  const refreshUser = async () => {
    const profile = await getMyProfile();
    setUser(profile);
  };

  const clearSession = () => {
    setAccessToken(null);
    setUser(null);
  };

  useEffect(() => {
    const handleAuthChange = () => setAuthVersion((version) => version + 1);
    window.addEventListener('auth-change', handleAuthChange);

    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        await authApi.reissue();
        const profile = await getMyProfile();
        if (mounted) {
          setUser(profile);
        }
      } catch {
        if (mounted) {
          clearSession();
        }
      } finally {
        if (mounted) {
          setInitializing(false);
        }
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: Boolean(getAccessToken()),
    isAdmin: user?.role === 'ROLE_ADMIN',
    initializing,
    login: async (email, password, keepLogin) => {
      await authApi.login(email, password, keepLogin);
      await refreshUser();
    },
    logout: async () => {
      await authApi.logout();
      setUser(null);
    },
    refreshUser,
    clearSession,
  }), [user, initializing, authVersion]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.');
  }

  return context;
}
