import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { authApi, userApi, type AuthResponse, type UserRole } from '../services/eventflow';
import { setAuthToken } from '../services/client';

interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'eventflow_auth';

interface StoredAuth {
  user: User;
  token: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth from localStorage on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const { user: storedUser, token: storedToken }: StoredAuth = JSON.parse(stored);
          // Set token first so API calls are authenticated
          setAuthToken(storedToken);
          // If email is not already cached, fetch it from auth service
          if (!storedUser.email) {
            try {
              const userInfo = await userApi.getUser(storedUser.id);
              storedUser.email = userInfo.email;
            } catch (err) {
              console.warn('Could not fetch user email on session restore:', err);
            }
          }
          setUser(storedUser);
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Failed to load auth from storage:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredAuth();
  }, []);

  // Save auth to localStorage whenever it changes
  useEffect(() => {
    if (user && token) {
      const authData: StoredAuth = { user, token };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      setAuthToken(token); // Set token in API client
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setAuthToken(null); // Clear token from API client
    }
  }, [user, token]);

  const handleAuthResponse = async (response: AuthResponse) => {
    // Set the token immediately so subsequent API calls are authenticated
    setAuthToken(response.token);

    let email: string | undefined;
    try {
      const userInfo = await userApi.getUser(response.userId);
      email = userInfo.email;
    } catch (err) {
      console.warn('Could not fetch user email from auth service:', err);
    }

    const userData: User = {
      id: response.userId,
      name: response.name,
      email,
      role: response.role,
    };
    setUser(userData);
    setToken(response.token);
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      await handleAuthResponse(response);
      toast.success('Logged in successfully!');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    try {
      const response = await authApi.register({ name, email, password, role });
      await handleAuthResponse(response);
      toast.success('Account created successfully!');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    toast.info('Logged out successfully');
  };

  const updateToken = (newToken: string) => {
    setToken(newToken);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    updateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
