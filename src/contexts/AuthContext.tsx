import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  name: string;
  studentId: string;
  email: string;
  department?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  register: (name: string, studentId: string, email: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  changePassword: (newPassword: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check local storage for an existing session on load
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
  }, []);

  const login = (email: string) => {
    // In a real app, this would verify password against a backend.
    // For this mock, we just check if the user exists in our local "database" (localStorage users array)
    const storedUsers = localStorage.getItem('users');
    let users: User[] = [];
    if (storedUsers) {
      try {
        users = JSON.parse(storedUsers);
      } catch (e) {
        console.error("Failed to parse users", e);
      }
    }
    
    const foundUser = users.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
    } else {
      // If no user found in mock DB, just log them in with mock data for testing if we wanted, 
      // but to be strict, we'll throw an error or alert. We'll just alert for simplicity in this mock.
      alert('User not found. Please register first.');
      throw new Error('User not found');
    }
  };

  const register = (name: string, studentId: string, email: string) => {
    const newUser: User = { name, studentId, email };
    
    // Get existing users
    const storedUsers = localStorage.getItem('users');
    let users: User[] = [];
    if (storedUsers) {
      try {
        users = JSON.parse(storedUsers);
      } catch (e) {
        console.error("Failed to parse users", e);
      }
    }

    // Check if email already exists
    if (users.find(u => u.email === email)) {
      alert('Email already registered.');
      throw new Error('Email already registered');
    }

    // Save new user
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Log the user in
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...data };
    
    // Update existing users in local storage
    const storedUsers = localStorage.getItem('users');
    let users: User[] = [];
    if (storedUsers) {
      try {
        users = JSON.parse(storedUsers);
      } catch (e) {
        console.error("Failed to parse users", e);
      }
    }
    
    const userIndex = users.findIndex(u => u.email === user.email);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
    }

    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const changePassword = (newPassword: string) => {
    // In a real app, this would hit an API.
    // For this mock, we just simulate success.
    console.log(`Password changed to: ${newPassword}`);
    alert('Password successfully changed!');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, changePassword }}>
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
