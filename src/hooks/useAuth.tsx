import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  // True only while the initial session check (GET /api/auth/me) is in
  // flight on page load. Protected pages should wait for this before
  // deciding "not logged in" — otherwise an already-logged-in user gets
  // bounced to /login for a frame on every refresh.
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function parseJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore an existing session (httpOnly cookie) on load, so a refresh
  // doesn't silently log the user out.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me')
      .then((res) => parseJson(res))
      .then((data) => {
        if (!cancelled) setUser(data.user || null);
      })
      .catch(() => {
        // API unreachable — same posture as the booking store's fallback:
        // fail closed to "logged out" rather than pretend a session exists.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await parseJson(res);
      if (!res.ok) return { success: false, error: data.error || 'Login failed' };
      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: 'Could not reach the server. Check your connection and try again.' };
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<AuthResult> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await parseJson(res);
      if (!res.ok) return { success: false, error: data.error || 'Sign up failed' };
      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: 'Could not reach the server. Check your connection and try again.' };
    }
  };

  const logout = async () => {
    setUser(null);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Cookie clear failed server-side, but local state is already
      // cleared — worst case the cookie lingers until it expires (30d)
      // and the next /api/auth/me call still reflects it. Not worth
      // surfacing an error for a logout the user already sees as done.
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
