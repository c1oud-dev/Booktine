import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
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
  updateUser: (profile: UserProfile) => void;
  clearSession: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [authVersion, setAuthVersion] = useState(0);

  const refreshUser = useCallback(async () => {
    const profile = await getMyProfile();
    setUser(profile);
   }, []);

  const updateUser = useCallback((profile: UserProfile) => {
    setUser(profile);
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const handleAuthChange = async () => {
      setAuthVersion((version) => version + 1);

      if (!getAccessToken()) {
        setUser(null);
        return;
      }

      try {
        const profile = await getMyProfile();
        setUser(profile);
      } catch {
        clearSession();
      }
    };
    window.addEventListener('auth-change', handleAuthChange);

    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [clearSession]);

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
    updateUser,
    clearSession,
  }), [user, initializing, authVersion, refreshUser, updateUser, clearSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.');
  }

  return context;
}
