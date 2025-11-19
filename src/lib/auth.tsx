import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as api from './api';
import { User } from './api';
import { socketService } from './socket';

interface AuthContextType {
  user: User | null;
  session: string | null;
  userRole: 'TEACHER' | 'STUDENT' | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: 'TEACHER' | 'STUDENT') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'TEACHER' | 'STUDENT' | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      verifyAndSetUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyAndSetUser = async (token: string) => {
    try {
      const user = await api.verifyToken(token);
      if (user) {
        setUser(user);
        setSession(token);
        setUserRole(user.role);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: 'TEACHER' | 'STUDENT') => {
    try {
      const { user, token } = await api.signUp(email, password, name, role);
      
      localStorage.setItem(TOKEN_KEY, token);
      setUser(user);
      setSession(token);
      setUserRole(user.role);

      // Initialize Socket.io connection
      socketService.connect();

      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
      toast.error(errorMessage);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user, token } = await api.signIn(email, password);
      
      localStorage.setItem(TOKEN_KEY, token);
      setUser(user);
      setSession(token);
      setUserRole(user.role);

      // Initialize Socket.io connection
      socketService.connect();

      toast.success('Signed in successfully!');
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      toast.error(errorMessage);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setSession(null);
      setUserRole(null);

      // Disconnect Socket.io
      socketService.disconnect();

      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      toast.error(errorMessage);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, loading, signUp, signIn, signOut }}>
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
