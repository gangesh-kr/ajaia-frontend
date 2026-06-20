'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '../../utils/cn';
import { Document } from '../../types';
import { Badge } from '../ui/Badge';
import { FileText, Users, Trash2 } from 'lucide-react';
import { useDeleteDocument } from '../../hooks/useDeleteDocument';
import { useToast } from '../ui/Toast';

interface DocumentListItemProps {
  document: Document;
  isShared?: boolean;
  onClick?: () => void;
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHr / 24);

  if (diffSec < 10) {
    return 'Just now';
  } else if (diffSec < 60) {
    return `${diffSec}s ago`;
  } else if (diffMin < 60) {
    return `${diffMin}m ago`;
  } else if (diffHr < 24) {
    return `${diffHr}h ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
}

export function DocumentListItem({ document, isShared = false, onClick }: DocumentListItemProps) {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const isActive = params?.id === document.id;
  const { mutate: deleteDoc } = useDeleteDocument();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmDelete = window.confirm("Delete this document? This cannot be undone.");
    if (confirmDelete) {
      deleteDoc(document.id, {
        onSuccess: () => {
          showToast('Document deleted successfully', 'success');
          try {
            const lastId = localStorage.getItem('docflow_last_document_id');
            if (lastId === document.id) {
              localStorage.removeItem('docflow_last_document_id');
            }
          } catch (e) {
            console.error('LocalStorage access error:', e);
          }
          if (isActive) {
            router.push('/documents');
          }
        },
        onError: (err: any) => {
          const errMsg = err.response?.data?.error?.message || 'Failed to delete document';
          showToast(errMsg, 'error');
        }
      });
    }
  };

  return (
    <Link
      href={`/documents/${document.id}`}
      onClick={onClick}
      className={cn(
        'group flex items-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 border border-transparent cursor-pointer',
        isActive 
          ? 'bg-blue-50 border-l-2 border-l-blue-600 rounded-l-none text-blue-900 font-medium' 
          : 'hover:bg-gray-50 text-gray-700'
      )}
    >
      {isShared ? (
        <Users className={cn('h-4 w-4 shrink-0 mt-0.5', isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-655')} />
      ) : (
        <FileText className={cn('h-4 w-4 shrink-0 mt-0.5', isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-655')} />
      )}
      
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className="text-sm font-semibold truncate block">
          {document.title || 'Untitled Document'}
        </span>
        <div className="flex flex-col gap-0.5 text-xs text-gray-400">
          <span className="shrink-0">{formatRelativeTime(document.updated_at)}</span>
          {isShared && document.owner_name && (
            <span className="truncate max-w-[150px] font-medium" title={document.owner_name}>
              By {document.owner_name}
            </span>
          )}
        </div>
      </div>
      
      {isShared ? (
        <Badge
          variant={document.role === 'editor' ? 'blue' : 'gray'}
          className="shrink-0 text-[10px] py-0 px-1 capitalize"
        >
          {document.role || 'viewer'}
        </Badge>
      ) : (
        <button
          onClick={handleDelete}
          type="button"
          title="Delete document"
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-red-650 transition-all shrink-0 self-center"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </Link>
  );
}
