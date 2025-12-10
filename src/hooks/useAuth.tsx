import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { fullName: string; email: string; phone: string; password: string }) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'found_it_users';
const CURRENT_USER_KEY = 'found_it_current_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const getUsers = (): Record<string, { user: User; password: string }> => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
  };

  const saveUsers = (users: Record<string, { user: User; password: string }>) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = getUsers();
    const userRecord = users[email.toLowerCase()];
    
    if (userRecord && userRecord.password === password) {
      setUser(userRecord.user);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userRecord.user));
      return true;
    }
    return false;
  };

  const register = async (data: { fullName: string; email: string; phone: string; password: string }): Promise<boolean> => {
    const users = getUsers();
    const emailKey = data.email.toLowerCase();
    
    if (users[emailKey]) {
      return false; // User already exists
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
    };

    users[emailKey] = { user: newUser, password: data.password };
    saveUsers(users);
    
    setUser(newUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
