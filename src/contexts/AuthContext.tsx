import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  requestAccess: (email: string, password: string, name: string, role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo user accounts - predefined for the demo
export const DEMO_USERS: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    name: 'System Administrator',
    isApproved: true,
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    email: 'warehouse@example.com',
    password: 'demo123',
    role: 'warehouse',
    name: 'Warehouse Manager',
    isApproved: true,
    createdAt: '2024-01-01'
  },
  {
    id: '3',
    email: 'hospital@example.com',
    password: 'demo123',
    role: 'hospital',
    name: 'Hospital Staff',
    isApproved: true,
    createdAt: '2024-01-01'
  },
  {
    id: '4',
    email: 'clinician@example.com',
    password: 'demo123',
    role: 'clinician',
    name: 'Dr. Sarah Johnson',
    isApproved: true,
    createdAt: '2024-01-01'
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(DEMO_USERS);

  const login = (email: string, password: string): boolean => {
    const foundUser = users.find(u => u.email === email && u.password === password && u.isApproved);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const requestAccess = (email: string, password: string, name: string, role: UserRole): boolean => {
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return false;
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      password,
      role,
      name,
      isApproved: false, // Will need admin approval
      createdAt: new Date().toISOString()
    };

    setUsers(prev => [...prev, newUser]);
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, requestAccess }}>
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