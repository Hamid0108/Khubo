import React, { createContext, useContext, useState } from 'react';

// Using partial user representation to emulate Supabase locally
export interface MockUser {
  id?: string;
  email?: string;
  [key: string]: any;
}

export interface MockSession {
  user: MockUser;
  [key: string]: any;
}

interface AuthContextType {
  session: MockSession | null;
  user: MockUser | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<MockSession | null>(null);
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signOut = async () => {
    setSession(null);
    setUser(null);
  };
  
  const signIn = (email: string) => {
    setSession({user: {email}});
    setUser({email});
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, signOut, signIn }}>
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
