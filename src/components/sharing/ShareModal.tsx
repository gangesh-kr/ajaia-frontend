'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useShares } from '../../hooks/useShares';
import { useAddShare } from '../../hooks/useAddShare';
import { useUser } from '../../context/UserContext';
import { Document } from '../../types';
import { useToast } from '../ui/Toast';
import { UserPlus, Loader2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
}

export function ShareModal({ isOpen, onClose, document }: ShareModalProps) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');
  const [errorText, setErrorText] = useState('');
  
  const { users } = useUser();
  const { showToast } = useToast();
  const { data: shares, isLoading: loadingShares } = useShares(document.id);
  const { mutate: addShare, isPending: addingShare } = useAddShare();

  const sharedUserIds = new Set(shares?.map((s) => s.user_id) || []);
  const availableUsers = users.filter(
    (user) => user.id !== document.owner_id && !sharedUserIds.has(user.id)
  );

  const handleGrantAccess = () => {
    setErrorText('');
    if (!selectedUserId) {
      setErrorText('Please select a user');
      return;
    }

    addShare(
      { documentId: document.id, userId: selectedUserId, role },
      {
        onSuccess: () => {
          showToast('Access granted successfully!', 'success');
          setSelectedUserId('');
          setRole('viewer');
        },
        onError: (err: any) => {
          const status = err.response?.status;
          const errMsg = err.response?.data?.error?.message || 'Failed to grant access';
          
          if (status === 409) {
            setErrorText('This user already has access');
          } else {
            setErrorText(errMsg);
          }
          showToast('Failed to share document', 'error');
        }
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Document">
      <div className="flex flex-col gap-6">
        {/* Section 1: Shared with */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Shared with
          </h4>
          {loadingShares ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              Loading shared users...
            </div>
          ) : shares && shares.length > 0 ? (
            <div className="flex flex-col gap-2.5 max-h-[160px] overflow-y-auto pr-1">
              {shares.map((share) => (
                <div key={share.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50">
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-gray-800 truncate">{share.name}</span>
                    <span className="text-xs text-gray-400 truncate">{share.email}</span>
                  </div>
                  <Badge variant={share.role === 'editor' ? 'blue' : 'gray'} className="shrink-0 capitalize">
                    {share.role || 'viewer'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic py-2">
              Not shared with anyone yet
            </p>
          )}
        </div>

        {/* Section 2: Add people */}
        <div className="border-t border-gray-100 pt-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Add people
          </h4>
          
          {availableUsers.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <select
                  value={selectedUserId}
                  onChange={(e) => {
                    setSelectedUserId(e.target.value);
                    setErrorText('');
                  }}
                  className="flex-1 text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                >
                  <option value="">Select a user...</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>

                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'viewer' | 'editor')}
                  className="w-[100px] text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                </select>
                
                <Button 
                  onClick={handleGrantAccess} 
                  isLoading={addingShare}
                  className="shrink-0 font-semibold"
                >
                  <UserPlus className="h-4 w-4 mr-1.5" />
                  Grant
                </Button>
              </div>

              <span className="text-[11px] text-gray-400">
                {role === 'viewer' 
                  ? 'Viewer: Can view and export the document but cannot edit.' 
                  : 'Editor: Can view, edit, and export the document.'}
              </span>
              
              {errorText && (
                <span className="text-xs font-medium text-red-655 animate-in fade-in duration-200">
                  {errorText}
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">
              All seeded users already have access to this document.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
