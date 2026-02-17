import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, getCurrentUser, logout as apiLogout } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
  isLoggedIn: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getCurrentUser);

  useEffect(() => {
    const stored = getCurrentUser();
    if (stored) setUser(stored);
  }, []);

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
