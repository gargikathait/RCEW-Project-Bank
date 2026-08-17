import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '@shared/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  register: (userData: RegisterRequest) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (userData: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getAuthToken = () => localStorage.getItem('token');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    const restore = async () => {
      if (token && savedUser && token.split('.').length === 3) {
        try {
          const response = await fetch('/api/auth/profile', { headers: { Authorization: `Bearer ${token}` } });
          const data = await response.json();
          if (response.ok && data.success) {
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch {
          try { setUser(JSON.parse(savedUser)); } catch { localStorage.removeItem('token'); localStorage.removeItem('user'); }
        }
      }
      setLoading(false);
    };
    restore();
  }, []);

  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.user && data.token) {
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred',
      };
    }
  };

  const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.user) {
        // After successful registration, you might want to auto-login
        // For now, we'll just return the response
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred',
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
