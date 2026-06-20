'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User } from '../types';
import { getUsers } from '../api/shares';
import { setAxiosEmail } from '../lib/axios';

interface UserContextProps {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  users: User[];
  isLoading: boolean;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const setCurrentUser = useCallback((user: User) => {
    setCurrentUserState(user);
    setAxiosEmail(user.email);
    try {
      localStorage.setItem('docflow_active_user_email', user.email);
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
    // Invalidate TanStack Query client cache entirely
    queryClient.invalidateQueries();
  }, [queryClient]);

  useEffect(() => {
    async function loadUsers() {
      try {
        const loadedUsers = await getUsers();
        setUsers(loadedUsers);
        
        let persistedEmail: string | null = null;
        try {
          persistedEmail = localStorage.getItem('docflow_active_user_email');
        } catch (e) {
          console.error('LocalStorage read error:', e);
        }

        const matchedUser = persistedEmail ? loadedUsers.find(u => u.email === persistedEmail) : null;
        if (matchedUser) {
          setCurrentUser(matchedUser);
        } else {
          // Default to Alice
          const alice = loadedUsers.find(u => u.email === 'alice@example.com');
          if (alice) {
            setCurrentUser(alice);
          } else if (loadedUsers.length > 0) {
            setCurrentUser(loadedUsers[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, [setCurrentUser]);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, users, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
