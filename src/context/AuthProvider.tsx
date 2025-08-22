
"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  type User,
  signOut as firebaseSignOut
} from "firebase/auth";
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/'];
const APP_ROUTES_PREFIX = '/';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (loading) return;
    
    const isAuthRoute = AUTH_ROUTES.includes(pathname);

    if (user && isAuthRoute) {
      // If user is logged in and tries to access an auth page, redirect to dashboard
      router.push('/dashboard');
    } else if (!user && !isAuthRoute && pathname.startsWith(APP_ROUTES_PREFIX)) {
      // If user is not logged in and tries to access a protected app page, redirect to login
      router.push('/login');
    }
    
  }, [user, loading, pathname, router]);

  const logout = async () => {
    await firebaseSignOut(auth);
    router.push('/login');
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
