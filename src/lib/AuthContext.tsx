import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  session: any | null;
  user: any | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
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
