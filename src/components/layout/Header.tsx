'use client';

import React from 'react';
import { useUser } from '../../context/UserContext';
import { FileText, User } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { currentUser, setCurrentUser, users } = useUser();

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUser = users.find((u) => u.id === e.target.value);
    if (selectedUser) {
      setCurrentUser(selectedUser);
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-150 z-30">
      <div className="flex items-center gap-2.5">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-1.5 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}
        <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md shadow-blue-100">
          <FileText className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold tracking-tight text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          DocFlow
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-gray-400" />
        <span className="text-xs text-gray-500 font-medium hidden sm:inline">Current User:</span>
        <select
          value={currentUser?.id || ''}
          onChange={handleUserChange}
          className="text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer hover:bg-gray-100 transition-all duration-200"
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
