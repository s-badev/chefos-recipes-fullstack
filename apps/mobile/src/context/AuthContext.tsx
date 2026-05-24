import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import {
  getCurrentUser,
  loginUser,
  registerUser
} from "../services/api";
import type { MobileUser } from "../types";

type AuthContextValue = {
  isLoading: boolean;
  token: string | null;
  user: MobileUser | null;
  isAuthenticated: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const TOKEN_KEY = "chefos_mobile_token";
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<MobileUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);

        if (!storedToken) {
          return;
        }

        const restoredUser = await getCurrentUser(storedToken);

        if (isMounted) {
          setToken(storedToken);
          setUser(restoredUser);
        }
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistSession = useCallback(async (nextToken: string, nextUser: MobileUser) => {
    await SecureStore.setItemAsync(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      const response = await loginUser(input);

      await persistSession(response.token, response.user);
    },
    [persistSession]
  );

  const register = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const response = await registerUser(input);

      await persistSession(response.token, response.user);
    },
    [persistSession]
  );

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      token,
      user,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout
    }),
    [isLoading, login, logout, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
