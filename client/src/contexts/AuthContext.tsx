import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Player, AuthResponse } from 'shared';
import { api } from '../utils/api';

interface AuthContextType {
  token: string | null;
  player: Player | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Token exists, you could validate it here
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await api.login({ email, password }) as AuthResponse;
    setToken(response.token);
    setPlayer(response.player);
    localStorage.setItem('token', response.token);
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await api.register({ username, email, password }) as AuthResponse;
    setToken(response.token);
    setPlayer(response.player);
    localStorage.setItem('token', response.token);
  };

  const logout = async () => {
    await api.logout();
    setToken(null);
    setPlayer(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, player, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
